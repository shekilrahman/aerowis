import { useState, useEffect, useCallback, useMemo } from "react";
import Header from "../components/Header";
import Nav from "../components/Nav";
import style from "./Instructors.module.css";
import {
  Button,
  Flex,
  Input,
  Modal,
  Form,
  message,
  Spin,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { IoAddOutline } from "react-icons/io5";

import {
  addInstructor,
  getAllInstructors,
  updateInstructor,
  deleteInstructor,
} from "../../db/instructorDb";

// Instructor Card
const InstructorCard = ({ instructor, onEdit, onDelete }) => (
  <div className={style.instructorCard}>
    <div
      style={{
        textTransform: "capitalize",
        textAlign: "right",
        paddingRight: 10,
        paddingTop: 5,
        width: "100%",
      }}
    >
      <strong>{instructor.name}</strong>
    </div>

    <Flex justify="space-between" align="center">
      <div style={{ width: "100%" }}>
        <div>
          <strong>ID:</strong> {instructor.instructor_id}
        </div>
        <div>
          <strong>Email:</strong> {instructor.email}
        </div>
        <div>
          <strong>Phone:</strong> {instructor.phone}
        </div>
        <div style={{ float: "right" }}>
          <Flex gap="small">
            <Tooltip title="Edit">
              <Button
                shape="circle"
                type="default"
                icon={<EditOutlined />}
                style={{
                  backgroundColor: "#e6f4ff",
                  color: "#1677ff",
                  border: "none",
                }}
                onClick={() => onEdit(instructor)}
              />
            </Tooltip>
            <Tooltip title="Delete">
              <Popconfirm
                title="Are you sure to delete this instructor?"
                onConfirm={() => onDelete(instructor.instructor_id)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  shape="circle"
                  type="default"
                  icon={<DeleteOutlined />}
                  style={{
                    backgroundColor: "#fff1f0",
                    color: "#ff4d4f",
                    border: "none",
                  }}
                />
              </Popconfirm>
            </Tooltip>
          </Flex>
        </div>
      </div>
    </Flex>
  </div>
);

function Instructors() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [instructors, setInstructors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingInstructor, setEditingInstructor] = useState(null);

  const loadInstructors = useCallback(async () => {
    try {
      setLoading(true);
      const rows = await getAllInstructors();
      setInstructors(rows);
    } catch (err) {
      console.error("Failed to load instructors", err);
      message.error("Failed to load instructors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInstructors();
  }, [loadInstructors]);

  const handleSubmitInstructor = useCallback(async () => {
    try {
      const values = await form.validateFields();
      if (editingInstructor) {
        await updateInstructor(editingInstructor.instructor_id, values);
        message.success("Instructor updated successfully!");
      } else {
        await addInstructor(values);
        message.success("Instructor added successfully!");
      }
      form.resetFields();
      setIsModalOpen(false);
      setEditingInstructor(null);
      loadInstructors();
    } catch (err) {
      console.error("Save failed", err);
      message.error("Failed to save instructor");
    }
  }, [form, editingInstructor, loadInstructors]);

  const handleDeleteInstructor = useCallback(
    async (instructor_id) => {
      try {
        await deleteInstructor(instructor_id);
        message.success("Instructor deleted");
        loadInstructors();
      } catch (err) {
        console.error("Delete failed", err);
        message.error("Failed to delete instructor");
      }
    },
    [loadInstructors]
  );

  const filteredInstructors = useMemo(() => {
    if (!searchTerm.trim()) return instructors;
    const searchLower = searchTerm.toLowerCase();
    return instructors.filter(
      (inst) =>
        inst.name.toLowerCase().includes(searchLower) ||
        inst.instructor_id.toString().includes(searchLower)
    );
  }, [instructors, searchTerm]);

  return (
    <main className="App">
      <Header />
      <div className="container">
        <div className={style.wrap}>
          <div className={style.toolbar}>
            <Flex justify="space-between" style={{ width: "100%" }}>
              <Input
                placeholder="Search by Name or ID"
                style={{ width: "70%", height: 40, fontSize: "larger" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                prefix={<SearchOutlined />}
                allowClear
              />
              <Button
                icon={<IoAddOutline />}
                style={{ height: 40, fontSize: "larger" }}
                onClick={() => {
                  form.resetFields();
                  setEditingInstructor(null);
                  setIsModalOpen(true);
                }}
              >
                Add Instructor
              </Button>
            </Flex>
          </div>

          <div className={style.instructorContiner}>
            {loading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "200px",
                }}
              >
                <Spin size="large" />
              </div>
            ) : filteredInstructors.length === 0 ? (
              <div
                style={{ textAlign: "center", padding: "40px", color: "#666" }}
              >
                {searchTerm
                  ? `No instructors found matching "${searchTerm}"`
                  : "No instructors found"}
              </div>
            ) : (
              <Flex wrap="wrap" gap="large" justify="flex-start">
                {filteredInstructors.map((inst) => (
                  <InstructorCard
                    key={inst.instructor_id}
                    instructor={inst}
                    onEdit={(instructor) => {
                      form.setFieldsValue({
                        name: instructor.name,
                        email: instructor.email,
                        phone: instructor.phone,
                      });
                      setEditingInstructor(instructor);
                      setIsModalOpen(true);
                    }}
                    onDelete={handleDeleteInstructor}
                  />
                ))}
              </Flex>
            )}
          </div>
        </div>
      </div>
      <Nav />

      {/* Add/Edit Instructor Modal */}
      <Modal
        title={editingInstructor ? "Edit Instructor" : "Add Instructor"}
        open={isModalOpen}
        onOk={handleSubmitInstructor}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingInstructor(null);
          form.resetFields();
        }}
        okText={editingInstructor ? "Update" : "Add"}
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input style={{ textTransform: "capitalize" }} />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </main>
  );
}

export default Instructors;
