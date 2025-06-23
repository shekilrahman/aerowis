import { getDB } from './database.js';

// Add a new instructor
export async function addInstructor(instructor) {
  const db = await getDB();
  await db.execute(
    `INSERT INTO instructors (name, email, phone)
     VALUES ($1, $2, $3)`,
    [
      instructor.name,
      instructor.email || null,
      instructor.phone || null,
    ]
  );
}

// Get all instructors
export async function getAllInstructors() {
  const db = await getDB();
  return await db.select(
    `SELECT * FROM instructors ORDER BY name ASC`
  );
}

// Get a single instructor by ID
export async function getInstructor(instructor_id) {
  const db = await getDB();
  const result = await db.select(
    `SELECT * FROM instructors WHERE instructor_id = $1 LIMIT 1`,
    [instructor_id]
  );
  return result[0] || null;
}

// Update instructor details
export async function updateInstructor(instructor_id, updatedFields) {
  const db = await getDB();
  const fields = Object.keys(updatedFields);
  if (fields.length === 0) return false;

  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
  const values = fields.map(field => updatedFields[field]);
  values.push(instructor_id);

  await db.execute(
    `UPDATE instructors SET ${setClause} WHERE instructor_id = $${fields.length + 1}`,
    values
  );
}

// Delete an instructor
export async function deleteInstructor(instructor_id) {
  const db = await getDB();
  await db.execute(
    `DELETE FROM instructors WHERE instructor_id = $1`,
    [instructor_id]
  );
}
