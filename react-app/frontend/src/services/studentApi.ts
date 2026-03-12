const API_BASE = typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL
  ? String(import.meta.env.VITE_API_BASE_URL).replace(/\/$/, "")
  : "";
const API = `${API_BASE}/api/students`;

async function parseJsonOrEmpty<T>(res: Response): Promise<T | Record<string, unknown>> {
  const text = await res.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as T;
  } catch {
    return {};
  }
}

/**
 * GET /api/students
 * On 5xx/4xx: throws with server message if body is JSON, else generic message.
 * On network error: throws. Caller should catch and set students to [] and show toast.
 */
export const getStudents = async (): Promise<Array<{ id: string; name: string; className: string; gender: string; academicYear?: string }>> => {
  let res: Response;
  try {
    res = await fetch(API);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Network error";
    throw new Error(msg);
  }

  const data = await parseJsonOrEmpty(res);
  if (!res.ok) {
    const message = (data && typeof data === "object" && "message" in data && typeof data.message === "string")
      ? data.message
      : `Failed to load students (${res.status})`;
    throw new Error(message);
  }

  if (Array.isArray(data)) return data as Array<{ id: string; name: string; className: string; gender: string; academicYear?: string }>;
  if (data && typeof data === "object" && Array.isArray((data as { recordset?: unknown }).recordset)) {
    return (data as { recordset: Array<{ id: string; name: string; className: string; gender: string; academicYear?: string }> }).recordset;
  }
  return [];
};

/**
 * POST /api/students/import
 * FormData with field "file" (Excel). Do not set Content-Type; browser sets multipart/form-data.
 */
export const importStudents = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  let res: Response;
  try {
    res = await fetch(`${API}/import`, {
      method: "POST",
      body: formData,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Network error";
    throw new Error(msg);
  }

  const data = await parseJsonOrEmpty(res);
  if (!res.ok) {
    const message = (data && typeof data === "object" && "message" in data && typeof (data as { message: string }).message === "string")
      ? (data as { message: string }).message
      : `Import failed (${res.status})`;
    throw new Error(message);
  }
  return data;
};

// DELETE
export const deleteStudent = async (id: string) => {
  let res: Response;
  try {
    res = await fetch(`${API}/${encodeURIComponent(id)}`, { method: "DELETE" });
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Delete failed");
  }
  const data = await parseJsonOrEmpty(res);
  if (!res.ok) {
    const message = (data && typeof data === "object" && "message" in data && typeof (data as { message: string }).message === "string")
      ? (data as { message: string }).message
      : "Delete failed";
    throw new Error(message);
  }
  return data;
};

// EXPORT
export const exportStudents = async (): Promise<Blob> => {
  let res: Response;
  try {
    res = await fetch(`${API}/export`);
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Export failed");
  }
  if (!res.ok) {
    const data = await parseJsonOrEmpty(res);
    const message = (data && typeof data === "object" && "message" in data && typeof (data as { message: string }).message === "string")
      ? (data as { message: string }).message
      : "Export failed";
    throw new Error(message);
  }
  return res.blob();
};