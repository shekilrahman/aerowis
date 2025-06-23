import { useState, useEffect, useMemo, useCallback } from "react";
import Header from "../components/Header";
import Nav from "../components/Nav";
import style from "./Home.module.css";
import ProfilePhoto from '../../utils/fileUtils';
import {
  Button,
  Flex,
  Input,
  Modal,
  Form,
  DatePicker,
  Select,
  message,
  Spin,
} from "antd";
import { SearchOutlined } from '@ant-design/icons';
import dayjs from "dayjs";

import {
  addStudent,
  getAllStudents,
} from "../../db/studentDb";
import {
  addBatch,
  getAllBatches,
} from "../../db/batchDb";

import { useNavigate } from "react-router-dom";
import { IoAddOutline } from "react-icons/io5";

// Optimized Student Card Component
const StudentCard = ({ student, onClick }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoading(false);
    setImageError(true);
  }, []);

  return (
    <div 
      key={student.reg_no} 
      className={style.stdCard} 
      onClick={() => onClick(student.reg_no)}
    >
      <div style={{
        textTransform: "capitalize", 
        textAlign: "right", 
        paddingRight: 10, 
        paddingTop: 5
      }}>
        <strong>{student.name}</strong>
      </div>
      <Flex>
        <div className={style.stdCardLeft}>
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {imageLoading && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1
              }}>
                <Spin size="small" />
              </div>
            )}
            <img
              src={imageError ? '/default-avatar.png' : student.avatar}
              alt="Student"
              className={style.stdCardImg}
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{
                opacity: imageLoading ? 0.3 : 1,
                transition: 'opacity 0.3s ease'
              }}
            />
          </div>
        </div>
        <div className={style.stdCardRight}>
          <div>
            <strong>Reg No:</strong> {student.reg_no}
          </div>
          <div style={{ textTransform: 'uppercase' }}>
            <strong>Batch:</strong> {student.batch_name || student.batch}
          </div>
          <div>
            <strong>Join Date:</strong> {student.join_date}
          </div>
          <div>
            <strong>Ph No:</strong> {student.phone}
          </div>
        </div>
      </Flex>
    </div>
  );
};

function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [batchForm] = Form.useForm();
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState(null); // New state for batch filter
  const [loading, setLoading] = useState(true);
  const [batchLoading, setBatchLoading] = useState(false);
  const navigate = useNavigate();

  // Memoized filtered students for performance
  const filteredStudents = useMemo(() => {
    let result = students;
    
    // Apply batch filter if selected
    if (selectedBatch) {
      result = result.filter(student => 
        student.batch_id === selectedBatch ||
        student.batch_name?.toLowerCase() === selectedBatch.toLowerCase()
      );
    }
    
    // Apply search term filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      result = result.filter(student => 
        student.name.toLowerCase().includes(searchLower) ||
        student.reg_no.toString().includes(searchLower)
      );
    }
    
    return result;
  }, [students, searchTerm, selectedBatch]);

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const rows = await getAllStudents();
      
      // Load avatars progressively for better UX
      const studentsWithPlaceholders = rows.map(s => ({
        ...s,
        avatar: null, // Will be loaded lazily
      }));
      
      setStudents(studentsWithPlaceholders);
      
      // Load avatars in background
      const withAvatars = await Promise.all(
        rows.map(async (s) => {
          try {
            const avatar = await ProfilePhoto.getUrl(s);
            return { ...s, avatar };
          } catch (err) {
            console.warn(`Failed to load avatar for ${s.name}:`, err);
            return { ...s, avatar: '/default-avatar.png' };
          }
        })
      );
      
      setStudents(withAvatars);
    } catch (err) {
      console.error("Failed to load students", err);
      message.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBatches = useCallback(async () => {
    try {
      setBatchLoading(true);
      const batchList = await getAllBatches();
      setBatches(batchList);
    } catch (err) {
      console.error("Failed to load batches", err);
      message.error("Failed to load batches");
    } finally {
      setBatchLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
    loadBatches();
  }, [loadStudents, loadBatches]);

  const handleAddStudent = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const student = {
        reg_no: parseInt(values.reg_no),
        name: values.name,
        batch_id: values.batch_id,
        join_date: values.join_date.format("YYYY-MM-DD"),
        gender: values.gender,
        phone: values.phone,
      };

      await addStudent(student);
      message.success("Student added successfully!");
      form.resetFields();
      setIsModalOpen(false);
      loadStudents();
    } catch (err) {
      console.error("Add failed", err);
      message.error("Failed to add student");
    }
  }, [form, loadStudents]);

  const handleAddBatch = useCallback(async () => {
    try {
      const values = await batchForm.validateFields();
      const batch = {
        batch_name: values.batch_name,
        start_date: values.start_date.format("YYYY-MM-DD"),
      };

      const batchId = await addBatch(batch);
      message.success(`Batch ${batch.batch_name} added successfully!`);
      batchForm.resetFields();
      setIsBatchModalOpen(false);
      loadBatches();
      return batchId;
    } catch (err) {
      console.error("Add batch failed", err);
      message.error("Failed to add batch");
      throw err;
    }
  }, [batchForm, loadBatches]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleBatchFilterChange = useCallback((value) => {
    setSelectedBatch(value);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedBatch(null);
  }, []);

  const handleNavigateToStudent = useCallback((regNo) => {
    navigate(`/student/${regNo}`);
  }, [navigate]);

  return (
    <main className="App">
      <Header />
      <div className="container">
        <div className={style.wrap}>
          <div className={style.toolbar}>
            <Flex justify="space-between" gap="large" style={{ width: "100%" }}>
              <Flex gap="small" style={{ width: "60%" }}>
                <Input 
                  placeholder="Search by Name or Reg No" 
                  style={{ flex: 2, height:40, fontSize:'larger' }}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  prefix={<SearchOutlined />}
                  allowClear
                  onClear={() => setSearchTerm("")}
                />
                <Select
                  placeholder="Filter by Batch"
                  style={{ flex: 1, height:40, minWidth: 150 }}
                  value={selectedBatch}
                  onChange={handleBatchFilterChange}
                  options={[
                    { value: "", label: 'All Batches' },
                    ...batches.map(batch => ({
                      value: batch.batch_name,
                      label: batch.batch_name,
                    }))
                  ]}
                  allowClear
                  onClear={() => setSelectedBatch(null)}
                />
              </Flex>
              <Flex gap="small">
                <Button 
                  onClick={() => setIsBatchModalOpen(true)} 
                  style={{ height:40, fontSize:'larger' }}
                >
                  Add Batch
                </Button>
                <Button 
                  onClick={() => setIsModalOpen(true)} 
                  icon={<IoAddOutline />} 
                  style={{ height:40, fontSize:'larger' }}
                >
                  Add Student
                </Button>
              </Flex>
            </Flex>
          </div>

          <div className={style.stdContiner}>
            {loading ? (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '200px' 
              }}>
                <Spin size="large" />
              </div>
            ) : filteredStudents.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: '#666' 
              }}>
                {searchTerm || selectedBatch ? 
                  `No students found matching your criteria` : 
                  'No students found'
                }
                {(searchTerm || selectedBatch) && (
                  <Button 
                    type="link" 
                    onClick={clearFilters}
                    style={{ marginTop: 10 }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <Flex wrap="wrap" gap="large" justify="flex-start">
                {filteredStudents.map((student) => (
                  <StudentCard
                    key={student.reg_no}
                    student={student}
                    onClick={handleNavigateToStudent}
                  />
                ))}
              </Flex>
            )}
          </div>
        </div>
      </div>
      <Nav />

      {/* Add Student Modal */}
      <Modal
        title="Add Student"
        open={isModalOpen}
        onOk={handleAddStudent}
        onCancel={() => setIsModalOpen(false)}
        okText="Add"
        confirmLoading={false}
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="reg_no" label="Reg No" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input style={{ textTransform: "capitalize" }} />
          </Form.Item>
          <Form.Item name="batch_id" label="Batch" rules={[{ required: true }]}>
            <Select
              loading={batchLoading}
              placeholder="Select batch"
              options={batches.map(batch => ({
                label: batch.batch_name,
                value: batch.batch_id,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="join_date"
            label="Join Date"
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="gender"
            label="Gender"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: "Male", value: "Male" },
                { label: "Female", value: "Female" },
                { label: "Other", value: "Other" },
              ]}
            />
          </Form.Item>
          <Form.Item name="phone" label="Phone No" rules={[{ required: true }]}>
            <Input type="tel" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Batch Modal */}
      <Modal
        title="Add New Batch"
        open={isBatchModalOpen}
        onOk={handleAddBatch}
        onCancel={() => setIsBatchModalOpen(false)}
        okText="Add Batch"
      >
        <Form layout="vertical" form={batchForm}>
          <Form.Item 
            name="batch_name" 
            label="Batch Name" 
            rules={[{ required: true, message: 'Please input batch name!' }]}
          >
            <Input placeholder="e.g., B01-2023" style={{ textTransform: "uppercase" }} />
          </Form.Item>
          <Form.Item
            name="start_date"
            label="Start Date"
            rules={[{ required: true, message: 'Please select start date!' }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </main>
  );
}

export default Home;