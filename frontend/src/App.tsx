import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import WelcomePage from './pages/WelcomePage';
import StudentOnboarding from './pages/StudentOnboarding';
import TeacherOnboarding from './pages/TeacherOnboarding';
import StudentPollView from './pages/StudentPollView';
import TeacherPollView from './pages/TeacherPollView';
import PollHistory from './pages/PollHistory';
import WaitingScreen from './pages/WaitingScreen';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/student/onboarding" element={<StudentOnboarding />} />
          <Route path="/teacher/onboarding" element={<TeacherOnboarding />} />
          <Route path="/student/poll" element={<StudentPollView />} />
          <Route path="/teacher/poll" element={<TeacherPollView />} />
          <Route path="/teacher/history" element={<PollHistory />} />
          <Route path="/student/waiting" element={<WaitingScreen />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;

