import { getDB } from './database.js';

// Add a new course
export async function addCourse(course) {
  const db = await getDB();
  await db.execute(
    `INSERT INTO courses (course_id, course_name)
     VALUES ($1, $2)`,
    [
      course.course_id,
      course.course_name
    ]
  );
}

// Get all courses
export async function getAllCourses() {
  const db = await getDB();
  return await db.select(
    `SELECT * FROM courses
     ORDER BY course_name ASC`
  );
}

// Get a single course by ID
export async function getCourse(course_id) {
  const db = await getDB();
  const result = await db.select(
    `SELECT * FROM courses
     WHERE course_id = $1
     LIMIT 1`,
    [course_id]
  );
  return result[0] || null;
}

// Update a course
export async function updateCourse(course_id, updatedFields) {
  const db = await getDB();
  const fields = Object.keys(updatedFields);
  if (fields.length === 0) return false;

  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
  const values = fields.map(field => updatedFields[field]);
  values.push(course_id);

  await db.execute(
    `UPDATE courses SET ${setClause} WHERE course_id = $${fields.length + 1}`,
    values
  );
}

// Delete a course
export async function deleteCourse(course_id) {
  const db = await getDB();
  await db.execute(
    `DELETE FROM courses WHERE course_id = $1`,
    [course_id]
  );
}
