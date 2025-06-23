// src/db/studentDb.js
import { getDB } from './database.js';

// Create student with batch_id
export async function addStudent(student) {
  const db = await getDB();
  await db.execute(
    `INSERT INTO students (reg_no, name, batch_id, join_date, gender, phone)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      student.reg_no,
      student.name,
      student.batch_id,  // Now using batch_id instead of batch name
      student.join_date || null,
      student.gender || null,
      student.phone || null,
    ]
  );
}

// Read all students with optional batch filter
export async function getAllStudents(batch_id = null) {
  const db = await getDB();
  if (batch_id) {
    return await db.select(
      `SELECT s.*, b.batch_name 
       FROM students s
       JOIN batches b ON s.batch_id = b.batch_id
       WHERE s.batch_id = $1
       ORDER BY s.name ASC`,
      [batch_id]
    );
  }
  return await db.select(
    `SELECT s.*, b.batch_name 
     FROM students s
     JOIN batches b ON s.batch_id = b.batch_id
     ORDER BY s.name ASC`
  );
}

// Read single student with batch info
export async function getStudent(reg_no) {
  const db = await getDB();
  const result = await db.select(
    `SELECT s.*, b.batch_name, b.start_date as batch_start_date
     FROM students s
     JOIN batches b ON s.batch_id = b.batch_id
     WHERE s.reg_no = $1
     LIMIT 1`,
    [reg_no]
  );
  return result[0] || null;
}

// Update student information
export async function updateStudent(reg_no, updatedFields) {
  const db = await getDB();
  const fields = Object.keys(updatedFields);
  if (fields.length === 0) return false;

  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
  const values = fields.map(field => updatedFields[field]);
  values.push(reg_no);

  await db.execute(
    `UPDATE students SET ${setClause} WHERE reg_no = $${fields.length + 1}`,
    values
  );
}

// Delete student
export async function deleteStudent(reg_no) {
  const db = await getDB();
  await db.execute(
    `DELETE FROM students WHERE reg_no = $1`,
    [reg_no]
  );
}