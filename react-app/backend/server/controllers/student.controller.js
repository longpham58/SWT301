const XLSX = require("xlsx");
const { query } = require("../db");
const memoryDB = require("../data/memory.store");

// Map recordset -> shape cho StudentListPage
function mapStudentRow(row) {
  return {
    id: String(row.student_code),
    className: row.class_code || "",
    gender: row.gender || "Other",
    name: row.full_name,
    academicYear: row.year_code || "",
  };
}

// Safe id from recordset (node-mssql may return multiple result sets; avoid recordset[0] undefined)
function getIdFromRecordset(recordset) {
  if (!recordset || !recordset[0]) return null;
  const id = recordset[0].id;
  return id != null ? Number(id) : null;
}

// Parse one Excel row into student shape for frontend/memory
function parseStudentRow(row) {
  const studentCode =
    row.student_code ||
    row.studentCode ||
    row.id ||
    row.ID ||
    row["Student ID"];
  if (!studentCode) return null;
  return {
    id: String(studentCode),
    name: row.full_name || row.name || row.Name || row["Name"] || "",
    className: row.className || row.Class || row["Class"] || "",
    gender: row.gender || row.Gender || "Other",
    academicYear:
      row.academicYear != null
        ? String(row.academicYear || row["Academic Year"] || "")
        : "",
  };
}

// GET /api/students — khi DB lỗi trả 200 + danh sách memory, không trả 500
exports.getStudents = async (req, res) => {
  try {
    const result = await query(
      `
      SELECT
        s.student_code,
        s.full_name,
        s.gender,
        c.class_code,
        ay.year_code
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN academic_years ay ON s.academic_year_id = ay.id
      ORDER BY s.student_code;
      `
    );
    const rows = (result.recordset || []).map(mapStudentRow);
    return res.json(rows);
  } catch (error) {
    console.error("getStudents error (fallback memory):", error.message);
    try {
      const list = memoryDB && Array.isArray(memoryDB.students) ? memoryDB.students : [];
      return res.status(200).json(list);
    } catch (fallbackErr) {
      console.error("getStudents fallback error:", fallbackErr.message);
      return res.status(200).json([]);
    }
  }
};

// POST /api/students/import
exports.importStudents = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  let workbook;
  try {
    workbook = XLSX.read(req.file.buffer, { type: "buffer" });
  } catch (parseErr) {
    console.error("importStudents parse Excel:", parseErr.message);
    return res.status(400).json({ message: "Invalid Excel file" });
  }

  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  try {
    let imported = 0;

    for (const row of rows) {
      const studentCode =
        row.student_code ||
        row.studentCode ||
        row.id ||
        row.ID ||
        row["Student ID"];
      if (!studentCode) continue;

      const fullName =
        row.full_name || row.name || row.Name || row["Name"] || "";
      const classCode = row.className || row.Class || row["Class"] || "";
      const gender = row.gender || row.Gender || "Other";
      const yearCodeStr =
        row.academicYear != null
          ? String(row.academicYear || row["Academic Year"] || "").trim()
          : null;

      let academicYearId = null;
      if (yearCodeStr) {
        await query(
          `INSERT INTO academic_years (year_code)
           SELECT @year_code
           WHERE NOT EXISTS (SELECT 1 FROM academic_years WHERE year_code = @year_code);`,
          { year_code: String(yearCodeStr) }
        );
        const ayResult = await query(
          `SELECT TOP 1 id FROM academic_years WHERE year_code = @year_code;`,
          { year_code: String(yearCodeStr) }
        );
        academicYearId = getIdFromRecordset(ayResult.recordset);
      }

      let classId = null;
      if (classCode) {
        await query(
          `INSERT INTO classes (class_code, class_name, academic_year_id)
           SELECT @class_code, @class_name, @academic_year_id
           WHERE NOT EXISTS (SELECT 1 FROM classes WHERE class_code = @class_code);`,
          {
            class_code: String(classCode),
            class_name: String(classCode),
            academic_year_id: academicYearId,
          }
        );
        const clsResult = await query(
          `SELECT TOP 1 id FROM classes WHERE class_code = @class_code;`,
          { class_code: String(classCode) }
        );
        classId = getIdFromRecordset(clsResult.recordset);
      }

      await query(
        `
        IF EXISTS (SELECT 1 FROM students WHERE student_code = @student_code)
        BEGIN
          UPDATE students
          SET full_name = @full_name,
              gender = @gender,
              class_id = @class_id,
              academic_year_id = @academic_year_id,
              updated_at = SYSDATETIME()
          WHERE student_code = @student_code;
        END
        ELSE
        BEGIN
          INSERT INTO students (
            student_code, full_name, gender, class_id, academic_year_id
          )
          VALUES (
            @student_code, @full_name, @gender, @class_id, @academic_year_id
          );
        END
        `,
        {
          student_code: String(studentCode),
          full_name: fullName || String(studentCode),
          gender: String(gender),
          class_id: classId,
          academic_year_id: academicYearId,
        }
      );

      imported += 1;
    }

    return res.json({ message: `Imported ${imported} students` });
  } catch (error) {
    console.error("importStudents error (fallback memory):", error.message);
    try {
      if (!Array.isArray(memoryDB.students)) memoryDB.students = [];
      const list = memoryDB.students;
      let imported = 0;
      for (const row of rows) {
        const student = parseStudentRow(row);
        if (!student) continue;
        const item = {
          id: student.id,
          name: student.name || student.id,
          className: student.className || "",
          gender: student.gender || "Other",
          academicYear: student.academicYear || "",
        };
        const idx = list.findIndex((s) => s.id === student.id);
        if (idx >= 0) list[idx] = item;
        else list.push(item);
        imported += 1;
      }
      return res.status(200).json({
        message: `Imported ${imported} students (saved in memory; database unavailable)`,
      });
    } catch (fallbackErr) {
      console.error("importStudents fallback error:", fallbackErr.message);
      return res.status(200).json({ message: "Import failed; database unavailable." });
    }
  }
};

// DELETE /api/students/:id  (id = student_code)
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Missing id" });
    }

    const result = await query(
      "DELETE FROM students WHERE student_code = @student_code;",
      { student_code: id }
    );
    const rows = result.rowsAffected && result.rowsAffected[0];
    if (!rows) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("deleteStudent error", error);
    res.status(500).json({ message: "Error deleting student" });
  }
};

// GET /api/students/export
exports.exportStudents = async (req, res) => {
  try {
    const result = await query(
      `
      SELECT
        s.student_code,
        s.full_name,
        s.gender,
        c.class_code,
        ay.year_code
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN academic_years ay ON s.academic_year_id = ay.id
      ORDER BY s.student_code;
      `
    );
    const rows = (result.recordset || []).map((r) => ({
      "Student ID": r.student_code,
      Name: r.full_name,
      Gender: r.gender,
      Class: r.class_code,
      "Academic Year": r.year_code,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=students.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(buffer);
  } catch (error) {
    console.error("exportStudents error", error);
    res.status(500).json({ message: "Error exporting students" });
  }
};