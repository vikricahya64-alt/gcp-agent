import crypto from 'crypto';
import { insertUser, findUserByEmail, findUserByUsername } from './database.js';

const SECRET = process.env.JWT_SECRET || 'gcp-agent-secret-key-change-in-production';

export function hashPassword(password) {
  return crypto.createHash('sha256').update(password + SECRET).digest('hex');
}

export function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

export function generateToken(userId) {
  const payload = { userId, exp: Date.now() + 24 * 60 * 60 * 1000 };
  const signature = crypto.createHash('sha256').update(JSON.stringify(payload) + SECRET).digest('hex');
  return Buffer.from(JSON.stringify({ ...payload, signature })).toString('base64');
}

export function verifyToken(token) {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    if (decoded.exp < Date.now()) return null;
    const signature = crypto.createHash('sha256').update(JSON.stringify({ userId: decoded.userId, exp: decoded.exp }) + SECRET).digest('hex');
    if (decoded.signature !== signature) return null;
    return { userId: decoded.userId };
  } catch {
    return null;
  }
}

export function register(username, email, password) {
  if (findUserByEmail(email)) return { success: false, error: 'Email sudah terdaftar' };
  if (findUserByUsername(username)) return { success: false, error: 'Username sudah digunakan' };

  const hash = hashPassword(password);
  const result = insertUser(username, email, hash);
  return { success: true, userId: result.lastInsertRowid };
}

export function login(email, password) {
  const user = findUserByEmail(email);
  if (!user) return { success: false, error: 'Email tidak ditemukan' };
  if (!verifyPassword(password, user.password_hash)) return { success: false, error: 'Password salah' };
  return { success: true, user, token: generateToken(user.id) };
}
