// src/db/batchDb.js
import { getDB } from './database.js';

// Create new batch
export async function addBatch(batch) {
  const db = await getDB();
  try {
    const result = await db.execute(
      `INSERT INTO batches (batch_name, start_date)
       VALUES ($1, $2)`,
      [batch.batch_name, batch.start_date || null]
    );
  } catch (error) {
    console.error("Error adding batch:", error);
    throw new Error("Failed to add batch");
  }
}

// Get all batches
export async function getAllBatches() {
  const db = await getDB();
  try {
    return await db.select(
      `SELECT b.*, 
       (SELECT COUNT(*) FROM students s WHERE s.batch_id = b.batch_id) as student_count
       FROM batches b
       ORDER BY b.start_date DESC`
    );
  } catch (error) {
    console.error("Error fetching batches:", error);
    return [];
  }
}

// Get single batch by ID
export async function getBatch(batch_id) {
  const db = await getDB();
  try {
    const result = await db.select(
      `SELECT b.*,
       (SELECT COUNT(*) FROM students s WHERE s.batch_id = b.batch_id) as student_count
       FROM batches b
       WHERE b.batch_id = $1
       LIMIT 1`,
      [batch_id]
    );
    return result[0] || null;
  } catch (error) {
    console.error("Error fetching batch:", error);
    return null;
  }
}

// Get batch by name
export async function getBatchByName(batch_name) {
  const db = await getDB();
  try {
    const result = await db.select(
      `SELECT * FROM batches WHERE batch_name = $1 LIMIT 1`,
      [batch_name]
    );
    return result[0] || null;
  } catch (error) {
    console.error("Error fetching batch by name:", error);
    return null;
  }
}

// Update batch information
export async function updateBatch(batch_id, updatedFields) {
  const db = await getDB();
  try {
    const fields = Object.keys(updatedFields);
    if (fields.length === 0) return false;

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const values = fields.map(field => updatedFields[field]);
    values.push(batch_id);

    const result = await db.execute(
      `UPDATE batches SET ${setClause} WHERE batch_id = $${fields.length + 1}`,
      values
    );
    return result.rowsAffected > 0;
  } catch (error) {
    console.error("Error updating batch:", error);
    return false;
  }
}

// Delete batch (only if no students are assigned)
export async function deleteBatch(batch_id) {
  const db = await getDB();
  try {
    // Check if batch has students first
    const students = await db.select(
      `SELECT 1 FROM students WHERE batch_id = $1 LIMIT 1`,
      [batch_id]
    );
    
    if (students.length > 0) {
      throw new Error("Cannot delete batch with assigned students");
    }

    const result = await db.execute(
      `DELETE FROM batches WHERE batch_id = $1`,
      [batch_id]
    );
    return result.rowsAffected > 0;
  } catch (error) {
    console.error("Error deleting batch:", error);
    throw error; // Re-throw to let caller handle
  }
}