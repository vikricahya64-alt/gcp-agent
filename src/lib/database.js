import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'gcp-agent.db');
let db;

export function getDb() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    initTables();
  }
  return db;
}

function initTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      model TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      result TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS workflows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      step_name TEXT NOT NULL,
      step_status TEXT DEFAULT 'pending',
      step_result TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id)
    );

    CREATE TABLE IF NOT EXISTS env_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export function insertUser(username, email, passwordHash) {
  const stmt = getDb().prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)');
  return stmt.run(username, email, passwordHash);
}

export function findUserByEmail(email) {
  return getDb().prepare('SELECT * FROM users WHERE email = ?').get(email);
}

export function findUserByUsername(username) {
  return getDb().prepare('SELECT * FROM users WHERE username = ?').get(username);
}

export function insertTask(userId, title, description, category, model) {
  const stmt = getDb().prepare(
    'INSERT INTO tasks (user_id, title, description, category, model) VALUES (?, ?, ?, ?, ?)'
  );
  return stmt.run(userId, title, description, category, model);
}

export function getTasksByUserId(userId) {
  return getDb().prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC').all(userId);
}

export function updateTaskStatus(taskId, status, result = null) {
  const stmt = getDb().prepare('UPDATE tasks SET status = ?, result = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  return stmt.run(status, result, taskId);
}

export function insertWorkflow(taskId, stepName) {
  const stmt = getDb().prepare('INSERT INTO workflows (task_id, step_name) VALUES (?, ?)');
  return stmt.run(taskId, stepName);
}

export function updateWorkflowStatus(workflowId, status, result = null) {
  const stmt = getDb().prepare('UPDATE workflows SET step_status = ?, step_result = ? WHERE id = ?');
  return stmt.run(status, result, workflowId);
}

export function getWorkflowsByTaskId(taskId) {
  return getDb().prepare('SELECT * FROM workflows WHERE task_id = ?').all(taskId);
}

export function setEnvConfig(key, value) {
  const stmt = getDb().prepare(
    'INSERT OR REPLACE INTO env_config (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)'
  );
  return stmt.run(key, value);
}

export function getEnvConfig(key) {
  return getDb().prepare('SELECT value FROM env_config WHERE key = ?').get(key);
}
