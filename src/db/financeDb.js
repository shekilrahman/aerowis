import { getDB } from './database.js';

// 🔧 Generate custom receipt ID like "25-26/001"
function getFinancialYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  if (month >= 4) {
    return `${year % 100}-${(year + 1) % 100}`;
  } else {
    return `${(year - 1) % 100}-${year % 100}`;
  }
}

async function generateReceiptId() {
  const db = await getDB();
  const fy = getFinancialYear();

  const result = await db.select(
    `SELECT receipt_id FROM finance WHERE receipt_id LIKE ? ORDER BY receipt_id DESC LIMIT 1`,
    [`${fy}/%`]
  );

  let nextNumber = 1;
  if (result.length > 0) {
    const lastId = result[0].receipt_id;
    const lastNum = parseInt(lastId.split("/")[1]);
    nextNumber = lastNum + 1;
  }

  const padded = String(nextNumber).padStart(3, "0");
  return `${fy}/${padded}`;
}

// ✅ Add a new finance record
export async function addFinance(finance) {
  const db = await getDB();
  const receipt_id = await generateReceiptId();

  await db.execute(
    `INSERT INTO finance (receipt_id, student_id, amount, type, payment_method, payment_date)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      receipt_id,
      finance.student_id,
      finance.amount,
      finance.type,
      finance.payment_method,
      finance.payment_date,
    ]
  );

  return receipt_id;
}

// ✅ Get all finance records (optionally by student)
export async function getAllFinance(student_id = null) {
  const db = await getDB();

  if (student_id) {
    return await db.select(
      `SELECT f.*, s.name AS student_name
       FROM finance f
       JOIN students s ON f.student_id = s.reg_no
       WHERE f.student_id = $1
       ORDER BY f.payment_date DESC`,
      [student_id]
    );
  }

  return await db.select(
    `SELECT f.*, s.name AS student_name
     FROM finance f
     JOIN students s ON f.student_id = s.reg_no
     ORDER BY f.payment_date DESC`
  );
}

// ✅ Get one finance record by receipt_id
export async function getFinance(receipt_id) {
  const db = await getDB();
  const result = await db.select(
    `SELECT f.*, s.name AS student_name
     FROM finance f
     JOIN students s ON f.student_id = s.reg_no
     WHERE f.receipt_id = $1
     LIMIT 1`,
    [receipt_id]
  );

  return result[0] || null;
}

// ✅ Update a finance record
export async function updateFinance(receipt_id, updatedFields) {
  const db = await getDB();
  const fields = Object.keys(updatedFields);
  if (fields.length === 0) return false;

  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
  const values = fields.map(field => updatedFields[field]);
  values.push(receipt_id);

  await db.execute(
    `UPDATE finance SET ${setClause} WHERE receipt_id = $${fields.length + 1}`,
    values
  );
}

// ✅ Delete a finance record
export async function deleteFinance(receipt_id) {
  const db = await getDB();
  await db.execute(
    `DELETE FROM finance WHERE receipt_id = $1`,
    [receipt_id]
  );
}
