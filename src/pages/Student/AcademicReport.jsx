import { useRef } from "react";
import { Typography, Table, Divider, Row, Col, Progress, Tag } from "antd";
import logo from "../../assets/logo_dark_crop.png";
import dayjs from "dayjs";

const { Text, Title } = Typography;

export const AcademicReport = ({ student, stats, filteredResults }) => {
  const reportRef = useRef();

  const columns = [
    {
      title: "Exam",
      dataIndex: "exam_name",
      key: "exam_name",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Date",
      dataIndex: "exam_date",
      key: "exam_date",
      render: (date) =>
        new Date(date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
    {
      title: "Score",
      key: "score",
      render: (_, record) => (
        <div style={{ textAlign: 'center' }}>
          {record.obtained_mark !== null ? (
            <>
              <Text strong>{record.obtained_mark}</Text>
              <Text type="secondary">/{record.max_score}</Text>
            </>
          ) : (
            <Tag color="orange">Absent</Tag>
          )}
        </div>
      ),
    },
    {
      title: "Cutoff",
      key: "cutoff",
      render: (_, record) => (
        <div style={{ textAlign: 'center' }}>
          <Text>{record.cutoff_score}</Text>
          <Text type="secondary">/{record.max_score}</Text>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "Pass" ? "green" : 
            status === "Fail" ? "red" : "orange"
          }
          style={{ fontWeight: "bold", borderRadius: 4 }}
        >
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <div ref={reportRef} style={{ padding: "20px", backgroundColor: "white" }}>
      {/* Institution Header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 0 }}><img src={logo} width={250} /></Title>
        <Text strong style={{ color: '#595959' , fontSize:20}}> Academic Performance Report</Text>
      </div>

      {/* Student Information Section */}
      <div style={{ 
        background: '#fafafa', 
        padding: '16px',
        border: '1px solid #f0f0f0',
        borderRadius: 4,
        marginBottom: 24
      }}>
        <Row gutter={16}>
          <Col span={12}>
            <Text strong>Student Name: </Text>
            <Text>{student?.name || 'N/A'}</Text>
          </Col>
          <Col span={12}>
            <Text strong>Registration No: </Text>
            <Text>{student?.reg_no || 'N/A'}</Text>
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 8 }}>
          <Col span={12}>
            <Text strong>Batch: </Text>
            <Text>{student?.batch_name || 'N/A'}</Text>
          </Col>
          <Col span={12}>
            <Text strong>Report Period: </Text>
            <Text>{new Date().toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}</Text>
          </Col>
        </Row>
      </div>

      {/* Performance Summary */}
      <Title level={4} style={{ marginBottom: 16 }}>Performance Summary</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <div style={{ 
            border: '1px solid #e8e8e8',
            padding: '16px',
            borderRadius: 4,
            textAlign: 'center'
          }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>Total Exams</Text>
            <Title level={3} style={{ margin: 0, color: '#1890ff' }}>{stats.total}</Title>
          </div>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <div style={{ 
            border: '1px solid #e8e8e8',
            padding: '16px',
            borderRadius: 4,
            textAlign: 'center'
          }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>Pass Rate</Text>
            <Progress 
              type="circle"
              percent={stats.passRate} 
              width={80}
              format={percent => `${percent.toFixed(1)}%`}
              strokeColor={stats.passRate > 70 ? '#52c41a' : stats.passRate > 50 ? '#faad14' : '#f5222d'}
            />
          </div>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <div style={{ 
            border: '1px solid #e8e8e8',
            padding: '16px',
            borderRadius: 4,
            textAlign: 'center'
          }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>Average Score</Text>
            <Title level={3} style={{ margin: 0, color: '#1890ff' }}>{stats.average.toFixed(2)}</Title>
          </div>
        </Col>
      </Row>

      {/* Detailed Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <div style={{ 
            background: '#f6ffed', 
            padding: '12px 16px',
            borderRadius: 4,
            textAlign: 'center',
            border: '1px solid #b7eb8f'
          }}>
            <Text strong style={{ display: 'block' }}>Passed Exams</Text>
            <Title level={4} style={{ margin: 0, color: '#52c41a' }}>{stats.passed}</Title>
          </div>
        </Col>
        <Col span={8}>
          <div style={{ 
            background: '#fff2f0', 
            padding: '12px 16px',
            borderRadius: 4,
            textAlign: 'center',
            border: '1px solid #ffccc7'
          }}>
            <Text strong style={{ display: 'block' }}>Failed Exams</Text>
            <Title level={4} style={{ margin: 0, color: '#f5222d' }}>{stats.failed}</Title>
          </div>
        </Col>
        <Col span={8}>
          <div style={{ 
            background: '#fffbe6', 
            padding: '12px 16px',
            borderRadius: 4,
            textAlign: 'center',
            border: '1px solid #ffe58f'
          }}>
            <Text strong style={{ display: 'block' }}>Absent Exams</Text>
            <Title level={4} style={{ margin: 0, color: '#faad14' }}>{stats.absent}</Title>
          </div>
        </Col>
      </Row>

      {/* Exam Details */}
      <Title level={4} style={{ marginBottom: 16 }}>Exam Performance Details</Title>
      <Table
        dataSource={filteredResults}
        columns={columns}
        rowKey="result_id"
        size="middle"
        pagination={false}
        bordered
        style={{ marginBottom: 24 }}
      />

      {/* Footer */}
      <Divider />
      <div style={{ textAlign: 'center', color: '#8c8c8c', fontSize: 12 }}>
        <Text>This is an official document generated by Aerowis Aviation Academy</Text>
      </div>
    </div>
  );
};

