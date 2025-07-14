import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage/LoginPage";
import StudentPage from "./pages/ListenerPage/ListenerPage";
import MonitoringPage from "./pages/MonitorPage/MonitoringPage";
import SessionsPage from "./pages/SessionsPage/SessionsPage";
import ArchivePage from "./pages/ArchivePage/ArchivePage";
import AdminPage from "./pages/AdminPage/AdminPage";
import LectureViewer from "./pages/LectureViewer/LectureViewer";
import ActiveLecturesPage from "./pages/ActiveLectures/ActiveLecturesPage";
import LectorPage from "./pages/LectorPage/LectorPage";
import FullLecturePage from "./pages/FullLecturePage/FullLecturePage";
import RecorderPage from "./pages/RecorderPage/RecorderPage";
import RecordingLecturePage from "./pages/RecorderPage/RecordingLecturePage";
import HomePage from "./pages/HomePage/HomePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        {/* <Route path="/admin" element={<AdminPage />} /> KD-systems */}
        <Route path="/listener" element={<StudentPage />} /> {/* Студент */}
        <Route path="/monitor" element={<MonitoringPage />} /> {/* Мониторинг */}
        <Route path="/lector" element={<LectorPage />} />
        <Route path="/lector/recorder" element={<RecorderPage />} /> {/* Лектор */}
        <Route path="/lector/recorder/recording" element={<RecordingLecturePage />} /> {/* Лектор */}
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/archive" element={<ArchivePage />} /> {/* Архив сессий */}
        <Route path="/archive/lecture/:id" element={<LectureViewer />} />
        <Route path="/archive/lecture/:id/full-lecture" element={<FullLecturePage />} />
        <Route path="/active" element={<ActiveLecturesPage />} />
        <Route path="/active/lecture/:id" element={<LectureViewer />} />
        <Route path="*" element={<Navigate to="/" />} /> {/* Редирект на главную, если страница не найдена */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;