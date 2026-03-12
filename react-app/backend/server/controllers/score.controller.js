const XLSX = require("xlsx");
const { query } = require("../db");

// GET scores
exports.getScores = async (req, res) => {
  try {

    const result = await query(`
      SELECT
        s.student_code,
        s.full_name,
        c.class_name,
        c.class_code,
        es.score
      FROM exam_scores es
      JOIN students s ON es.student_id = s.id
      JOIN classes c ON s.class_id = c.id
      ORDER BY c.class_code, s.student_code
    `);

    const rows = result.recordset.map((r) => ({
      studentId: r.student_code,
      studentName: r.full_name,
      subject: r.class_name,      // hiển thị
      subjectCode: r.class_code,  // code
      score: r.score
    }));

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Load scores error" });
  }
};


// GET subjects (for dropdown)
exports.getSubjects = async (req, res) => {

  try {

    const result = await query(`
      SELECT
        class_code,
        class_name
      FROM classes
      ORDER BY class_code
    `);

    res.json(result.recordset);

  } catch (err) {

    console.error(err);
    res.status(500).json({ message: "Load subjects error" });

  }

};


// UPDATE score
exports.updateScore = async (req, res) => {
  try {

    const { studentId } = req.params;
    const { score, subjectCode } = req.body;

    // lấy student id
    const student = await query(
      `SELECT id FROM students WHERE student_code=@code`,
      { code: studentId }
    );

    if (!student.recordset.length)
      return res.status(404).json({ message: "Student not found" });

    const studentDbId = student.recordset[0].id;

    // lấy class id từ class_code
    const cls = await query(
      `SELECT id FROM classes WHERE class_code=@code`,
      { code: subjectCode }
    );

    if (!cls.recordset.length)
      return res.status(404).json({ message: "Class not found" });

    const classId = cls.recordset[0].id;

    // update đúng record
    await query(
      `
      UPDATE exam_scores
      SET score=@score
      WHERE student_id=@studentId
      AND class_id=@classId
      `,
      {
        score: score,
        studentId: studentDbId,
        classId: classId,
      }
    );

    return exports.getScores(req, res);

  } catch (err) {

    console.error(err);
    res.status(500).json({ message: "Update score error" });

  }
};


// CLEAR scores
exports.clearScores = async (req, res) => {

  try {

    await query(`DELETE FROM exam_scores`);

    res.json({ message: "All scores deleted" });

  } catch (err) {

    console.error(err);
    res.status(500).json({ message: "Clear error" });

  }
};


// EXPORT scores
exports.exportScores = async (req, res) => {

  try {

    const result = await query(`
      SELECT
        s.student_code,
        s.full_name,
        c.class_name,
        c.class_code,
        es.score
      FROM exam_scores es
      JOIN students s ON es.student_id = s.id
      JOIN classes c ON s.class_id = c.id
      ORDER BY c.class_code, s.student_code
    `);

    const rows = result.recordset.map((r) => ({
      studentId: r.student_code,
      studentName: r.full_name,
      subject: r.class_name,
      subjectCode: r.class_code,
      score: r.score,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Scores");

    const buffer = XLSX.write(wb, {
      type: "buffer",
      bookType: "xlsx",
    });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=scores.xlsx"
    );

    res.send(buffer);

  } catch (err) {

    console.error(err);
    res.status(500).json({ message: "Export error" });

  }

};