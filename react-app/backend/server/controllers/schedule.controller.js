const { query } = require("../db");

function mapStatusDbToUi(status) {
  switch (status) {
    case "draft":
      return "Nháp";
    case "scheduled":
      return "Đã lên lịch";
    case "running":
      return "Đang diễn ra";
    case "finished":
      return "Đã hoàn thành";
    case "cancelled":
      return "Khoá";
    default:
      return "Nháp";
  }
}

function mapStatusUiToDb(status) {
  switch (status) {
    case "Nháp":
      return "draft";
    case "Đã lên lịch":
      return "scheduled";
    case "Đang diễn ra":
      return "running";
    case "Đã hoàn thành":
      return "finished";
    case "Khoá":
      return "cancelled";
    default:
      return "draft";
  }
}

// GET /api/schedules
exports.getSchedules = async (req, res) => {
  try {
    const result = await query(
      `
      SELECT
        e.id,
        e.exam_code,
        s.subject_code,
        s.subject_name,
        et.type_name,
        es.start_at,
        es.end_at,
        es.room_count,
        e.status
      FROM exams e
      INNER JOIN subjects s ON e.subject_id = s.id
      INNER JOIN exam_types et ON e.exam_type_id = et.id
      LEFT JOIN exam_settings es ON es.exam_id = e.id
      ORDER BY es.start_at DESC, e.exam_code
      `
    );

    const rows = (result.recordset || []).map((r) => {
      const start = r.start_at;
      const end = r.end_at;
      let timeStr = "";
      if (start && end) {
        const pad = (n) => (n < 10 ? `0${n}` : String(n));
        const d = pad(start.getDate());
        const m = pad(start.getMonth() + 1);
        const y = start.getFullYear();
        const sh = pad(start.getHours());
        const sm = pad(start.getMinutes());
        const eh = pad(end.getHours());
        const em = pad(end.getMinutes());
        timeStr = `${d}/${m}/${y} ${sh}:${sm} - ${eh}:${em}`;
      }

      return {
        id: String(r.id),
        examCode: r.exam_code,
        subjectCode: `${r.subject_name} - ${r.subject_code}`,
        time: timeStr,
        roomCount: r.room_count || 0,
        examType: r.type_name,
        status: mapStatusDbToUi(r.status),
        startDateTime: r.start_at ? r.start_at.toISOString() : null,
        endDateTime: r.end_at ? r.end_at.toISOString() : null,
      };
    });

    res.json(rows);
  } catch (err) {
    console.error("getSchedules error", err);
    res.status(500).json({ message: "Error loading schedules" });
  }
};

// POST /api/schedules
exports.createSchedule = async (req, res) => {
  try {
    const body = req.body || {};
    const {
      examCode,
      subjectCode,
      time,
      startDateTime,
      endDateTime,
      roomCount,
      examType,
      status,
    } = body;

    if (!examCode || !subjectCode || !startDateTime || !endDateTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const subjectCodeTrim = String(subjectCode).split("-").pop().trim() || subjectCode;

    // Lấy hoặc tạo subject
    const subjectResult = await query(
      `
      IF EXISTS (SELECT 1 FROM subjects WHERE subject_code = @subject_code)
      BEGIN
        SELECT TOP 1 id, subject_code, subject_name FROM subjects WHERE subject_code = @subject_code;
      END
      ELSE
      BEGIN
        INSERT INTO subjects (subject_code, subject_name, credits)
        VALUES (@subject_code, @subject_name, 3);
        SELECT SCOPE_IDENTITY() AS id, @subject_code AS subject_code, @subject_name AS subject_name;
      END
      `,
      {
        subject_code: subjectCodeTrim,
        subject_name: subjectCodeTrim,
      }
    );
    const subjectRow = subjectResult.recordset[0];

    // Map examType text -> exam_types
    const typeName = examType || "Giữa kì";
    const typeCode = typeName === "Cuối kì" || typeName === "Cuối kỳ" ? "cuoi-ki" : "giua-ki";
    const examTypeResult = await query(
      `
      IF EXISTS (SELECT 1 FROM exam_types WHERE type_code = @type_code)
      BEGIN
        SELECT TOP 1 id, type_name FROM exam_types WHERE type_code = @type_code;
      END
      ELSE
      BEGIN
        INSERT INTO exam_types (type_code, type_name)
        VALUES (@type_code, @type_name);
        SELECT SCOPE_IDENTITY() AS id, @type_name AS type_name;
      END
      `,
      {
        type_code: typeCode,
        type_name: typeName,
      }
    );
    const examTypeRow = examTypeResult.recordset[0];

    const startAt = new Date(startDateTime);
    const endAt = new Date(endDateTime);
    const durationMinutes = Math.max(
      1,
      Math.round((endAt.getTime() - startAt.getTime()) / 60000)
    );

    const dbStatus = mapStatusUiToDb(status || "Nháp");

    // Tạo exam
    const examInsert = await query(
      `
      INSERT INTO exams (exam_code, subject_id, exam_type_id, title, status)
      VALUES (@exam_code, @subject_id, @exam_type_id, @title, @status);
      SELECT SCOPE_IDENTITY() AS id;
      `,
      {
        exam_code: examCode,
        subject_id: subjectRow.id,
        exam_type_id: examTypeRow.id,
        title: examCode,
        status: dbStatus,
      }
    );
    const examId = examInsert.recordset[0].id;

    // Tạo exam_settings
    await query(
      `
      INSERT INTO exam_settings (
        exam_id, start_at, end_at,
        wait_minutes, exam_minutes, break_minutes, duration_minutes,
        room_count, camera_count
      )
      VALUES (
        @exam_id, @start_at, @end_at,
        0, @exam_minutes, 0, @duration_minutes,
        @room_count, NULL
      );
      `,
      {
        exam_id: examId,
        start_at: startAt,
        end_at: endAt,
        exam_minutes: durationMinutes,
        duration_minutes: durationMinutes,
        room_count: Number(roomCount) || 0,
      }
    );

    const createdRow = {
      id: String(examId),
      examCode,
      subjectCode,
      time,
      roomCount: Number(roomCount) || 0,
      examType: examTypeRow.type_name,
      status: mapStatusDbToUi(dbStatus),
      startDateTime,
      endDateTime,
    };

    res.status(201).json(createdRow);
  } catch (err) {
    console.error("createSchedule error", err);
    res.status(500).json({ message: "Error creating schedule" });
  }
};

// PUT /api/schedules/:id
exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const examId = Number(id);
    if (!Number.isFinite(examId)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    // Kiểm tra tồn tại
    const existing = await query(
      `
      SELECT TOP 1 e.id, es.start_at, es.end_at
      FROM exams e
      LEFT JOIN exam_settings es ON es.exam_id = e.id
      WHERE e.id = @id
      `,
      { id: examId }
    );
    if (!existing.recordset.length) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    const updates = [];
    const params = { id: examId };

    if (body.examCode) {
      updates.push("exam_code = @exam_code");
      params.exam_code = body.examCode;
    }

    if (body.status) {
      updates.push("status = @status");
      params.status = mapStatusUiToDb(body.status);
    }

    if (updates.length) {
      await query(
        `UPDATE exams SET ${updates.join(", ")} WHERE id = @id;`,
        params
      );
    }

    if (body.startDateTime || body.endDateTime || body.roomCount != null) {
      const startAt = body.startDateTime
        ? new Date(body.startDateTime)
        : existing.recordset[0].start_at;
      const endAt = body.endDateTime
        ? new Date(body.endDateTime)
        : existing.recordset[0].end_at;
      const durationMinutes = Math.max(
        1,
        Math.round((endAt.getTime() - startAt.getTime()) / 60000)
      );
      await query(
        `
        UPDATE exam_settings
        SET start_at = @start_at,
            end_at = @end_at,
            exam_minutes = @exam_minutes,
            duration_minutes = @duration_minutes,
            room_count = ISNULL(@room_count, room_count)
        WHERE exam_id = @id;
        `,
        {
          id: examId,
          start_at: startAt,
          end_at: endAt,
          exam_minutes: durationMinutes,
          duration_minutes: durationMinutes,
          room_count:
            body.roomCount != null ? Number(body.roomCount) : null,
        }
      );
    }

    // Trả lại dữ liệu mới
    return exports.getSchedules(req, res);
  } catch (err) {
    console.error("updateSchedule error", err);
    res.status(500).json({ message: "Error updating schedule" });
  }
};

// DELETE /api/schedules/:id
exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const examId = Number(id);
    if (!Number.isFinite(examId)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const result = await query(
      "DELETE FROM exams WHERE id = @id;",
      { id: examId }
    );
    const rows = result.rowsAffected && result.rowsAffected[0];
    if (!rows) {
      return res.status(404).json({ message: "Schedule not found" });
    }
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("deleteSchedule error", err);
    res.status(500).json({ message: "Error deleting schedule" });
  }
};
