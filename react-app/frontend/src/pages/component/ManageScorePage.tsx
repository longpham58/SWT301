import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getScores,
  updateScore,
  exportScores,
} from "../../services/scoreApi";
import "../../styles/managescore.css";

type Score = {
  studentId: string;
  studentName: string;
  subject: string;
  score?: number;
};

function ManageScorePage() {
  const { t } = useTranslation();

  const [scores, setScores] = useState<Score[]>([]);
  const [selected, setSelected] = useState<Score | null>(null);
  const [subjectFilter, setSubjectFilter] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const loadScores = async () => {
    try {
      const data = await getScores();
      setScores(data);
    } catch (err) {
      console.error(err);
      showToast(t("manageScore.loadError"));
    }
  };

  useEffect(() => {
    loadScores();
  }, []);

  /* =============================
     UNIQUE SUBJECTS
  ============================== */
  const uniqueSubjects = useMemo(() => {
    const subjects = scores.map((s) => s.subject).filter(Boolean);
    return Array.from(new Set(subjects));
  }, [scores]);

  /* =============================
     FILTERED LIST
  ============================== */
  const filtered = useMemo(() => {
    if (!subjectFilter) return scores;

    return scores.filter((s) =>
      s.subject?.toLowerCase().includes(subjectFilter.toLowerCase())
    );
  }, [scores, subjectFilter]);

  /* =============================
     SAVE SCORE
  ============================== */
  const handleSave = async () => {
    if (!selected) return;

    try {
      await updateScore(selected.studentId, Number(selected.score));

      await loadScores();

      setSelected(null);

      showToast(t("manageScore.updateSuccess"));
    } catch (err) {
      console.error(err);
      showToast(t("manageScore.updateFail"));
    }
  };

  /* =============================
     EXPORT SCORES
  ============================== */
  const handleExport = async () => {
    let url = "";

    try {
      const blob = await exportScores();

      url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "scores.xlsx";

      document.body.appendChild(link);
      link.click();

      link.remove();

      showToast(t("manageScore.exportSuccess"));
    } catch (err) {
      console.error(err);
      showToast(t("manageScore.exportFail"));
    } finally {
      if (url) window.URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="score-manage-page">
      <div className="score-manage-grid">

        {/* LEFT SIDE */}
        <div className="score-left">

          <div className="student-header">

            <span className="pill primary">
              {t("manageScore.title")}
            </span>

            <div style={{ display: "flex", gap: 10 }}>

              {/* SUBJECT FILTER */}
              <div className="subject-filter">
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                >
                  <option value="">
                    {t("manageScore.allSubjects")}
                  </option>

                  {uniqueSubjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}

                </select>
              </div>

              {/* EXPORT BUTTON */}
              <button
                className="export-btn"
                onClick={handleExport}
              >
                {t("manageScore.exportBtn")}
              </button>

            </div>
          </div>

          {/* TABLE */}
          <div className="student-table-wrap">

            <table className="student-table">

              <thead>
                <tr>
                  <th>{t("manageScore.colStudentId")}</th>
                  <th>{t("manageScore.colName")}</th>
                  <th>{t("manageScore.colSubject")}</th>
                  <th>{t("manageScore.colScore")}</th>
                </tr>
              </thead>

              <tbody>

                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center" }}>
                      {t("manageScore.noData")}
                    </td>
                  </tr>
                ) : (

                  filtered.map((s) => (
                    <tr
                      key={s.studentId}
                      className={
                        selected?.studentId === s.studentId
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setSelected({ ...s })  // FIX clone object
                      }
                    >
                      <td>{s.studentId}</td>
                      <td>{s.studentName}</td>
                      <td>{s.subject}</td>
                      <td>{s.score ?? "-"}</td>
                    </tr>
                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* RIGHT PANEL */}
        <div className="score-panel">

          <div className="video-box">
            📷
          </div>

          {selected ? (

            <div className="detail-card">

              <div className="detail-fields">

                <div className="form-row">
                  <label>{t("manageScore.colStudentId")}</label>
                  <div>{selected.studentId}</div>
                </div>

                <div className="form-row">
                  <label>{t("manageScore.colName")}</label>
                  <div>{selected.studentName}</div>
                </div>

                <div className="form-row">
                  <label>{t("manageScore.colSubject")}</label>
                  <div>{selected.subject}</div>
                </div>

                <div className="form-row">
                  <label>{t("manageScore.colScore")}</label>

                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={selected.score ?? ""}
                    onChange={(e) =>
                      setSelected({
                        ...selected,
                        score:
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                  />

                </div>

              </div>

              <div className="detail-actions">

                <button
                  className="btn primary"
                  onClick={handleSave}
                >
                  Lưu điểm
                </button>

              </div>

            </div>

          ) : (

            <div>
              {t("manageScore.selectStudentHint")}
            </div>

          )}

        </div>

      </div>

      {toast && (
        <div className="toast-notice">
          {toast}
        </div>
      )}

    </div>
  );
}

export { ManageScorePage };