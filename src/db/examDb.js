import { getDB } from './database.js';

// Create an exam (now includes exam_date)
export async function addExam(exam) {
  const db = await getDB();
  await db.execute(
    `INSERT INTO exams (exam_name, course_id, batch_id, max_score, cutoff_score, instructor_id, exam_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      exam.exam_name,
      exam.course_id,
      exam.batch_id,
      exam.max_score,
      exam.cutoff_score,
      exam.instructor_id,
      exam.exam_date, // ✅ new field
    ]
  );
}

// Read all exams with course, batch, instructor, and date info
export async function getAllExams() {
  const db = await getDB();
  return await db.select(`
    SELECT 
      e.exam_id,
      e.exam_name,
      e.max_score,
      e.cutoff_score,
      e.exam_date,
      c.course_name,
      b.batch_name,
      i.name AS instructor_name,
      e.course_id,
      e.batch_id,
      e.instructor_id
    FROM exams e
    JOIN courses c ON e.course_id = c.course_id
    JOIN batches b ON e.batch_id = b.batch_id
    JOIN instructors i ON e.instructor_id = i.instructor_id
    ORDER BY e.exam_date DESC
  `);
}

// Get single exam by ID with related info
export async function getExam(exam_id) {
  const db = await getDB();
  const result = await db.select(
    `SELECT 
      e.*, 
      c.course_name,
      b.batch_name,
      i.name AS instructor_name
     FROM exams e
     JOIN courses c ON e.course_id = c.course_id
     JOIN batches b ON e.batch_id = b.batch_id
     JOIN instructors i ON e.instructor_id = i.instructor_id
     WHERE e.exam_id = $1
     LIMIT 1`,
    [exam_id]
  );
  return result[0] || null;
}

// Update exam (supports exam_date too)
export async function updateExam(exam_id, updatedFields) {
  const db = await getDB();
  const fields = Object.keys(updatedFields);
  if (fields.length === 0) return false;

  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
  const values = fields.map(field => updatedFields[field]);
  values.push(exam_id);

  await db.execute(
    `UPDATE exams SET ${setClause} WHERE exam_id = $${fields.length + 1}`,
    values
  );
}

// Delete exam
export async function deleteExam(exam_id) {
  const db = await getDB();
  await db.execute(
    `DELETE FROM exams WHERE exam_id = $1`,
    [exam_id]
  );
}
