import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage/LoginPage";
import StudentPage from "./pages/StudentPage/ListenerPage";
import MonitoringPage from "./pages/MonitorPage/MonitoringPage";
import SessionsPage from "./pages/SessionsPage/SessionsPage";
import ArchivePage from "./pages/ArchivePage/ArchivePage";
import RecorderPage from "./pages/RecorderPage/RecorderPage";
import HomePage from "./pages/HomePage/HomePage";
import AdminPage from "./pages/AdminPage/AdminPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin" element={<HomePage />} />
        {/* <Route path="/admin" element={<AdminPage />} /> KD-systems */}
        <Route path="/listener" element={<StudentPage />} /> {/* Студент */}
        <Route path="/monitor" element={<MonitoringPage />} /> {/* Мониторинг */}
        <Route path="/recorder" element={<RecorderPage />} /> {/* Лектор */}
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/archive_viewer" element={<ArchivePage />} /> {/* Архи сессий */}
        <Route path="*" element={<Navigate to="/" />} /> {/* Редирект на главную, если страница не найдена */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;