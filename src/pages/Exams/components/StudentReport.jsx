import logo from "../../../assets/logo_dark_crop.png";
import dayjs from "dayjs";

export default function StudentReport({ exam, student }) {
  return (
    <div
      style={{
        width: "794px", // A4 width at 96dpi
        minHeight: "1123px",
        padding: "50px 60px",
        backgroundColor: "#fff",
        color: "#121244",
        fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
        fontSize: "12pt",
        lineHeight: 1.6,
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        borderBottom: "1px solid #ccc",
        paddingBottom: "20px",
        marginBottom: "40px"
      }}>
        <img src={logo} alt="logo" width={140} />
        <div style={{ textAlign: "right", fontSize: "10pt", color: "#555" }}>
          <p><strong>Date:</strong> {dayjs().format("MMMM D, YYYY")}</p>
          <p><strong>Ref:</strong> {exam.exam_id}-{student.student_id}</p>
        </div>
      </div>

      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ margin: 0, fontSize: "22pt", fontWeight: "bolder", letterSpacing: "0.5px", textTransform:"uppercase" }}>
          Exam Progress Report
        </h1>
        <p style={{
          margin: "8px 0 0",
          fontSize: "10.5pt",
          color: "#666"
        }}>
          {exam.course_name} • {dayjs(exam.exam_date).format("MMMM D, YYYY")}
        </p>
      </div>

      {/* Student Info */}
      <section style={{ marginBottom: "40px" }}>
        <h2 style={{
          fontSize: "13pt",
          color: "#333",
          marginBottom: "16px",
          borderBottom: "1px solid #eee",
          paddingBottom: "4px"
        }}>
          Student Information
        </h2>
        <div style={{ display: "flex", gap: "40px" }}>
          <div style={{ flex: 1 }}>
            <p><strong>Name:</strong> {student.student_name}</p>
            <p><strong>Reg Number:</strong> {student.student_id}</p>
            <p><strong>Batch:</strong> {exam.batch_name}</p>
          </div>
        </div>
      </section>

      {/* Exam Summary */}
      <section style={{ marginBottom: "40px" }}>
        <h2 style={{
          fontSize: "13pt",
          color: "#333",
          marginBottom: "16px",
          borderBottom: "1px solid #eee",
          paddingBottom: "4px"
        }}>
          Examination Summary
        </h2>

        <div style={{
          background: "#f6f8fa",
          padding: "16px",
          borderRadius: "6px",
          border: "1px solid #e0e0e0"
        }}>

          <p style={{ marginBottom: 10 }}><strong>Subject:</strong> {exam.course_name}</p>
          <p style={{ marginBottom: 10 }}><strong>Instructor:</strong> {exam.instructor_name}</p>
          <p style={{ marginBottom: 10 }}><strong>Exam Date:</strong> {dayjs(exam.exam_date).format("MMMM D, YYYY")}</p>
          <p style={{ marginBottom: 10 }}><strong>Cutoff Score:</strong> {exam.cutoff_score} / {exam.max_score}</p>
        </div>
      </section>

      {/* Performance Box */}
      <section style={{
        display: "flex",
        gap: "24px",
        marginBottom: "40px",
        textAlign: "center"
      }}>
        <div style={{
          flex: 1,
          padding: "24px",
          background: "#eef3fa",
          borderRadius: "6px",
          border: "1px solid #ccd8ea"
        }}>
          <p style={{ marginBottom: "8px", fontSize: "10pt", color: "#555" }}>Score Obtained</p>
          <p style={{ fontSize: "28pt", margin: 0 }}>
            {student.obtained_mark ?? "—"}
            <span style={{ fontSize: "12pt" }}>/ {exam.max_score}</span>
          </p>
        </div>

        <div style={{
          flex: 1,
          padding: "24px",
          background: student.status === "Pass" ? "#e7f7ed" :
                     student.status === "Fail" ? "#fcebea" : "#f0f0f0",
          borderRadius: "6px",
          border: "1px solid #ddd"
        }}>
          <p style={{ marginBottom: "8px", fontSize: "10pt", color: "#555" }}>Result Status</p>
          <p style={{
            fontSize: "16pt",
            margin: 0,
            fontWeight: 600,
            color: student.status === "Pass" ? "#2e7d32" :
                   student.status === "Fail" ? "#c62828" : "#888"
          }}>
            {student.status?.toUpperCase() ?? "ABSENT"}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid #ddd",
        paddingTop: "20px",
        fontSize: "9pt",
        color: "#888",
        textAlign: "center"
      }}>
        <p style={{ marginBottom: 6 }}>This is a system-generated document</p>
        <p> Aerowis Aviation Academy</p>
      </footer>
    </div>
  );
}
