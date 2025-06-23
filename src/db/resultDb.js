import { getDB } from './database.js';

// Add a result
export async function addResult(result) {
  const db = await getDB();
  await db.execute(
    `INSERT INTO results (student_id, exam_id, obtained_mark, status)
     VALUES ($1, $2, $3, $4)`,
    [
      result.student_id,
      result.exam_id,
      result.obtained_mark,
      result.status
    ]
  );
}

// Get all results with student & exam info
export async function getAllResults() {
  const db = await getDB();
  return await db.select(`
    SELECT 
      r.result_id,
      r.obtained_mark,
      r.status,
      s.name AS student_name,
      s.reg_no AS student_id,
      e.exam_name,
      e.exam_date
    FROM results r
    JOIN students s ON r.student_id = s.reg_no
    JOIN exams e ON r.exam_id = e.exam_id
    ORDER BY r.result_id DESC
  `);
}

// Get all results for a specific exam
export async function getResultsByExam(exam_id) {
  const db = await getDB();
  return await db.select(
    `SELECT 
      r.result_id,
      r.obtained_mark,
      r.status,
      s.name AS student_name,
      s.reg_no AS student_id,
      e.exam_name,
      e.exam_date
     FROM results r
     JOIN students s ON r.student_id = s.reg_no
     JOIN exams e ON r.exam_id = e.exam_id
     WHERE r.exam_id = $1
     ORDER BY s.name ASC`,
    [exam_id]
  );
}


// Get all results for a specific student
export async function getResultsByStudent(student_id) {
  const db = await getDB();
  return await db.select(
    `SELECT 
      r.result_id,
      r.obtained_mark,
      r.status,
      e.exam_name,
      e.exam_date,
      e.max_score,
      e.cutoff_score
     FROM results r
     JOIN exams e ON r.exam_id = e.exam_id
     WHERE r.student_id = $1
     ORDER BY e.exam_date DESC`,
    [student_id]
  );
}



// Get result by result_id
export async function getResult(result_id) {
  const db = await getDB();
  const result = await db.select(
    `SELECT 
      r.*, 
      s.name AS student_name,
      e.exam_name,
      e.exam_date
     FROM results r
     JOIN students s ON r.student_id = s.reg_no
     JOIN exams e ON r.exam_id = e.exam_id
     WHERE r.result_id = $1
     LIMIT 1`,
    [result_id]
  );
  return result[0] || null;
}

// Update a result
export async function updateResult(result_id, updatedFields) {
  const db = await getDB();
  const fields = Object.keys(updatedFields);
  if (fields.length === 0) return false;

  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
  const values = fields.map(field => updatedFields[field]);
  values.push(result_id);

  await db.execute(
    `UPDATE results SET ${setClause} WHERE result_id = $${fields.length + 1}`,
    values
  );
}

// Delete a result
export async function deleteResult(result_id) {
  const db = await getDB();
  await db.execute(
    `DELETE FROM results WHERE result_id = $1`,
    [result_id]
  );
}
