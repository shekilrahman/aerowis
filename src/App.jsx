import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Student from "./pages/Student/Student";
import Instructors from "./pages/Instructors/Instructors";
import Course from "./pages/Course/Course";
import Exams from "./pages/Exams/Exams";
import Exam from "./pages/Exams/Exam";
import "./App.css";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Student/:reg_no" element={<Student />} />
        <Route path="/Instructors" element={<Instructors />} />
        <Route path="/Course" element={<Course />} />
        <Route path="/Exams" element={<Exams />} />
        <Route path="/Exams/:exam_id" element={<Exam />} />
      </Routes>
    </Router>
  );
}

export default App;
