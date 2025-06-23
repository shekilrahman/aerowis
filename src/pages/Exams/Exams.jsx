import { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Typography,
  DatePicker,
  Card,
  Tag,
  Space,
  Divider,
  Row,
  Col,
  Empty,
  Spin
} from "antd";
import { PlusOutlined, CalendarOutlined, UserOutlined, BookOutlined, TeamOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import Header from "../components/Header";
import Nav from "../components/Nav";

import {
  getAllExams,
  addExam,
} from "../../db/examDb";
import { getAllCourses } from "../../db/courseDb";
import { getAllBatches } from "../../db/batchDb";
import { getAllInstructors } from "../../db/instructorDb";

import style from "./Exams.module.css";

const { Title, Text } = Typography;
const { Option } = Select;

function Exams() {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);

  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [examsData, courseData, batchData, instructorData] = await Promise.all([
        getAllExams(),
        getAllCourses(),
        getAllBatches(),
        getAllInstructors(),
      ]);
      setExams(examsData);
      setCourses(courseData);
      setBatches(batchData);
      setInstructors(instructorData);
    } catch (error) {
      console.error("Failed to load data:", error);
      message.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  const showAddModal = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      setModalLoading(true);
      const values = await form.validateFields();
      values.exam_date = values.exam_date.format("YYYY-MM-DD");
      await addExam(values);
      message.success("Exam created successfully!");
      setModalVisible(false);
      loadData();
    } catch (error) {
      console.error("Failed to submit exam:", error);
      message.error("Failed to create exam");
    } finally {
      setModalLoading(false);
    }
  };

  const getStatusColor = (exam) => {
    const examDate = dayjs(exam.exam_date);
    const today = dayjs();
    
    if (examDate.isBefore(today, 'day')) {
      return 'default'; // Past exam
    } else if (examDate.isSame(today, 'day')) {
      return 'processing'; // Today's exam
    } else {
      return 'success'; // Upcoming exam
    }
  };

  return (
    <main className="App">
      <Header />
      <div className="container">
        <div className={style.examContiner}>

        
        <div className={style.examsHeader}>
          <Title level={3} style={{ margin: 0, color: '#1d39c4' }}>Exams Management</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={showAddModal}
            style={{ 
              background: '#1d39c4',
              borderColor: '#1d39c4',
              fontWeight: 500
            }}
          >
            Add New Exam
          </Button>
        </div>

        <Divider style={{ margin: '16px 0' }} />

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : exams.length === 0 ? (
          <Empty
            description={
              <Text type="secondary">No exams found. Create your first exam!</Text>
            }
            style={{ margin: '40px 0' }}
          >
            <Button type="primary" onClick={showAddModal}>Add Exam</Button>
          </Empty>
        ) : (
          <Row gutter={[16, 16]} className={style.cardGrid}>
            {exams.map((exam) => (
              <Col xs={24} sm={12} md={12} lg={8} xl={6} key={exam.exam_id}>
                <Card
                  hoverable
                  className={style.examCard}
                  onClick={() => navigate(`/exams/${exam.exam_id}`)}
                  cover={
                    <div className={style.cardCover}>
                      <Text strong style={{ fontSize: 18 ,color:"white" }}>{exam.exam_name}</Text>
                      <Tag color={getStatusColor(exam)} style={{ marginLeft: 8 }}>
                        {dayjs(exam.exam_date).isBefore(dayjs(), 'day') ? 'Completed' : 
                         dayjs(exam.exam_date).isSame(dayjs(), 'day') ? 'Today' : 'Upcoming'}
                      </Tag>
                    </div>
                  }
                >
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div className={style.cardMeta}>
                      <BookOutlined style={{ color: '#1d39c4' }} />
                      <Text strong>Course:</Text>
                      <Text>{exam.course_name}</Text>
                    </div>
                    <div className={style.cardMeta}>
                      <TeamOutlined style={{ color: '#1d39c4' }} />
                      <Text strong>Batch:</Text>
                      <Text>{exam.batch_name}</Text>
                    </div>
                    <div className={style.cardMeta}>
                      <UserOutlined style={{ color: '#1d39c4' }} />
                      <Text strong>Instructor:</Text>
                      <Text>{exam.instructor_name}</Text>
                    </div>
                    <div className={style.cardMeta}>
                      <CalendarOutlined style={{ color: '#1d39c4' }} />
                      <Text strong>Date:</Text>
                      <Text>{dayjs(exam.exam_date).format('DD MMM YYYY')}</Text>
                    </div>
                    <Divider style={{ margin: '12px 0' }} />
                    <Row gutter={8}>
                      <Col span={12}>
                        <div className={style.scoreCard}>
                          <span >Max Score </span> : 
                          <span style={{ fontSize: 16 }}> {exam.max_score}</span>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className={style.scoreCard}>
                          <span>Cutoff </span> :
                          <span style={{ fontSize: 16 }}> {exam.cutoff_score}</span>
                        </div>
                      </Col>
                    </Row>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        <Modal
          title={<span style={{ color: '#1d39c4' }}>Create New Exam</span>}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={handleSubmit}
          confirmLoading={modalLoading}
          destroyOnHidden
          width={600}
          okText="Create Exam"
          okButtonProps={{
            style: { background: '#1d39c4', borderColor: '#1d39c4' }
          }}
        >
          <Form form={form} layout="vertical" className={style.examForm}>
            <Form.Item
              name="exam_name"
              label={<Text strong>Exam Name</Text>}
              rules={[{ required: true, message: "Please enter exam name" }]}
            >
              <Input placeholder="Enter exam name" size="large" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="course_id"
                  label={<Text strong>Course</Text>}
                  rules={[{ required: true, message: "Select a course" }]}
                >
                  <Select 
                    placeholder="Select course" 
                    size="large"
                    optionFilterProp="children"
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {courses.map((c) => (
                      <Option key={c.course_id} value={c.course_id}>
                        {c.course_name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="batch_id"
                  label={<Text strong>Batch</Text>}
                  rules={[{ required: true, message: "Select a batch" }]}
                >
                  <Select 
                    placeholder="Select batch" 
                    size="large"
                    optionFilterProp="children"
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {batches.map((b) => (
                      <Option key={b.batch_id} value={b.batch_id}>
                        {b.batch_name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="instructor_id"
              label={<Text strong>Instructor</Text>}
              rules={[{ required: true, message: "Select an instructor" }]}
            >
              <Select 
                placeholder="Select instructor" 
                size="large"
                optionFilterProp="children"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {instructors.map((i) => (
                  <Option key={i.instructor_id} value={i.instructor_id}>
                    {i.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="exam_date"
                  label={<Text strong>Exam Date</Text>}
                  rules={[{ required: true, message: "Select exam date" }]}
                >
                  <DatePicker 
                    style={{ width: '100%' }} 
                    format="DD MMM YYYY" 
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="max_score"
                  label={<Text strong>Max Score</Text>}
                  rules={[{ required: true, message: "Enter max score" }]}
                >
                  <InputNumber 
                    min={1} 
                    style={{ width: '100%' }} 
                    size="large"
                    placeholder="e.g. 100"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="cutoff_score"
              label={<Text strong>Cutoff Score</Text>}
              rules={[
                { required: true, message: "Enter cutoff score" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || value <= getFieldValue('max_score')) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Cutoff cannot be greater than max score'));
                  },
                }),
              ]}
            >
              <InputNumber 
                min={0} 
                style={{ width: '100%' }} 
                size="large"
                placeholder="e.g. 40"
              />
            </Form.Item>
          </Form>
        </Modal>
        </div>
      </div>
      <Nav />
    </main>
  );
}

export default Exams;