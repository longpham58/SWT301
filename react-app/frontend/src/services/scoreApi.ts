const API = "/api/scores";

/* =========================
   GET ALL SCORES
========================= */
export const getScores = async () => {
  const res = await fetch(API);

  if (!res.ok) throw new Error("Failed to fetch scores");
  return await res.json();
};

/* =========================
   GET SUBJECTS (DROPDOWN)
========================= */
export const getSubjects = async () => {
  const res = await fetch(`${API}/subjects`);

  if (!res.ok) throw new Error("Failed to fetch subjects");
  return await res.json();
};

/* =========================
   UPDATE SCORE
========================= */
export const updateScore = async (
  studentId: string,
  score: number
) => {
  const res = await fetch(`${API}/${studentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ score }),
  });

  if (!res.ok) throw new Error("Update failed");
  return await res.json();
};


/* =========================
   CLEAR ALL SCORES
========================= */
export const clearScores = async () => {
  const res = await fetch(`${API}/clear`, {
    method: "POST",
  });

  if (!res.ok) throw new Error("Clear failed");
  return await res.json();
};

/* =========================
   EXPORT SCORES
========================= */
export const exportScores = async () => {
  const res = await fetch(`${API}/export`);

  if (!res.ok) throw new Error("Export failed");
  return await res.blob();
};