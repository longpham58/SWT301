const { sql, poolPromise } = require("../db");


// =============================
// GET ALL EXAMS
// =============================

exports.getAllExams = async (req, res) => {

  try {

    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT 
        e.id AS id,
        e.exam_code AS examCode,
        c.class_code AS classCode,
        e.start_time AS startTime,
        e.end_time AS endTime,
        ISNULL(es.room_count,0) AS roomCount
      FROM exams e
      LEFT JOIN classes c ON e.class_id = c.id
      LEFT JOIN exam_settings es ON e.id = es.exam_id
    `);

    res.json(result.recordset);

  } catch (err) {

    console.error("getAllExams error:", err);

    res.status(500).json({
      message: "Database error",
      error: err.message
    });

  }

};


// =============================
// GET EXAM DETAIL
// =============================

exports.getExamDetail = async (req, res) => {

  try {

    const { examId } = req.params;
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("examId", sql.Int, examId)
      .query(`
        SELECT 
          e.id AS id,
          e.exam_code AS examCode,
          c.class_code AS classCode,
          e.start_time AS startTime,
          e.end_time AS endTime,
          ISNULL(es.room_count,0) AS roomCount
        FROM exams e
        LEFT JOIN classes c ON e.class_id = c.id
        LEFT JOIN exam_settings es ON e.id = es.exam_id
        WHERE e.id = @examId
      `);

    if (!result.recordset.length) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.json(result.recordset[0]);

  } catch (err) {

    console.error("getExamDetail error:", err);

    res.status(500).json({
      message: "Database error",
      error: err.message
    });

  }

};



// =============================
// NEW: GENERATE ROOMS
// =============================

exports.generateRooms = async (req, res) => {

  try {

    const { examId } = req.params;
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("examId", sql.Int, examId)
      .query(`
        SELECT 
          e.id AS id,
          ISNULL(es.room_count,0) AS roomCount
        FROM exams e
        LEFT JOIN exam_settings es ON e.id = es.exam_id
        WHERE e.id = @examId
      `);

    if (!result.recordset.length) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const exam = result.recordset[0];

    // LOGIC MỚI: tối đa 7 phòng
    const maxRooms = Math.min(exam.roomCount, 7);

    const rooms = [];

    for (let i = 1; i <= maxRooms; i++) {

      rooms.push({
        id: i,
        roomName: `Room_${i}`,
        invigilator: "",
        student: "",
        studentId: ""
      });

    }

    res.json(rooms);

  } catch (err) {

    console.error("generateRooms error:", err);

    res.status(500).json({
      message: "Database error",
      error: err.message
    });

  }

};