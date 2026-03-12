const API = "/api/rooms";

export type Exam = {
  id: number;
  examCode: string;
  classCode: string;
  startTime: string;
  endTime: string;
  roomCount: number;
};

export type Room = {
  id: number;
  roomName: string;
  invigilator?: string;
  student?: string;
  studentId?: string;
};

/* ============================= */
/* GET ALL EXAMS */
/* ============================= */

export const getAllExams = async (): Promise<Exam[]> => {
  const res = await fetch(API);

  if (!res.ok) {
    throw new Error("Failed to fetch exams");
  }

  return res.json();
};

/* ============================= */
/* GET EXAM DETAIL */
/* ============================= */

export const getExamDetail = async (
  examId: number
): Promise<Exam> => {
  const res = await fetch(`${API}/${examId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch exam detail");
  }

  return res.json();
};

/* ============================= */
/* GENERATE ROOMS FROM BACKEND */
/* ============================= */

export const generateRooms = async (
  examId: number
): Promise<Room[]> => {

  const res = await fetch(`${API}/generate/${examId}`, {
    method: "POST"
  });

  if (!res.ok) {
    throw new Error("Failed to generate rooms");
  }

  return res.json();
};