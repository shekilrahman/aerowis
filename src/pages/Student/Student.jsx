import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudent, updateStudent } from "../../db/studentDb";
import style from "./Student.module.css";

import { open } from "@tauri-apps/plugin-dialog";
import {
  writeFile,
  readFile,
  remove,
  exists,
  mkdir,
  BaseDirectory,
} from "@tauri-apps/plugin-fs";
import { downloadDir } from "@tauri-apps/api/path";
import ProfilePhoto from "../../utils/fileUtils";

import male_avt from "../../assets/male_avt.png";
import female_avt from "../../assets/female_avt.png";

import Header from "../components/Header";

import {
  Button,
  Typography,
  Tabs,
  message,
  Tooltip,
  Popconfirm,
} from "antd";

import {
  IdcardOutlined,
  CalendarOutlined,
  PhoneOutlined,
  TeamOutlined,
  ArrowLeftOutlined,
  CameraOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

import AcademicSummary from "./AcademicSummary";
import FinancialSummary from "./FinancialSummary";
import StudentData from "./StudentData";

const { Title } = Typography;

const Student = () => {
  const { reg_no } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);

  const profilePath = `profile_images/${reg_no}.png`;

  // Load student data and profile photo
  useEffect(() => {
    const loadStudent = async () => {
      try {
        const studentData = await getStudent(reg_no);
        if (!studentData) return setLoading(false);
        setStudent(studentData);

        const imageUrl = await ProfilePhoto.getUrl(studentData);
        setAvatarUrl(imageUrl);
      } catch (err) {
        console.error("Failed to load student:", err);
        message.error("Failed to load student");
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, [reg_no]);

  // Upload Profile Photo
  const handleUploadPhoto = async () => {
    try {
      setUploading(true);
      const selected = await open({
        multiple: false,
        filters: [{ name: "Image", extensions: ["png", "jpg", "jpeg"] }],
        defaultPath: await downloadDir(),
      });

      if (!selected) return;

      const imageData = await readFile(selected);
      await writeFile(profilePath, imageData, {
        baseDir: BaseDirectory.AppData,
      });

      const newImageUrl = await ProfilePhoto.getUrl(student);
      setAvatarUrl(newImageUrl);
      message.success("Profile photo updated");
    } catch (err) {
      console.error("Upload failed:", err);
      message.error("Failed to update photo");
    } finally {
      setUploading(false);
    }
  };

  // Delete (Reset) Photo
  const handleDeletePhoto = async () => {
    try {
      const fileExists = await exists(profilePath, {
        baseDir: BaseDirectory.AppData,
      });
      if (!fileExists) return;

      await remove(profilePath, { baseDir: BaseDirectory.AppData });

      const fallback = await ProfilePhoto.getUrl(student);
      setAvatarUrl(fallback);
      message.success("Profile photo reset to default");
    } catch (err) {
      console.error("Delete failed:", err);
      message.error("Failed to delete photo");
    }
  };

  if (loading) {
    return (
      <div className={style.loadingContainer}>
        <div className={style.loadingContent}>Loading student data...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className={style.loadingContainer}>
        <div className={style.errorContent}>
          <Title level={4}>Student not found</Title>
          <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
            Back to List
          </Button>
        </div>
      </div>
    );
  }

  const defaultAvatar = student.gender === "Female" ? female_avt : male_avt;

  // Define tab items
  const tabItems = [
    {
      key: '1',
      label: 'Academic',
      children: <AcademicSummary student={student} />,
    },
    {
      key: '2',
      label: 'Financial',
      children: <FinancialSummary student={student} />,
    },
    {
      key: '3',
      label: 'Data',
      children: (
        <StudentData
          student={student}
          onUpdate={async (updatedFields) => {
            try {
              await updateStudent(student.reg_no, updatedFields);
              message.success("Student data updated");

              // Live update UI
              setStudent((prev) => ({
                ...prev,
                ...updatedFields,
              }));
            } catch (error) {
              console.error("Failed to update student:", error);
              message.error("Update failed");
            }
          }}
        />
      ),
    },
  ];

  return (
    <div className={style.profileContainer}>
      <Header />
      <div className={style.profileLayout}>
        {/* Sidebar */}
        <div className={style.profileSidebar}>
          <Button
            onClick={() => navigate(-1)}
            icon={<ArrowLeftOutlined />}
            className={style.backButton}
          >
            Back to Students
          </Button>

          <div className={style.avatarSection}>
            <div className={style.avatarActions}>
              <Tooltip title="Update Photo">
                <Button
                  type="primary"
                  shape="circle"
                  icon={uploading ? <LoadingOutlined /> : <CameraOutlined />}
                  onClick={handleUploadPhoto}
                  loading={uploading}
                />
              </Tooltip>
              <Tooltip title="Reset to Default">
                <Popconfirm
                  title="Reset profile photo to default?"
                  onConfirm={handleDeletePhoto}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    type="default"
                    danger
                    shape="circle"
                    icon={<DeleteOutlined />}
                  />
                </Popconfirm>
              </Tooltip>
            </div>
            <img
              src={avatarUrl || defaultAvatar}
              className={style.profileAvatar}
              alt="Profile"
              onError={(e) => {
                e.target.src = defaultAvatar;
              }}
            />
          </div>

          <div className={style.dataSection}>
            <div className={style.studentName}>{student.name}</div>
            <div className={style.detailsList}>
              {[
                {
                  label: "Reg No",
                  icon: <IdcardOutlined />,
                  value: student.reg_no,
                },
                {
                  label: "Batch",
                  icon: <TeamOutlined />,
                  value: student.batch_name,
                },
                {
                  label: "Join Date",
                  icon: <CalendarOutlined />,
                  value: student.join_date,
                },
                {
                  label: "Phone",
                  icon: <PhoneOutlined />,
                  value: student.phone,
                },
                {
                  label: "Gender",
                  icon: <TeamOutlined />,
                  value: student.gender,
                },
              ].map((item, i) => (
                <div className={style.detailItem} key={i}>
                  <span className={style.detailLabel}>
                    {item.icon} {item.label}
                  </span>
                  <span
                    className={style.detailValue}
                    style={
                      item.label === "Batch"
                        ? { textTransform: "capitalize" }
                        : {}
                    }
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={style.mainContent}>
          <Tabs 
            defaultActiveKey="1"
            items={tabItems}
          />
        </div>
      </div>
    </div>
  );
};

export default Student;