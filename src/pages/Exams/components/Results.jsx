import { Card, Table, InputNumber, Button, Typography } from "antd";

const { Text } = Typography;

export default function Results({ exam, students, results, markInputs, onChange, onSave }) {
  const getResultByStudent = (student_id) => results.find((r) => r.student_id === student_id);

  const columns = [
    {
      title: "Student Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Reg. No.",
      dataIndex: "reg_no",
      key: "reg_no",
    },
    {
      title: "Obtained Mark",
      key: "obtained_mark",
      render: (_, student) => {
        const res = getResultByStudent(student.reg_no);
        const value = markInputs[student.reg_no] ?? res?.obtained_mark ?? null;
        return (
          <InputNumber
            min={-exam.max_score}
            max={exam.max_score}
            value={value}
            onChange={(val) => onChange(student.reg_no, val)}
            placeholder="Absent"
          />
        );
      },
    },
    {
      title: "Status",
      key: "status",
      render: (_, student) => {
        const res = getResultByStudent(student.reg_no);
        if (!res) return <Text type="secondary">Not Entered</Text>;
        if (res.obtained_mark === null) return <Text type="warning">🚫 Absent</Text>;
        return res.status === "Pass"
          ? <Text type="success">✅ Pass</Text>
          : <Text type="danger">❌ Fail</Text>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, student) => (
        <Button type="primary" size="small" onClick={() => onSave(student.reg_no)}>Save</Button>
      ),
    },
  ];

  return (
    <Card title="Student Results" bordered>
      <Table
        dataSource={students}
        columns={columns}
        rowKey="reg_no"
        pagination={false}
      />
    </Card>
  );
}
