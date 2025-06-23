import { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Button,
  Form,
  Input,
  Row,
  Col,
  Space,
  InputNumber,
  DatePicker,
  Select,
  Divider,
} from "antd";
import {
  EditOutlined,
  SaveOutlined,
  RollbackOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  FileTextOutlined,
  IdcardOutlined,
  CalendarOutlined,
  TeamOutlined,
  HomeOutlined,
  BookOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "./Student.module.css";

const { Text, Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function StudentData({ student, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (isEditing && student) {
      form.setFieldsValue({
        ...student,
        join_date: student.join_date ? dayjs(student.join_date) : null,
        dob: student.dob ? dayjs(student.dob) : null,
      });
    }
  }, [isEditing, student, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      values.join_date = values.join_date ? values.join_date.format("YYYY-MM-DD") : null;
      values.dob = values.dob ? values.dob.format("YYYY-MM-DD") : null;
      onUpdate(values);
      setIsEditing(false);
    } catch (err) {
      console.error("Validation Failed:", err);
    }
  };

  const formatDisplayValue = (key, value) => {
    if (!value) return "-";
    if (["join_date", "dob"].includes(key)) {
      return dayjs(value).format("DD MMM YYYY");
    }
    return value;
  };

  const renderViewMode = () => (
    <div className={styles.cardBody}>
      {/* Basic Information Section */}
      <div className={styles.sectionTitle}>
        <UserOutlined />
        <span>Basic Information</span>
      </div>
      <div className={styles.twoColumnLayout}>
        <div className={styles.fieldRow}>
          <div className={styles.fieldLabel}>Name</div>
          <div className={styles.fieldValue}>{formatDisplayValue("name", student.name)}</div>
        </div>
        <div className={styles.fieldRow}>
          <div className={styles.fieldLabel}>Register No</div>
          <div className={styles.fieldValue}>{formatDisplayValue("reg_no", student.reg_no)}</div>
        </div>
        <div className={styles.fieldRow}>
          <div className={styles.fieldLabel}>Join Date</div>
          <div className={styles.fieldValue}>{formatDisplayValue("join_date", student.join_date)}</div>
        </div>
        <div className={styles.fieldRow}>
          <div className={styles.fieldLabel}>Date of Birth</div>
          <div className={styles.fieldValue}>{formatDisplayValue("dob", student.dob)}</div>
        </div>
        <div className={styles.fieldRow}>
          <div className={styles.fieldLabel}>Gender</div>
          <div className={styles.fieldValue}>{formatDisplayValue("gender", student.gender)}</div>
        </div>
        <div className={styles.fieldRow}>
          <div className={styles.fieldLabel}>Blood Group</div>
          <div className={styles.fieldValue}>{formatDisplayValue("blood_group", student.blood_group)}</div>
        </div>
      </div>

      <Divider className={styles.sectionDivider} />

      {/* Contact Information Section */}
      <div className={styles.sectionTitle}>
        <PhoneOutlined />
        <span>Contact Information</span>
      </div>
      <div className={styles.twoColumnLayout}>
        <div className={styles.fieldRow}>
          <div className={styles.fieldLabel}>Phone</div>
          <div className={styles.fieldValue}>{formatDisplayValue("phone", student.phone)}</div>
        </div>
        <div className={styles.fieldRow}>
          <div className={styles.fieldLabel}>Email</div>
          <div className={styles.fieldValue}>{formatDisplayValue("email", student.email)}</div>
        </div>
        <div className={styles.fieldRow}>
          <div className={styles.fieldLabel}>Address</div>
          <div className={styles.fieldValue}>{formatDisplayValue("address", student.address)}</div>
        </div>
      </div>

      <Divider className={styles.sectionDivider} />

      {/* Family Information Section */}
      <div className={styles.sectionTitle}>
        <TeamOutlined />
        <span>Family Information</span>
      </div>
      <div className={styles.twoColumnLayout}>
        <div className={styles.fieldRow}>
          <div className={styles.fieldLabel}>Father's Name</div>
          <div className={styles.fieldValue}>{formatDisplayValue("father_name", student.father_name)}</div>
        </div>
        <div className={styles.fieldRow}>
          <div className={styles.fieldLabel}>Father's Phone</div>
          <div className={styles.fieldValue}>{formatDisplayValue("father_phone", student.father_phone)}</div>
        </div>
        <div className={styles.fieldRow}>
          <div className={styles.fieldLabel}>Mother's Name</div>
          <div className={styles.fieldValue}>{formatDisplayValue("mother_name", student.mother_name)}</div>
        </div>
        <div className={styles.fieldRow}>
          <div className={styles.fieldLabel}>Mother's Phone</div>
          <div className={styles.fieldValue}>{formatDisplayValue("mother_phone", student.mother_phone)}</div>
        </div>
      </div>

      <Divider className={styles.sectionDivider} />

      {/* Academic Information Section */}
      <div className={styles.sectionTitle}>
        <BookOutlined />
        <span>Academic Information</span>
      </div>
      <div className={styles.twoColumnLayout}>
        <div className={styles.fieldRow}>
          <div className={styles.fieldLabel}>Education Qualification</div>
          <div className={styles.fieldValue}>{formatDisplayValue("education_qualification", student.education_qualification)}</div>
        </div>
        <div className={styles.fieldRow}>
          <div className={styles.fieldLabel}>Documents Link</div>
          <div className={styles.fieldValue}>
            {student.documents_link ? (
              <a href={student.documents_link} target="_blank">
                View Documents
              </a>
            ) : (
              "-"
            )}
          </div>
        </div>
        <div className={styles.fieldRow}>
          <div className={styles.fieldLabel}>Total Classes</div>
          <div className={styles.fieldValue}>{formatDisplayValue("total_classes", student.total_classes)}</div>
        </div>
        <div className={styles.fieldRow}>
          <div className={styles.fieldLabel}>Attendance</div>
          <div className={styles.fieldValue}>{formatDisplayValue("attendance", student.attendance)}</div>
        </div>
      </div>
    </div>
  );

  const renderEditMode = () => (
    <Form layout="vertical" form={form} className={styles.cardBody}>
      <Row gutter={16}>
        {/* Basic Information */}
        <Col span={24}>
          <div className={styles.sectionTitle}>
            <UserOutlined />
            <span>Basic Information</span>
          </div>
        </Col>
        <Col span={12}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input prefix={<UserOutlined />} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="reg_no" label="Register No">
            <Input disabled prefix={<IdcardOutlined />} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="join_date" label="Join Date">
            <DatePicker style={{ width: "100%" }} prefix={<CalendarOutlined />} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="dob" label="Date of Birth">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="gender" label="Gender">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="blood_group" label="Blood Group">
            <Select placeholder="Select Blood Group">
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(group => (
                <Option key={group} value={group}>{group}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        {/* Contact Information */}
        <Col span={24}>
          <div className={styles.sectionTitle}>
            <PhoneOutlined />
            <span>Contact Information</span>
          </div>
        </Col>
        <Col span={12}>
          <Form.Item name="phone" label="Phone">
            <Input prefix={<PhoneOutlined />} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="email" label="Email">
            <Input prefix={<MailOutlined />} />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item name="address" label="Address">
            <TextArea rows={2} prefix={<HomeOutlined />} />
          </Form.Item>
        </Col>

        {/* Family Information */}
        <Col span={24}>
          <div className={styles.sectionTitle}>
            <TeamOutlined />
            <span>Family Information</span>
          </div>
        </Col>
        <Col span={12}>
          <Form.Item name="father_name" label="Father's Name">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="father_phone" label="Father's Phone">
            <Input prefix={<PhoneOutlined />} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="mother_name" label="Mother's Name">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="mother_phone" label="Mother's Phone">
            <Input prefix={<PhoneOutlined />} />
          </Form.Item>
        </Col>

        {/* Academic Information */}
        <Col span={24}>
          <div className={styles.sectionTitle}>
            <BookOutlined />
            <span>Academic Information</span>
          </div>
        </Col>
        <Col span={12}>
          <Form.Item name="education_qualification" label="Education Qualification">
            <Select placeholder="Select Qualification">
              {["10+2 (PCM)", "10+2 (Other)", "Bachelor", "Other"].map(qual => (
                <Option key={qual} value={qual}>{qual}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="documents_link" label="Documents Folder Link">
            <Input prefix={<FileTextOutlined />} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="total_classes" label="Total Classes">
            <InputNumber style={{ width: "100%" }} min={0} prefix={<PieChartOutlined />} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="attendance" label="Attendance">
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

  return (
    <Card
      className={styles.card}
      title={
        <div className={styles.header}>
          <Title level={4} style={{ margin: 0 }}>Student Information</Title>
          {isEditing ? (
            <Space>
              <Button icon={<SaveOutlined />} onClick={handleSave} type="primary">
                Save
              </Button>
              <Button icon={<RollbackOutlined />} onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </Space>
          ) : (
            <Button
              icon={<EditOutlined />}
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          )}
        </div>
      }
    >
      {isEditing ? renderEditMode() : renderViewMode()}
    </Card>
  );
}