import { createRequire } from 'module';

const require = createRequire(import.meta.url);

let db = null;
let memoryStore = null;
let dbAvailable = false;

function getDb() {
  return db;
}

try {
  const Database = require('better-sqlite3');
  const path = require('path');

  const dbPath = path.join(process.cwd(), 'data', 'gcp-agent.db');
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  initTables();
  dbAvailable = true;
} catch (e) {
  db = null;
  dbAvailable = false;
}

function initMemoryStore() {
  if (memoryStore) return;
  memoryStore = {
    users: [],
    tasks: [],
    workflows: [],
    envConfig: [],
    nextId: { user: 1, task: 1, workflow: 1, env: 1 }
  };
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

export function isDbAvailable() {
  return dbAvailable;
}

export function insertUser(username, email, passwordHash) {
  if (dbAvailable) {
    const stmt = db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)');
    return stmt.run(username, email, passwordHash);
  }
  initMemoryStore();
  const user = { id: memoryStore.nextId.user++, username, email, password_hash: passwordHash };
  memoryStore.users.push(user);
  return { lastInsertRowid: user.id };
}

export function findUserByEmail(email) {
  if (dbAvailable) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  }
  initMemoryStore();
  return memoryStore.users.find(u => u.email === email) || undefined;
}

export function findUserByUsername(username) {
  if (dbAvailable) {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  }
  initMemoryStore();
  return memoryStore.users.find(u => u.username === username) || undefined;
}

export function insertTask(userId, title, description, category, model) {
  if (dbAvailable) {
    const stmt = db.prepare(
      'INSERT INTO tasks (user_id, title, description, category, model) VALUES (?, ?, ?, ?, ?)'
    );
    return stmt.run(userId, title, description, category, model);
  }
  initMemoryStore();
  const task = { id: memoryStore.nextId.task++, user_id: userId, title, description, category, model, status: 'pending', result: null };
  memoryStore.tasks.push(task);
  return { lastInsertRowid: task.id };
}

export function getTasksByUserId(userId) {
  if (dbAvailable) {
    return db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  }
  initMemoryStore();
  return memoryStore.tasks.filter(t => t.user_id === userId).sort((a, b) => b.id - a.id);
}

export function updateTaskStatus(taskId, status, result = null) {
  if (dbAvailable) {
    const stmt = db.prepare('UPDATE tasks SET status = ?, result = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    return stmt.run(status, result, taskId);
  }
  initMemoryStore();
  const task = memoryStore.tasks.find(t => t.id === taskId);
  if (task) {
    task.status = status;
    task.result = result;
  }
  return { changes: 1 };
}

export function insertWorkflow(taskId, stepName) {
  if (dbAvailable) {
    const stmt = db.prepare('INSERT INTO workflows (task_id, step_name) VALUES (?, ?)');
    return stmt.run(taskId, stepName);
  }
  initMemoryStore();
  const wf = { id: memoryStore.nextId.workflow++, task_id: taskId, step_name: stepName, step_status: 'pending', step_result: null };
  memoryStore.workflows.push(wf);
  return { lastInsertRowid: wf.id };
}

export function updateWorkflowStatus(workflowId, status, result = null) {
  if (dbAvailable) {
    const stmt = db.prepare('UPDATE workflows SET step_status = ?, step_result = ? WHERE id = ?');
    return stmt.run(status, result, workflowId);
  }
  initMemoryStore();
  const wf = memoryStore.workflows.find(w => w.id === workflowId);
  if (wf) {
    wf.step_status = status;
    wf.step_result = result;
  }
  return { changes: 1 };
}

export function getWorkflowsByTaskId(taskId) {
  if (dbAvailable) {
    return db.prepare('SELECT * FROM workflows WHERE task_id = ?').all(taskId);
  }
  initMemoryStore();
  return memoryStore.workflows.filter(w => w.task_id === taskId);
}

export function setEnvConfig(key, value) {
  if (dbAvailable) {
    const stmt = db.prepare(
      'INSERT OR REPLACE INTO env_config (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)'
    );
    return stmt.run(key, value);
  }
  initMemoryStore();
  const existing = memoryStore.envConfig.find(e => e.key === key);
  if (existing) {
    existing.value = value;
  } else {
    memoryStore.envConfig.push({ id: memoryStore.nextId.env++, key, value });
  }
  return { changes: 1 };
}

export function getEnvConfig(key) {
  if (dbAvailable) {
    return db.prepare('SELECT value FROM env_config WHERE key = ?').get(key);
  }
  initMemoryStore();
  const entry = memoryStore.envConfig.find(e => e.key === key);
  return entry ? { value: entry.value } : undefined;
}
