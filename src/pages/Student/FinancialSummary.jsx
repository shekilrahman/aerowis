import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Typography,
  Table,
  Badge,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  Tag,
  Divider,
  message,
} from "antd";
import {
  PlusOutlined,
  WalletOutlined,
  CalendarOutlined,
  BankOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import style from "./Student.module.css";
import ReceiptModal from "./ReceiptModal";
import { getAllFinance, addFinance } from "../../db/financeDb";

const { Text, Title } = Typography;

export default function FinancialSummary({ student }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receiptVisible, setReceiptVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [form] = Form.useForm();
  const [payments, setPayments] = useState([]);

  const methodConfig = {
    UPI: { color: "processing", icon: <WalletOutlined /> },
    CASH: { color: "success", icon: <BankOutlined /> },
    BANK: { color: "default", icon: <BankOutlined /> },
    OTHER: { color: "warning", icon: <WalletOutlined /> },
  };

  const loadPayments = async () => {
    if (!student?.reg_no) return;
    const data = await getAllFinance(student.reg_no);
    const formatted = data.map((p) => ({
      key: p.receipt_id,
      receipt_id: p.receipt_id,
      type: p.type,
      amount: p.amount,
      method: p.payment_method,
      date: p.payment_date,
    }));
    setPayments(formatted);
  };

  useEffect(() => {
    loadPayments();
  }, [student]);

  const handleAddPayment = async (values) => {
    if (!student?.reg_no) {
      message.error("Student registration number is missing.");
      return;
    }

    if (student?.address?.trim()) {
      await addFinance({
        student_id: parseInt(student.reg_no, 10),
        amount: values.amount,
        type: values.type,
        payment_method: values.method,
        payment_date: values.date?.format("YYYY-MM-DD"),
      });

      await loadPayments();
      form.resetFields();
      setIsModalOpen(false);
    } else {
      message.error("Student address is missing. Please update the profile first.");
    }
  };

  const handleRowClick = (record) => {
    setSelectedPayment(record);
    setReceiptVisible(true);
  };

  const columns = [
    {
      title: "Receipt ID",
      dataIndex: "receipt_id",
      key: "receipt_id",
      render: (id) => <Text strong>{id}</Text>,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => (
        <Space>
          <CalendarOutlined style={{ color: "#1890ff" }} />
          <Text strong>{dayjs(date).format("DD MMM, YYYY")}</Text>
        </Space>
      ),
    },
    {
      title: "Payment Type",
      dataIndex: "type",
      key: "type",
      render: (type) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amt) => (
        <Text strong style={{ fontSize: 16, color: "#52c41a" }}>
          ₹{amt.toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Method",
      dataIndex: "method",
      key: "method",
      render: (method) => (
        <Badge
          status={methodConfig[method]?.color}
          text={
            <Space>
              {methodConfig[method]?.icon}
              {method}
            </Space>
          }
        />
      ),
    },
  ];

  return (
    <div className={style.finaceContiner}>
      {/* Header */}
      <Card className={style.finaceHeader}>
        <div style={{ color: "white", textAlign: "center" }}>
          <Title level={2} style={{ color: "white", margin: 0 }}>
            Financial Dashboard
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 16 }}>
            {student?.name || "Student"} - Finance Portal
          </Text>
        </div>
      </Card>

      {/* Table Section */}
      <Card
        title={
          <Space>
            <BankOutlined style={{ color: "#1890ff" }} />
            <Title level={4} style={{ margin: 0 }}>
              Payment History
            </Title>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
            className={style.addPaymentBtn}
          >
            Add Payment
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={payments}
          pagination={false}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
        />
      </Card>

      {/* Add Payment Modal */}
      <Modal
        title={
          <Space>
            <PlusOutlined style={{ color: "#1890ff" }} />
            <span>Add New Payment</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={500}
        maskClosable={false}
      >
        <Divider />
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddPayment}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            label="Payment Type"
            name="type"
            rules={[{ required: true, message: "Please select payment type" }]}
          >
            <Select placeholder="Select payment type" size="large">
              <Select.Option value="Admission">🎓 Admission Fee</Select.Option>
              <Select.Option value="Tuition">📚 Tuition Fee</Select.Option>
              <Select.Option value="Other">📝 Other</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Amount"
            name="amount"
            rules={[{ required: true, message: "Please enter amount" }]}
          >
            <Input
              type="number"
              placeholder="Enter amount"
              prefix="₹"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Payment Method"
            name="method"
            rules={[{ required: true, message: "Please select payment method" }]}
          >
            <Select placeholder="Select payment method" size="large">
              <Select.Option value="UPI">📱 UPI</Select.Option>
              <Select.Option value="CASH">💵 Cash</Select.Option>
              <Select.Option value="BANK">🏦 Bank Transfer</Select.Option>
              <Select.Option value="OTHER">🔄 Other</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Payment Date"
            name="date"
            rules={[{ required: true, message: "Please select date" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              size="large"
              format="DD-MM-YYYY"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                }}
              >
                Add Payment
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Receipt Modal */}
      <Modal
        title={
          <div style={{ textAlign: "center" }}>
            <Title level={4}>Payment Receipt</Title>
          </div>
        }
        open={receiptVisible}
        onCancel={() => setReceiptVisible(false)}
        footer={null}
        width="220mm"
        centered
      >
        <ReceiptModal payment={selectedPayment} student={student} />
      </Modal>
    </div>
  );
}
