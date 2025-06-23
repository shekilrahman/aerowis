import { Typography, Row, Col, Card, Statistic } from "antd";
import {
  UserOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  CrownTwoTone,
} from "@ant-design/icons";

const { Title } = Typography;

export default function Statistics({ exam, students, results }) {
  const attended = results.filter((r) => r.obtained_mark !== null);
  const attendedCount = attended.length;
  const passCount = attended.filter((r) => r.status === "Pass").length;
  const failCount = attended.filter((r) => r.status === "Fail").length;
  const passPercent = attendedCount ? ((passCount / attendedCount) * 100).toFixed(2) : "0.00";
  const totalScore = attended.reduce((sum, r) => sum + r.obtained_mark, 0);
  const averageScore = attendedCount ? (totalScore / attendedCount).toFixed(2) : "N/A";

  const topScorer =
    attendedCount > 0
      ? students
          .map((s) => {
            const res = results.find((r) => r.student_id === s.reg_no);
            return {
              name: s.name,
              mark: res?.obtained_mark ?? null,
            };
          })
          .filter((s) => s.mark !== null)
          .sort((a, b) => b.mark - a.mark)[0]
      : null;

  return (
    <>
      <Title level={3}>{exam.exam_name} Statistics</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}><Card><Statistic title="Total Students" value={students.length} prefix={<UserOutlined />} /></Card></Col>
        <Col xs={24} sm={12} md={6}><Card><Statistic title="Attended" value={attendedCount} valueStyle={{ color: "#52c41a" }} prefix={<CheckCircleTwoTone />} /></Card></Col>
        <Col xs={24} sm={12} md={6}><Card><Statistic title="Absent" value={students.length - attendedCount} valueStyle={{ color: "#ff4d4f" }} prefix={<CloseCircleTwoTone />} /></Card></Col>
        <Col xs={24} sm={12} md={6}><Card><Statistic title="Pass %" value={passPercent} suffix="%" /></Card></Col>
        <Col xs={24} sm={12} md={6}><Card><Statistic title="Passed" value={passCount} /></Card></Col>
        <Col xs={24} sm={12} md={6}><Card><Statistic title="Failed" value={failCount} /></Card></Col>
        <Col xs={24} sm={12} md={6}><Card><Statistic title="Average Score" value={averageScore} suffix={` / ${exam.max_score}`} /></Card></Col>
      </Row>
      {topScorer && (
        <Card style={{ marginTop: 16 }} type="inner">
          <Statistic
            title="Top Scorer"
            value={`${topScorer.name} - ${topScorer.mark}/${exam.max_score}`}
            prefix={<CrownTwoTone twoToneColor="#faad14" />}
          />
        </Card>
      )}
    </>
  );
}
