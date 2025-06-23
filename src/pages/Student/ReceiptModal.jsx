import { useRef } from "react";
import { Button, message } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import dayjs from "dayjs";

import logo from "../../assets/logo_dark_crop.png";
import stamp from "../../assets/stamp.png";

export default function ReceiptModal({ payment, student }) {
  const printRef = useRef();

  if (!payment || isNaN(Number(payment.amount))) {
    return (
      <div style={{ color: "red", padding: "1rem" }}>
        Invalid payment data. Please check the amount and receipt details.
      </div>
    );
  }

  function inWords(n) {
    if (n < 0 || isNaN(n)) return "Invalid Amount";
    const single_digit = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const double_digit = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const below_hundred = [
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    function translate(n) {
      let word = "";
      if (n < 10) {
        word = single_digit[n] + " ";
      } else if (n < 20) {
        word = double_digit[n - 10] + " ";
      } else if (n < 100) {
        word = below_hundred[Math.floor(n / 10) - 2] + " " + translate(n % 10);
      } else if (n < 1000) {
        word =
          single_digit[Math.floor(n / 100)] + " Hundred " + translate(n % 100);
      } else if (n < 1000000) {
        word =
          translate(Math.floor(n / 1000)).trim() +
          " Thousand " +
          translate(n % 1000);
      } else if (n < 1000000000) {
        word =
          translate(Math.floor(n / 1000000)).trim() +
          " Million " +
          translate(n % 1000000);
      } else {
        word =
          translate(Math.floor(n / 1000000000)).trim() +
          " Billion " +
          translate(n % 1000000000);
      }
      return word;
    }

    return translate(n).trim() + " only";
  }

  const downloadPDF = async () => {
    try {
      const element = printRef.current;

      // High-quality canvas options
      const canvas = await html2canvas(element, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        letterRendering: true,
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95); // JPEG with high quality

      // A4 dimensions in mm
      const pdfWidth = 210;

      // Calculate image dimensions to fit A4
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true, // Enable compression
      });

      // Add image to PDF
      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);

      // Save with optimized filename
      const filename = `${payment?.receipt_id || "000"}-Receipt.pdf`;
      pdf.save(filename);

      message.success("Receipt Downloaded Successfully");
    } catch (error) {
      console.error("PDF generation failed:", error);
      message.error("Failed to generate PDF");
    }
  };

  return (
    <div>
      <div
        style={{ marginBottom: 16, display: "flex", justifyContent: "start" }}
      >
        <Button
          icon={<DownloadOutlined />}
          type="primary"
          onClick={downloadPDF}
        >
          Download PDF
        </Button>
      </div>

      <div ref={printRef} style={styles.a4}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>RECEIPT</h1>
          <img src={logo} alt="logo" style={styles.logo} />
        </div>

        {/* Details */}
        <div style={styles.topSection}>
          <table style={{ width: "100%" }}>
            <tbody>
              <tr>
                <td style={{ verticalAlign: "top" }}>
                  <p style={{ margin: 0 }}>
                    <strong>DATE:</strong>
                  </p>
                  <p style={{ margin: 0, marginBottom: 20 }}>
                    {payment.date
                      ? dayjs(payment.date).format("DD/MM/YYYY")
                      : "N/A"}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>RECEIPT:</strong>
                  </p>
                  <p style={{ margin: 0 }}>{payment.receipt_id || "N/A"}</p>
                </td>

                <td style={{ verticalAlign: "top", fontWeight:"bold" }}>To:</td>

                <td
                  style={{
                    width: "25%",
                    textAlign: "right",
                    verticalAlign: "top",
                  }}
                >
                  <p>
                    {student?.name|| "Name ?"}
                    <br />
                    {student?.address|| "Address ?"}
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Student Info Table */}
        <table style={styles.table}>
          <thead>
            <tr style={{ backgroundColor: "#93caf2"}}>
              <th style={{...styles.th, fontSize: "15px" , padding: 5}}>STUDENT NAME</th>
              <th style={{...styles.th, fontSize: "15px" , padding: 5}}>COURSE</th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: "#e9f4fc" }}>
            <tr>
              <td style={{...styles.td, fontSize: "13px" , padding: 5}}>
                <strong>{student?.name?.toUpperCase() || "N/A"}</strong>
              </td>
              <td style={{...styles.td, fontSize: "13px" , padding: 5}}>CPL GROUND CLASS</td>
            </tr>
          </tbody>
        </table>

        {/* Payment Info Table */}
        <table style={{ ...styles.table, marginBottom: 0 }}>
          <thead>
            <tr>
              <th style={styles.th}>SL NO</th>
              <th style={styles.th}>DESCRIPTION</th>
              <th style={styles.th}>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ ...styles.td, paddingBottom: 180, width: 60 , textAlign:"center"}}>
                01
              </td>
              <td style={{ ...styles.td, paddingBottom: 180 }}>
                {payment.type || "N/A"} Fee
              </td>
              <td style={{ ...styles.td, paddingBottom: 50, width: 100, textAlign:"right" }}>
                ₹ {Number(payment.amount).toLocaleString()}
                <br />
                <img src={stamp} alt="stamp" style={styles.stamp} />
              </td>
            </tr>
          </tbody>
        </table>

        {/* Amount Words and Total */}
        <table style={{ ...styles.table, borderTop: 0 }}>
          <tr>
            <td
              colSpan={3}
              style={{
                ...styles.td,
                fontWeight: "bold",
                padding: 3,
                border: 0,
                textTransform: "uppercase",
              }}
            >
              Amount in Words
            </td>
          </tr>
          <tr style={{ backgroundColor: "#e9f4fc" }}>
            <td
              colSpan={1}
              style={{ ...styles.td, fontWeight: "bolder", padding: 5 }}
            >
              <span style={{ textTransform: "uppercase" }}>
                {inWords(Number(payment.amount))}
              </span>
            </td>
            <td
              style={{
                ...styles.td,
                fontWeight: "bold",
                textAlign: "right",
                padding: 5,
              }}
            >
              TOTAL
            </td>
            <td
              style={{
                ...styles.td,
                fontWeight: "bolder",
                fontSize: "larger",
                textAlign: "right",
                padding: 5,
              }}
            >
              ₹ {Number(payment.amount).toLocaleString()}
            </td>
          </tr>
        </table>

        {/* Notes */}
        <p style={styles.note}>
          NB: Fees once paid are strictly non-refundable under any
          circumstances. Refunds will only be considered if the student is
          declared permanently medically unfit to pursue the course, supported
          by valid documentation from DGCA-authorised doctors.
        </p>

        {/* Declaration */}
        <p style={styles.ack}>
          Aerowis Aviation hereby acknowledges receipt of the sum specified
          <br />
          above from the individual named above as payment for the course
          indicated above.
          <br />
          <br />
          <br />
          Thank you !
        </p>

        {/* Footer */}
        <div style={styles.footer}>
          <p>
            <strong>Aerowis Aviation</strong>, Hi-Lite Business Park, Phase-2, 5
            <sup>th</sup> floor, 2519,
            <br />
            Olavanna, Palazhi, Kozhikode, 673014, Kerala.
            <br />
            Mob: +91 8594 000 730, Email: info@aerowis.com
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  a4: {
    width: "210mm",
    minHeight: "296mm",
    padding: "20mm",
    fontFamily: "Century Gothic, sans-serif",
    fontSize: "14px",
    lineHeight: "1.4",
    boxSizing: "border-box",
    background: "#fff",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  title: {
    color: "#121244",
    fontWeight: "bold",
    fontSize: "30px",
  },
  logo: {
    width: "220px",
    position: "relative",
    bottom: "35px",
    objectFit: "contain",
  },
  topSection: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "25px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    border: "3px solid #93caf2",
    marginBottom: 40,
  },
  th: {
    border: "1.5px solid #93caf2",
    padding: "12px 8px",
    fontWeight: "900",
    textAlign: "left",
    fontSize: "13px",
  },
  td: {
    border: "1.5px solid #93caf2",
    padding: "3px",
    fontSize: "13px",
  },
  note: {
    fontSize: "11px",
    letterSpacing: "0.02px",
    color: "#555",
    marginTop: "20px",
    lineHeight: "1.5",
  },
  ack: {
    marginTop: "20px",
    fontWeight: "bold",
    textAlign: "center",
    color: "#121244",
    fontSize: "12px",
  },
  footer: {
    fontSize: "12px",
    textAlign: "center",
    marginTop: "10px",
    fontWeight: "bold",
    paddingTop: "10px",
    color: "#1f2937",
    lineHeight: "1.5",
  },
  stamp: {
    width: "120px",
    position: "relative",
    top: "40px",
    right: "40px",
    transform: "rotate(30deg)",
    opacity: 1,
  },
};
