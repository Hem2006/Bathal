import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import { unlinkSync, existsSync } from 'fs';
import { randomUUID, createHash } from 'crypto';
import db, { save } from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: join(__dirname, 'uploads'),
  filename: (_req, file, cb) => {
    cb(null, randomUUID() + extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images are allowed'));
  }
});

function hashPassword(password) {
  const salt = 'vinay-diabolical-salt';
  return createHash('sha256').update(salt + password).digest('hex');
}

function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function queryOne(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  let row = null;
  if (stmt.step()) row = stmt.getAsObject();
  stmt.free();
  return row;
}

function run(sql, params = []) {
  db.run(sql, params);
  save();
}

function getLastId() {
  const row = queryOne('SELECT last_insert_rowid() as id');
  return row.id;
}

// Auth routes

app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  if (username.length < 2) return res.status(400).json({ error: 'Username must be at least 2 characters' });
  if (password.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });

  const existing = queryOne('SELECT id FROM users WHERE username = ?', [username]);
  if (existing) return res.status(409).json({ error: 'Username already taken' });

  run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hashPassword(password)]);
  const user = queryOne('SELECT id, username FROM users WHERE id = ?', [getLastId()]);
  res.status(201).json(user);
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const user = queryOne('SELECT id, username, password_hash FROM users WHERE username = ?', [username]);
  if (!user || user.password_hash !== hashPassword(password)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  res.json({ id: user.id, username: user.username });
});

// Items routes

app.get('/api/items', (_req, res) => {
  const items = queryAll('SELECT * FROM items ORDER BY tier, position, id');
  res.json(items);
});

app.post('/api/items/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image provided' });
  const maxRow = queryOne("SELECT COALESCE(MAX(position), -1) as maxPos FROM items WHERE tier = 'UNRANKED'");
  const pos = maxRow.maxPos + 1;

  run(
    `INSERT INTO items (image_path, caption, added_by, tier, position)
     VALUES (?, ?, ?, ?, ?)`,
    [`/uploads/${req.file.filename}`, req.body.caption || null, req.body.added_by || null, 'UNRANKED', pos]
  );

  const item = queryOne('SELECT * FROM items WHERE id = ?', [getLastId()]);
  io.emit('item:created', item);
  res.status(201).json(item);
});

app.patch('/api/items/reorder', (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) return res.status(400).json({ error: 'items array required' });

  for (const { id, tier, position } of items) {
    db.run('UPDATE items SET tier = ?, position = ? WHERE id = ?', [tier, position, id]);
  }
  save();

  io.emit('board:reorder', items);
  res.json({ ok: true });
});

app.patch('/api/items/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = queryOne('SELECT * FROM items WHERE id = ?', [id]);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  const tier = req.body.tier ?? existing.tier;
  const position = req.body.position ?? existing.position;
  run('UPDATE items SET tier = ?, position = ? WHERE id = ?', [tier, position, id]);

  const updated = queryOne('SELECT * FROM items WHERE id = ?', [id]);
  io.emit('item:updated', updated);
  res.json(updated);
});

app.delete('/api/items/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = queryOne('SELECT * FROM items WHERE id = ?', [id]);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  if (existing.image_path) {
    const filePath = join(__dirname, existing.image_path);
    if (existsSync(filePath)) unlinkSync(filePath);
  }
  run('DELETE FROM items WHERE id = ?', [id]);
  io.emit('item:deleted', { id });
  res.json({ ok: true });
});

// Presence: socket.id -> username
const onlineUsers = new Map();
// Track what each socket is currently dragging, so we can clean up on disconnect
const activeDrags = new Map();

function broadcastPresence() {
  const usernames = [...new Set(onlineUsers.values())];
  io.emit('presence:update', usernames);
}

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('presence:join', (username) => {
    onlineUsers.set(socket.id, username);
    broadcastPresence();
  });

  socket.on('drag:start', ({ itemId }) => {
    const username = onlineUsers.get(socket.id);
    if (!username) return;
    activeDrags.set(socket.id, itemId);
    socket.broadcast.emit('drag:start', { itemId, username });
  });

  socket.on('drag:end', ({ itemId }) => {
    activeDrags.delete(socket.id);
    socket.broadcast.emit('drag:end', { itemId });
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    if (activeDrags.has(socket.id)) {
      socket.broadcast.emit('drag:end', { itemId: activeDrags.get(socket.id) });
      activeDrags.delete(socket.id);
    }
    onlineUsers.delete(socket.id);
    broadcastPresence();
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
