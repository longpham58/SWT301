import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AccountExaminerPage } from './pages/component/AccountExaminerPage';
import { DashboardHomePage } from './pages/DashboardHomePage';
import { DashboardPage } from './pages/DashboardPage';
import { ExamSchedulePage } from './pages/component/ExamSchedulePage';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ManageScorePage } from './pages/component/ManageScorePage';
import { RoomManagerPage } from './pages/component/RoomManagerPage';
import { SetupExamPage } from './pages/component/SetupExamPage';
import { StudentListPage } from './pages/component/StudentListPage';
import { getToken } from './utils/auth.storage';

function LoginGuard() {
  const token = getToken();

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LoginPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginGuard />} />
        <Route path="/login/forgot" element={<ForgotPasswordPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHomePage />} />
          <Route path="account-examiner" element={<AccountExaminerPage />} />
          <Route path="students" element={<StudentListPage />} />
          <Route path="rooms" element={<RoomManagerPage />} />
          <Route path="setup-exam" element={<SetupExamPage />} />
          <Route path="exam-schedule" element={<ExamSchedulePage />} />
          <Route path="manage-score" element={<ManageScorePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
