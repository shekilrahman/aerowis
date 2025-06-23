import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, message, Spin, Tabs } from "antd";
import {
  ArrowLeftOutlined,
  PieChartOutlined,
  FileTextOutlined,
  FileDoneOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";

import Header from "../components/Header";
import Statistics from "./components/Statistics";
import Details from "./components/Details";
import Results from "./components/Results";
import Report from "./components/Report";

import { getExam } from "../../db/examDb";

import { getResultsByExam, addResult, updateResult } from "../../db/resultDb";

import { getAllStudents } from "../../db/studentDb";

import style from "./Exam.module.css";
import { BsBack } from "react-icons/bs";

const { TabPane } = Tabs;

export default function Exam() {
  const { exam_id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [markInputs, setMarkInputs] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        const examData = await getExam(exam_id);
        if (!examData) return message.error("Exam not found");
        const [batchStudents, examResults] = await Promise.all([
          getAllStudents(examData.batch_id),
          getResultsByExam(exam_id),
        ]);
        setExam(examData);
        setStudents(batchStudents);
        setResults(examResults);
      } catch (e) {
        console.error(e);
        message.error("Failed to load exam");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [exam_id]);

 

  const handleMarkChange = (reg_no, value) =>
    setMarkInputs((prev) => ({ ...prev, [reg_no]: value }));

  const handleSaveMark = async (student_id) => {
    const mark = markInputs[student_id] ?? null;
    let status =
      mark === null ? "Absent" : mark >= exam.cutoff_score ? "Pass" : "Fail";
    const existing = results.find((r) => r.student_id === student_id);
    try {
      if (existing) {
        await updateResult(existing.result_id, { obtained_mark: mark, status });
      } else {
        await addResult({
          student_id,
          exam_id: exam.exam_id,
          obtained_mark: mark,
          status,
        });
      }
      const updated = await getResultsByExam(exam_id);
      setResults(updated);
      message.success("Saved result for " + student_id);
    } catch (err) {
      console.error(err);
      message.error("Failed to save result");
    }
  };

  return (
    <main className="App">
      <Header/>
     
      <div className="container">
        <div className={style.examContiner}>
        

        {loading ? (
          <Spin size="large" />
        ) : exam ? (
          <Tabs
            defaultActiveKey="1"
            items={[
              {
                key: "1",
                label: (
                  <>
                    <PieChartOutlined /> Statistics
                  </>
                ),
                children: (
                  <Statistics
                    exam={exam}
                    students={students}
                    results={results}
                  />
                ),
              },
              {
                key: "2",
                label: (
                  <>
                    <FileTextOutlined /> Exam Info
                  </>
                ),
                children: <Details exam={exam} />,
              },
              {
                key: "3",
                label: (
                  <>
                    <FileDoneOutlined /> Results
                  </>
                ),
                children: (
                  <Results
                    exam={exam}
                    students={students}
                    results={results}
                    markInputs={markInputs}
                    onChange={handleMarkChange}
                    onSave={handleSaveMark}
                  />
                ),
              },
              {
                key: "4",
                label: (
                  <>
                    <FileSearchOutlined /> Report
                  </>
                ),
                children: <Report exam={exam}
                    students={students}
                    results={results} />,
              },
              ,
              {
                key: "5",
                label: (
                  <>
                    <Button
                                onClick={() => navigate(-1)}
                                icon={<ArrowLeftOutlined />}
                                className={style.backButton}
                              >
                                Back to Exams
                              </Button>
                  </>
                ),
              },
            ]}
          />
        ) : (
          <p>Exam not found</p>
        )}
        </div>
      </div>
    </main>
  );
}
