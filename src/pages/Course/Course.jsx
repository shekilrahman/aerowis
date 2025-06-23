import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Popconfirm,
  message,
  Typography,
  Space,
  Card,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import Header from "../components/Header";
import Nav from "../components/Nav";
import {
  getAllCourses,
  addCourse,
  updateCourse,
  deleteCourse,
} from "../../db/courseDb";

import style from "./Course.module.css";

const { Title, Text } = Typography;

function Course() {
  const [courses, setCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingCourse, setEditingCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await getAllCourses();
      setCourses(data);
    } catch (err) {
      message.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const openModal = (course = null) => {
    if (course) {
      form.setFieldsValue(course);
      setEditingCourse(course);
    } else {
      form.resetFields();
      setEditingCourse(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingCourse) {
        await updateCourse(editingCourse.course_id, values);
        message.success("Course updated");
      } else {
        await addCourse(values);
        message.success("Course added");
      }
      setIsModalOpen(false);
      loadCourses();
    } catch (err) {
      message.error("Error saving course");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCourse(id);
      message.success("Course deleted");
      loadCourses();
    } catch (err) {
      message.error("Delete failed");
    }
  };

  const columns = [
    {
      title: "Course ID",
      dataIndex: "course_id",
      key: "course_id",
      width: "25%",
    },
    {
      title: "Course Name",
      dataIndex: "course_name",
      key: "course_name",
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Button
            shape="circle"
            type="text"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
            style={{ color: "#1890ff" }}
          />
          <Popconfirm
            title="Delete this course?"
            onConfirm={() => handleDelete(record.course_id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              shape="circle"
              type="text"
              icon={<DeleteOutlined />}
              danger
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <main className="App">
      <Header />
      <div className="container">
        <div className={style.courseWrap}>
          <Row gutter={[16, 16]} align="middle" justify="space-between">
            <Col>
              <Title level={3} style={{ marginBottom: 0 }}>
                Courses
              </Title>
              <Text type="secondary">
                Total Courses: {courses.length}
              </Text>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => openModal()}
                size="middle"
              >
                Add Course
              </Button>
            </Col>
          </Row>

          <Card style={{ marginTop: 24, borderRadius: 10 }}>
            <Table
              dataSource={courses}
              columns={columns}
              rowKey="course_id"
              loading={loading}
              bordered
              pagination={{ pageSize: 5 }}
              size="middle"
            />
          </Card>
        </div>
      </div>

      <Modal
        title={editingCourse ? "Edit Course" : "Add Course"}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingCourse(null);
        }}
        okText={editingCourse ? "Update" : "Add"}
        destroyOnHidden
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="course_id"
            label="Course ID"
            rules={[{ required: true, message: "Course ID is required" }]}
          >
            <Input disabled={!!editingCourse} />
          </Form.Item>
          <Form.Item
            name="course_name"
            label="Course Name"
            rules={[{ required: true, message: "Course name is required" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <Nav />
    </main>
  );
}

export default Course;
