// src/db/database.js
import Database from '@tauri-apps/plugin-sql';

let db = null;

export async function getDB() {
  if (!db) {
    db = await Database.load('sqlite:aerowis.db');
    await db.execute(`PRAGMA foreign_keys = ON;`);
    await initializeDatabase();
  }
  return db;
}

export async function createBatchTable() {
  const db = await getDB();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS batches (
      batch_id INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_name TEXT NOT NULL UNIQUE,
      start_date TEXT
    );
  `);
}

export async function createStudentTable() {
  const db = await getDB();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS students (
      reg_no INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      batch_id INTEGER NOT NULL,
      join_date TEXT,
      gender TEXT,
      phone TEXT,
      address TEXT,
      dob TEXT,
      blood_group TEXT,
      father_name TEXT,
      father_phone TEXT,
      mother_name TEXT,
      mother_phone TEXT,
      education_qualification TEXT,
      email TEXT,
      documents_link TEXT,
      total_classes INTEGER DEFAULT 0,
      attendance INTEGER DEFAULT 0,
      FOREIGN KEY (batch_id) REFERENCES batches(batch_id)
    );
  `);
}


export async function createFinanceTable() {
  const db = await getDB();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS finance (
      receipt_id TEXT PRIMARY KEY,
      student_id INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      type TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      payment_date TEXT NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students(reg_no) ON DELETE CASCADE
    );
  `);
}





export async function createInstructorTable() {
  const db = await getDB();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS instructors (
      instructor_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT
    );
  `);
}

export async function createCourseTable() {
  const db = await getDB();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS courses (
      course_id TEXT PRIMARY KEY,
      course_name TEXT NOT NULL
    );
  `);
}


export async function createExamTable() {
  const db = await getDB();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS exams (
      exam_id INTEGER PRIMARY KEY AUTOINCREMENT,
      exam_name TEXT NOT NULL,
      course_id TEXT NOT NULL,
      batch_id INTEGER NOT NULL,
      max_score INTEGER NOT NULL,
      cutoff_score INTEGER NOT NULL,
      instructor_id INTEGER NOT NULL,
      exam_date TEXT NOT NULL,
      FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
      FOREIGN KEY (batch_id) REFERENCES batches(batch_id) ON DELETE CASCADE,
      FOREIGN KEY (instructor_id) REFERENCES instructors(instructor_id) ON DELETE CASCADE
    );
  `);
}


export async function createResultTable() {
  const db = await getDB();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS results (
      result_id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      exam_id INTEGER NOT NULL,
      obtained_mark INTEGER NULL,
      status TEXT NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students(reg_no) ON DELETE CASCADE,
      FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE
    );
  `);
}



export async function initializeDatabase() {
  await createBatchTable();
  await createStudentTable();
  await createFinanceTable();
  await createInstructorTable();
  await createCourseTable();
  await createExamTable();
  await createResultTable();
}
