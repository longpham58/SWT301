import { useMemo, useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  getStudents,
  importStudents,
  deleteStudent,
  exportStudents,
} from "../../services/studentApi";
import "../../styles/studentlist.css";

type Student = {
  id: string;
  className: string;
  gender: string;
  name: string;
  birthday?: string;
  address?: string;
  mail?: string;
  academicYear?: string;
};

function StudentListPage() {
  const { t } = useTranslation();
  const [students, setStudents] = useState<Student[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const [query, setQuery] = useState({
    class: "",
    name: "",
    studentId: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  const loadStudents = async () => {
    try {
      const data = await getStudents();
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("[StudentList] loadStudents error:", error);
      setStudents([]);
      showToast(error instanceof Error ? error.message : t("studentList.loadError"));
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleFileImport = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await importStudents(file);
      await loadStudents();
      showToast(t("studentList.importSuccess", { fileName: file.name }));
    } catch (error) {
      console.error("[StudentList] import error:", error);
      const msg = error instanceof Error ? error.message : t("studentList.importFail");
      showToast(msg);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteStudent(id);
      await loadStudents();
      showToast(t("studentList.deleteSuccess"));
    } catch (error) {
      console.error(error);
      showToast(t("studentList.deleteFail"));
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportStudents();

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "students.xlsx");
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

      showToast(t("studentList.exportSuccess"));
    } catch (error) {
      console.error(error);
      showToast(t("studentList.exportFail"));
    }
  };

  const uniqueSubjects = useMemo(() => {
    const subjects = students.map((s) => s.className).filter(Boolean);
    return Array.from(new Set(subjects)).sort();
  }, [students]);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchClass = query.class
        ? s.className?.toLowerCase().includes(query.class.toLowerCase())
        : true;

      const matchName = query.name
        ? s.name?.toLowerCase().includes(query.name.toLowerCase())
        : true;

      const matchId = query.studentId
        ? s.id?.toLowerCase().includes(query.studentId.toLowerCase())
        : true;

      return matchClass && matchName && matchId;
    });
  }, [students, query]);

  return (
    <div className="student-list-page">
      {/* HEADER */}
      <div className="student-header">
        <span className="pill">{t("studentList.title")}</span>

        <div className="header-actions">
          <button
            className="btn primary"
            onClick={() => fileInputRef.current?.click()}
          >
            {t("studentList.importExcel")}
          </button>

          <button className="btn" onClick={handleExport}>
            {t("studentList.exportExcel")}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            hidden
            onChange={handleFileImport}
          />
        </div>
      </div>

      {/* SEARCH */}
      <div className="student-search">
        <div className="search-box">
          <div className="search-row">
            <label>{t("studentList.colClass")}</label>
            <select
              value={query.class}
              onChange={(e) =>
                setQuery({ ...query, class: e.target.value })
              }
            >
              <option value="">{t("common.all")}</option>
              {uniqueSubjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div className="search-row">
            <label>{t("studentList.colName")}</label>
            <input
              value={query.name}
              onChange={(e) =>
                setQuery({ ...query, name: e.target.value })
              }
            />
          </div>

          <div className="search-row">
            <label>{t("studentList.colStudentId")}</label>
            <input
              value={query.studentId}
              onChange={(e) =>
                setQuery({ ...query, studentId: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="student-table-wrap">
        <table className="student-table">
          <thead>
            <tr>
              <th>{t("studentList.colStudentId")}</th>
              <th>{t("studentList.colClass")}</th>
              <th>{t("studentList.colGender")}</th>
              <th>{t("studentList.colName")}</th>
              <th>{t("studentList.colAcademicYear")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty">
                  {t("studentList.noStudents")}
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.className}</td>
                  <td>{s.gender}</td>
                  <td>{s.name}</td>
                  <td>{s.academicYear}</td>
                  <td>
                    <button
                      className="btn tiny danger"
                      onClick={() => handleDelete(s.id)}
                    >
                      {t("common.delete")}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* TOAST */}
      {toast && (
        <div className="toast-notice">
          {toast}
        </div>
      )}
    </div>
  );
}

export { StudentListPage };