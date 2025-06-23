import { Table, Statistic, Row, Col, Divider, Button, message } from "antd";
import { DownloadOutlined, FileZipOutlined } from "@ant-design/icons";
import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import { writeFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import StudentReport from "./StudentReport";

export default function Report({ exam, results }) {
  const reportRef = useRef();

  const calculateStats = () => {
    if (!results || results.length === 0) return null;
    const scores = results
      .filter((r) => r.obtained_mark !== null)
      .map((r) => r.obtained_mark);
    const passed = results.filter(
      (r) => r.obtained_mark >= exam.cutoff_score
    ).length;
    const totalStudents = results.length;

    return {
      average: scores.reduce((a, b) => a + b, 0) / scores.length,
      highest: Math.max(...scores),
      lowest: Math.min(...scores),
      passRate: (passed / totalStudents) * 100,
      passed,
      failed: totalStudents - passed,
      totalStudents,
      absent: results.filter((r) => r.obtained_mark === null).length,
    };
  };

  const stats = calculateStats();

  const handleDownloadPDF = async () => {
  try {
    const element = reportRef.current;
    const canvas = await html2canvas(element, {
      scale: 2, // Improve quality
      useCORS: true
    });

    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add more pages if content overflows
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`Exam_Report_${exam?.exam_id || "000"}.pdf`);
    message.success("Exam Report Downloaded Successfully");
  } catch (error) {
    console.error("PDF generation failed:", error);
    message.error("Failed to generate PDF");
  }
};


  const handleDownloadZip = async () => {
    try {
      const zip = new JSZip();

      for (const student of results) {
        // Create a container element
        const container = document.createElement("div");
             Object.assign(container.style, {
          width: "794px",
          height: "1123px",
          backgroundColor: "white",
          color: "#000",
          fontFamily: "Arial, sans-serif",
          fontSize: "14px",
          boxSizing: "border-box",
          position: "absolute",
          left: "-9999px", // Hide off-screen
          top: "0",
          zIndex: "-999",
          overflow: "hidden",
        });
        document.body.appendChild(container);

        // Render the report component into the container
        const root = await import("react-dom/client");
        const tempRoot = root.createRoot(container);
        tempRoot.render(<StudentReport exam={exam} student={student} />);

        // Wait for rendering
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Generate PDF
        const canvas = await html2canvas(container, { scale: 3 });
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        const pdf = new jsPDF("p", "mm", "a4");
       const pdfWidth = 210;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, imgHeight);

        const pdfBuffer = pdf.output("arraybuffer");
        zip.file(`Report-${student.student_id}.pdf`, pdfBuffer);

        // Clean up
        tempRoot.unmount();
        document.body.removeChild(container);
      }

      const zipBlob = await zip.generateAsync({ type: "uint8array" });
      const filename = `Exam_${exam.exam_id || "000"}_Reports.zip`;

      await writeFile(filename, zipBlob, {
        baseDir: BaseDirectory.Download,
      });

      message.success(`All student reports saved to Downloads as ${filename}`);
    } catch (error) {
      console.error("ZIP generation failed:", error);
      message.error("Failed to generate ZIP");
    }
  };

  const columns = [
    {
      title: "Student ID",
      dataIndex: "student_id",
      key: "student_id",
    },
    {
      title: "Name",
      dataIndex: "student_name",
      key: "student_name",
    },
    {
      title: "Score",
      dataIndex: "obtained_mark",
      key: "score",
      render: (score) =>
        score !== null ? `${score}/${exam.max_score}` : "Absent",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span
          style={{
            color:
              status === "Pass" ? "green" : status === "Fail" ? "red" : "gray",
            fontWeight: "bold",
          }}
        >
          {status}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div style={{ textAlign: "right", marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleDownloadPDF}
          style={{ marginRight: 8 }}
        >
          Download PDF
        </Button>
        <Button
          type="default"
          icon={<FileZipOutlined />}
          onClick={handleDownloadZip}
        >
          Download ZIP of All Student Reports
        </Button>
      </div>

      <div
        ref={reportRef}
        style={{
          width: "210mm",
          Height: "auto",
          padding: "20mm",
          margin: "0 auto",
          background: "white",
          color: "#000",
          fontFamily: "Arial, sans-serif",
          fontSize: "12pt",
          boxShadow: "0 0 5px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: 24 }}>
          Exam Performance Report
        </h1>

        <h2>Exam Details</h2>
        <Row gutter={16}>
          <Col span={8}>
            <p>
              <strong>Exam ID:</strong> {exam.exam_id}
            </p>
            <p>
              <strong>Course:</strong> {exam.course_name}
            </p>
          </Col>
          <Col span={8}>
            <p>
              <strong>Batch:</strong> {exam.batch_name}
            </p>
            <p>
              <strong>Instructor:</strong> {exam.instructor_name}
            </p>
          </Col>
          <Col span={8}>
            <p>
              <strong>Date:</strong> {exam.exam_date}
            </p>
            <p>
              <strong>Cutoff Score:</strong> {exam.cutoff_score}/
              {exam.max_score}
            </p>
          </Col>
        </Row>

        <Divider />

        {stats && (
          <>
            <h2>Performance Statistics</h2>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Average Score"
                  value={stats.average.toFixed(2)}
                />
              </Col>
              <Col span={6}>
                <Statistic title="Highest Score" value={stats.highest} />
              </Col>
              <Col span={6}>
                <Statistic title="Lowest Score" value={stats.lowest} />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Pass Rate"
                  value={`${stats.passRate.toFixed(2)}%`}
                />
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 24 }}>
              <Col span={6}>
                <Statistic title="Total Students" value={stats.totalStudents} />
              </Col>
              <Col span={6}>
                <Statistic title="Passed" value={stats.passed} />
              </Col>
              <Col span={6}>
                <Statistic title="Failed" value={stats.failed} />
              </Col>
              <Col span={6}>
                <Statistic title="Absent" value={stats.absent} />
              </Col>
            </Row>
            <Divider />
          </>
        )}

        <h2>Student Results</h2>
        <Table
          columns={columns}
          dataSource={results}
          rowKey="student_id"
          pagination={false}
          bordered
        />
        <Divider />
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <p>Report generated on {new Date().toLocaleDateString()}</p>
          <p style={{ fontStyle: "italic" }}>
            This is an official report generated by the Education Management
            System.
          </p>
        </div>
      </div>
    </div>
  );
}
