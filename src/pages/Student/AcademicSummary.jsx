import { useEffect, useState, useRef } from "react";
import {
  Card,
  Typography,
  Table,
  Spin,
  Select,
  Button,
  Divider,
  message,
  Row,
  Col,
  Progress,
  Tag,
  Statistic,
  Space,
  Grid,
} from "antd";
import {
  PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";
import { getResultsByStudent } from "../../db/resultDb";
import { AcademicReport } from "./AcademicReport";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import style from "./Student.module.css";

const { Text, Title } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

// Custom components for better visualization
const StatCard = ({ title, value, color, icon, suffix }) => (
  <Card size="small" style={{ textAlign: 'center' }}>
    <Space direction="vertical" size={4}>
      <Text type="secondary">{title}</Text>
      <Space align="center">
        {icon && <span style={{ fontSize: '20px' }}>{icon}</span>}
        <Statistic
          value={value}
          valueStyle={{ color, fontSize: '24px' }}
          suffix={suffix}
        />
      </Space>
    </Space>
  </Card>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{
        backgroundColor: '#fff',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        <p className="label" style={{ marginBottom: '5px', fontWeight: 'bold' }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color, margin: '3px 0' }}>
            {entry.name}: <strong>{entry.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AcademicSummary({ student }) {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [loading, setLoading] = useState(true);
  const screens = useBreakpoint();

  useEffect(() => {
    if (student?.reg_no) fetchResults();
  }, [student]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const data = await getResultsByStudent(student.reg_no);
      const monthList = Array.from(
        new Set(
          data
            .filter((r) => r.exam_date)
            .map((r) =>
              new Date(r.exam_date).toLocaleString("default", {
                month: "long",
                year: "numeric",
              })
            )
        )
      );
      setAvailableMonths(monthList);
      setResults(data);
      setFilteredResults(data);
    } catch (error) {
      console.error("Failed to fetch results:", error);
      message.error("Failed to load academic data");
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (value) => {
    setSelectedMonth(value);
    if (value === "all") {
      setFilteredResults(results);
    } else {
      const filtered = results.filter(
        (r) =>
          new Date(r.exam_date).toLocaleString("default", {
            month: "long",
            year: "numeric",
          }) === value
      );
      setFilteredResults(filtered);
    }
  };

  const calculateStats = () => {
    const total = filteredResults.length;
    const passed = filteredResults.filter((r) => r.status === "Pass").length;
    const failed = filteredResults.filter((r) => r.status === "Fail").length;
    const absent = filteredResults.filter((r) => r.obtained_mark === null).length;
    const scored = filteredResults.filter((r) => r.obtained_mark !== null);
    const average =
      scored.reduce((sum, r) => sum + r.obtained_mark, 0) / scored.length || 0;
    const passRate = total > 0 ? (passed / (total - absent)) * 100 : 0;

    return { total, passed, failed, absent, average, passRate };
  };

  const stats = calculateStats();

  // Chart data
  const pieData = [
    { name: "Passed", value: stats.passed },
    { name: "Failed", value: stats.failed },
    { name: "Absent", value: stats.absent },
  ];
  const pieColors = ["#52c41a", "#f5222d", "#fa8c16"];

  const scoreTrendData = filteredResults.map((r) => ({
    name: r.exam_name,
    mark: r.obtained_mark || 0,
  }));

  const barData = filteredResults.map((r) => ({
    exam: r.exam_name,
    Obtained: r.obtained_mark || 0,
    Cutoff: r.cutoff_score,
  }));

  const monthlyAvg = {};
  filteredResults.forEach((r) => {
    if (!r.exam_date || r.obtained_mark == null) return;
    const month = new Date(r.exam_date).toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    if (!monthlyAvg[month]) monthlyAvg[month] = [];
    monthlyAvg[month].push(r.obtained_mark);
  });
  const monthlyData = Object.entries(monthlyAvg).map(([month, marks]) => ({
    month,
    avg: (marks.reduce((a, b) => a + b, 0) / marks.length).toFixed(2),
  }));

  // PDF Export
  const handleDownloadPDF = async () => {
    try {
      message.loading({ content: 'Generating PDF...', key: 'pdf', duration: 0 });
      
      const container = document.createElement("div");
      Object.assign(container.style, {
        width: "794px",
        minHeight: "1120px",
        backgroundColor: "white",
        color: "#000",
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        boxSizing: "border-box",
        position: "absolute",
        left: "-9999px",
        top: "0",
        zIndex: "-999",
        overflow: "hidden",
        padding: "24px",
      });
      document.body.appendChild(container);

      const rootModule = await import("react-dom/client");
      const tempRoot = rootModule.createRoot(container);

      tempRoot.render(
        <AcademicReport
          student={student}
          stats={stats}
          filteredResults={filteredResults}
        />
      );

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      pdf.save(`Academic_Report_${student?.name || student?.reg_no || "student"}.pdf`);
      
      tempRoot.unmount();
      container.remove();
      
      message.success({ content: 'PDF Downloaded Successfully', key: 'pdf' });
    } catch (err) {
      console.error("PDF generation failed:", err);
      message.error({ content: 'PDF Download Failed', key: 'pdf' });
    }
  };

  // Table columns
  const columns = [
    {
      title: "Exam",
      dataIndex: "exam_name",
      key: "exam_name",
      render: (text) => <Text strong>{text}</Text>,
      fixed: screens.md ? false : 'left',
      width: 150,
    },
    {
      title: "Date",
      dataIndex: "exam_date",
      key: "exam_date",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) : 'N/A',
      width: 120,
    },
    {
      title: "Score",
      key: "score",
      render: (_, record) => (
        <div style={{ textAlign: "center" }}>
          {record.obtained_mark !== null ? (
            <>
              <Text strong style={{ fontSize: '16px' }}>{record.obtained_mark}</Text>
              <Text type="secondary"> / {record.max_score}</Text>
            </>
          ) : (
            <Tag color="orange" style={{ margin: 0 }}>Absent</Tag>
          )}
        </div>
      ),
      width: 120,
    },
    {
      title: "Cutoff",
      key: "cutoff",
      render: (_, record) => (
        <div style={{ textAlign: "center" }}>
          <Text>{record.cutoff_score}</Text>
          <Text type="secondary"> / {record.max_score}</Text>
        </div>
      ),
      width: 120,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "Pass" ? "green" : status === "Fail" ? "red" : "orange"
          }
          style={{ 
            fontWeight: "bold", 
            borderRadius: 4,
            minWidth: '60px',
            textAlign: 'center'
          }}
        >
          {status}
        </Tag>
      ),
      width: 100,
    },
    {
      title: "Performance",
      key: "performance",
      render: (_, record) => {
        if (record.obtained_mark === null) return null;
        const percentage = (record.obtained_mark / record.max_score) * 100;
        const cutoffPercentage = (record.cutoff_score / record.max_score) * 100;
        const diff = percentage - cutoffPercentage;
        
        return (
          <Progress 
            percent={percentage}
            success={{ percent: cutoffPercentage }}
            strokeColor={diff >= 0 ? '#52c41a' : '#f5222d'}
            showInfo={false}
            size="small"
          />
        );
      },
      width: 150,
    },
  ];

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ marginRight: 12, fontSize: "1.2em" }}>📊</span>
          <Title level={4} style={{ margin: 0 }}>Academic Performance Report</Title>
        </div>
      }
      className={style.summaryCard}
      extra={
        <Space>
          <Select
            value={selectedMonth}
            onChange={handleMonthChange}
            style={{ width: 200 }}
            placeholder="Filter by month"
          >
            <Option value="all">All Months</Option>
            {availableMonths.map((month) => (
              <Option key={month} value={month}>
                {month}
              </Option>
            ))}
          </Select>
          <Button 
            onClick={handleDownloadPDF} 
            type="primary"
            icon={<span>📄</span>}
          >
            Export PDF
          </Button>
        </Space>
      }
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Loading academic data...</div>
        </div>
      ) : (
        <>
          {/* Quick Stats */}
          <Divider orientation="left" orientationMargin={0}>Key Metrics</Divider>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={8} lg={6} xl={4}>
              <StatCard 
                title="Total Exams" 
                value={stats.total} 
                color="#1890ff" 
                icon="📝"
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xl={4}>
              <StatCard 
                title="Pass Rate" 
                value={stats.passRate.toFixed(1)} 
                color="#52c41a" 
                icon="✅"
                suffix="%"
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xl={4}>
              <StatCard 
                title="Average Score" 
                value={stats.average.toFixed(1)} 
                color="#722ed1" 
                icon="📊"
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xl={4}>
              <StatCard 
                title="Passed" 
                value={stats.passed} 
                color="#52c41a" 
                icon="👍"
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xl={4}>
              <StatCard 
                title="Failed" 
                value={stats.failed} 
                color="#f5222d" 
                icon="👎"
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xl={4}>
              <StatCard 
                title="Absent" 
                value={stats.absent} 
                color="#fa8c16" 
                icon="🚫"
              />
            </Col>
          </Row>

          {/* Charts */}
          <Divider orientation="left" orientationMargin={0}>Performance Overview</Divider>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} md={12}>
              <Card title="Exam Results Distribution" size="small">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={60}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={pieColors[i]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Score Trend" size="small">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={scoreTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 'dataMax + 10']} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="mark" 
                      stroke="#1890ff" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Score vs Cutoff" size="small">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="exam" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      dataKey="Obtained" 
                      fill="#1890ff" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="Cutoff" 
                      fill="#ff4d4f" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Monthly Average Score" size="small">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 'dataMax + 10']} />
                    <Tooltip 
                      content={<CustomTooltip />}
                      formatter={(value) => [`${value} points`, 'Average']}
                    />
                    <Bar 
                      dataKey="avg" 
                      fill="#52c41a" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          {/* Exam Details */}
          <Divider orientation="left" orientationMargin={0}>Exam Details</Divider>
          <Card size="small">
            <Table
              dataSource={filteredResults}
              columns={columns}
              rowKey="result_id"
              size="middle"
              pagination={{
                pageSize: 5,
                showSizeChanger: true,
                pageSizeOptions: ['5', '10', '20', '50'],
                showTotal: (total) => `Total ${total} exams`,
              }}
              scroll={{ x: true }}
              bordered
              style={{ marginTop: 16 }}
            />
          </Card>
        </>
      )}
    </Card>
  );
}