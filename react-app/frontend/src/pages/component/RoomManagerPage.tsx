import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getAllExams,
  generateRooms,
  Exam,
  Room
} from "../../services/roomApi";

import "../../styles/RoomManagerPage.css";

export default function RoomManagerPage() {
  const { t } = useTranslation();
  const [exams, setExams] = useState<Exam[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const data = await getAllExams();
      setExams(data);
    } catch (err) {
      console.error(err);
    }
  };

  const openExam = async (examId: number) => {
    try {

      const generatedRooms = await generateRooms(examId);

      setRooms(generatedRooms);

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="room-manager-page">

      {/* LEFT : ROOM GRID */}

      <div className="room-manager">

        {rooms.length === 0 && (
          <div className="empty-message">
            {t("roomManager.emptyMessageHint")}
          </div>
        )}

        {rooms.map((room) => (
          <div
            key={room.id}
            className="room-block"
            onClick={() => setSelectedRoom(room)}
          >

            <h3>{room.roomName}</h3>

            <div className="camera">📷</div>

            <div className="room-info">
              <span>{t("roomManager.invigilator")}: {room.invigilator || "-"}</span>
              <span>{t("roomManager.student")}: {room.student || "-"}</span>
              <span>{t("roomManager.id")}: {room.studentId || "-"}</span>
            </div>

          </div>
        ))}

      </div>


      {/* RIGHT PANEL */}

      <div className="right-panel">

        {/* EXAM TABLE */}

        <div className="room-board">

          <table className="room-board-table">

            <thead>
              <tr>
                <th>{t("roomManager.colExamCode")}</th>
                <th>{t("roomManager.colSubjectCode")}</th>
                <th>{t("roomManager.colTime")}</th>
                <th>{t("roomManager.colRoomCount")}</th>
                <th>{t("common.actions")}</th>
              </tr>
            </thead>

            <tbody>

              {exams.map((exam) => (
                <tr key={exam.id}>

                  <td>{exam.examCode}</td>
                  <td>{exam.classCode}</td>
                  <td>{exam.startTime} - {exam.endTime}</td>
                  <td>{exam.roomCount}</td>

                  <td>
                    <button
                      type="button"
                      className="btn-open"
                      onClick={() => openExam(exam.id)}
                    >
                      {t("roomManager.open")}
                    </button>
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>


        {/* STATUS PANEL */}

        <div className="room-status">

          <div className="status-header">
            {t("roomManager.statusTitle")}
          </div>

          <div className="status-body">
            <ul>
              <li className="status-empty">{t("roomManager.statusEmpty")}: </li>
              <li className="status-scheduled">{t("roomManager.statusWaiting")}: </li>
              <li className="status-running">{t("roomManager.statusInProgress")}: </li>
              <li className="status-locked">{t("roomManager.statusInactive")}: </li>
            </ul>
          </div>

        </div>  

      </div>


      {/* POPUP MODAL */}

      {selectedRoom && (

        <div
          className="modal-overlay"
          onClick={() => setSelectedRoom(null)}
        >

          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="modal-body">

              <h3>{selectedRoom.roomName}</h3>

              <div className="camera">📷</div>

              <p>{t("roomManager.invigilator")}: {selectedRoom.invigilator || "-"}</p>
              <p>{t("roomManager.student")}: {selectedRoom.student || "-"}</p>
              <p>{t("roomManager.id")}: {selectedRoom.studentId || "-"}</p>

              <div className="time-counter">

                <span className="time-counter-label">
                  {t("roomManager.time")}
                </span>

                <span className="time-counter-value">
                  00:00:00
                </span>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export { RoomManagerPage };