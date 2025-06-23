import { useState, useEffect } from 'react';
import { Card, Divider, Button, Popconfirm, Space, Form, Input, InputNumber, DatePicker, Select, message } from "antd";
import { EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import { deleteExam, updateExam } from "../../../db/examDb";
import { getAllInstructors } from "../../../db/instructorDb";
import { getAllCourses } from "../../../db/courseDb"; // Assuming you have this function
import style from "./component.module.css";
import dayjs from 'dayjs';

export default function Details({ exam }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (isEditing) {
      fetchDropdownData();
    }
  }, [isEditing]);

  const fetchDropdownData = async () => {
    try {
      setFetching(true);
      const [instructorsData, coursesData] = await Promise.all([
        getAllInstructors(),
        getAllCourses()
      ]);
      setInstructors(instructorsData);
      setCourses(coursesData);
    } catch (error) {
      console.error("Failed to fetch dropdown data:", error);
      message.error("Failed to load dropdown data");
    } finally {
      setFetching(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteExam(exam.exam_id);
      message.success("Exam deleted successfully");
      navigate("/Exams");
    } catch (e) {
      console.error(e);
      message.error("Failed to delete exam");
    }
  };

  const handleEdit = () => {
    form.setFieldsValue({
      ...exam,
      exam_date: dayjs(exam.exam_date),
      course_id: exam.course_id,
      instructor_id: exam.instructor_id
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      await updateExam(exam.exam_id, {
        ...values,
        exam_date: values.exam_date.format('YYYY-MM-DD'),
        course_id: values.course_id,
        instructor_id: values.instructor_id
      });
      message.success("Exam updated successfully");
      setIsEditing(false);
      // You might want to refresh the exam data here
    } catch (error) {
      console.error(error);
      message.error("Failed to update exam");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <Card 
      title={<span className={style.cardTitle}>Exam Details</span>} 
      className={style.card}
      headStyle={{ borderBottom: "none" }}
      extra={
        isEditing ? (
          <Space>
            <Button 
              icon={<CloseOutlined />} 
              onClick={handleCancel}
              className={style.cancelButton}
            >
              Cancel
            </Button>
            <Button 
              icon={<SaveOutlined />} 
              onClick={handleSave}
              loading={loading}
              className={style.saveButton}
            >
              Save
            </Button>
          </Space>
        ) : (
          <Space>
            <Button 
              icon={<EditOutlined />} 
              className={style.editButton}
              onClick={handleEdit}
            >
              Edit
            </Button>
            <Popconfirm 
              title="Are you sure to delete this exam?" 
              onConfirm={handleDelete}
              okText="Yes"
              cancelText="No"
            >
              <Button 
                danger 
                icon={<DeleteOutlined />} 
                className={style.deleteButton}
              >
                Delete
              </Button>
            </Popconfirm>
          </Space>
        )
      }
    >
      {isEditing ? (
        <Form form={form} layout="vertical">
          <Divider orientation="left" className={style.divider}>📝 Details</Divider>
          <div className={style.detailContainer}>
            <Form.Item 
              name="course_id" 
              label="Course" 
              rules={[{ required: true, message: 'Please select a course' }]}
            >
              <Select
                loading={fetching}
                placeholder="Select course"
                options={courses.map(course => ({
                  value: course.course_id,
                  label: course.course_name
                }))}
              />
            </Form.Item>
            
            <Form.Item 
              name="instructor_id" 
              label="Instructor" 
              rules={[{ required: true, message: 'Please select an instructor' }]}
            >
              <Select
                loading={fetching}
                placeholder="Select instructor"
                options={instructors.map(instructor => ({
                  value: instructor.instructor_id,
                  label: instructor.name
                }))}
              />
            </Form.Item>
            
            <Form.Item 
              name="exam_date" 
              label="Date" 
              rules={[{ required: true, message: 'Please select exam date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <Divider orientation="left" className={style.divider}>🏆 Scoring</Divider>
          <div className={style.detailContainer}>
            <Form.Item 
              name="max_score" 
              label="Max Score" 
              rules={[{ required: true, message: 'Please enter max score' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item 
              name="cutoff_score" 
              label="Cutoff Score" 
              rules={[{ required: true, message: 'Please enter cutoff score' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </div>
        </Form>
      ) : (
        <>
          <Divider orientation="left" className={style.divider}>📝 Details</Divider>
          <div className={style.detailContainer}>
            <DetailItem label="Course" value={exam.course_name} icon="📚" />
            <DetailItem label="Batch" value={exam.batch_name} icon="👥" />
            <DetailItem label="Instructor" value={exam.instructor_name} icon="👨‍🏫" />
            <DetailItem label="Date" value={exam.exam_date} icon="📅" />
          </div>

          <Divider orientation="left" className={style.divider}>🏆 Scoring</Divider>
          <div className={style.detailContainer}>
            <DetailItem label="Max Score" value={exam.max_score} icon="⭐" />
            <DetailItem label="Cutoff Score" value={exam.cutoff_score} icon="✂️" />
          </div>
        </>
      )}
    </Card>
  );
}

function DetailItem({ label, value, icon }) {
  return (
    <div className={style.detailItem}>
      <span className={style.detailIcon}>{icon}</span>
      <span className={style.detailLabel}>{label}:</span>
      <span className={style.detailValue}>{value}</span>
    </div>
  );
}