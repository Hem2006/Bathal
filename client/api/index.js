import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { extname } from 'path';
import { randomUUID, createHash } from 'crypto';
import { put, del } from '@vercel/blob';
import { sql, ensureSchema } from './db.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(async (_req, _res, next) => {
  await ensureSchema();
  next();
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images are allowed'));
  }
});

function hashPassword(password) {
  const salt = 'vinay-diabolical-salt';
  return createHash('sha256').update(salt + password).digest('hex');
}

// Auth routes

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  if (username.length < 2) return res.status(400).json({ error: 'Username must be at least 2 characters' });
  if (password.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });

  const existing = await sql`SELECT id FROM users WHERE username = ${username}`;
  if (existing.rows.length) return res.status(409).json({ error: 'Username already taken' });

  const { rows } = await sql`
    INSERT INTO users (username, password_hash) VALUES (${username}, ${hashPassword(password)})
    RETURNING id, username
  `;
  res.status(201).json(rows[0]);
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const { rows } = await sql`SELECT id, username, password_hash FROM users WHERE username = ${username}`;
  const user = rows[0];
  if (!user || user.password_hash !== hashPassword(password)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  res.json({ id: user.id, username: user.username });
});

// Items routes

app.get('/api/items', async (_req, res) => {
  const { rows } = await sql`SELECT * FROM items ORDER BY tier, position, id`;
  res.json(rows);
});

app.post('/api/items/upload', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image provided' });

  const blob = await put(`${randomUUID()}${extname(req.file.originalname)}`, req.file.buffer, {
    access: 'public',
    contentType: req.file.mimetype
  });

  const { rows: maxRows } = await sql`
    SELECT COALESCE(MAX(position), -1) as "maxPos" FROM items WHERE tier = 'UNRANKED'
  `;
  const pos = maxRows[0].maxPos + 1;

  const caption = req.body.caption || null;
  const addedBy = req.body.added_by || null;
  const { rows } = await sql`
    INSERT INTO items (image_path, caption, added_by, tier, position)
    VALUES (${blob.url}, ${caption}, ${addedBy}, 'UNRANKED', ${pos})
    RETURNING *
  `;
  res.status(201).json(rows[0]);
});

app.patch('/api/items/reorder', async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) return res.status(400).json({ error: 'items array required' });

  for (const { id, tier, position } of items) {
    await sql`UPDATE items SET tier = ${tier}, position = ${position} WHERE id = ${id}`;
  }

  res.json({ ok: true });
});

app.patch('/api/items/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { rows: existingRows } = await sql`SELECT * FROM items WHERE id = ${id}`;
  const existing = existingRows[0];
  if (!existing) return res.status(404).json({ error: 'Not found' });

  const tier = req.body.tier ?? existing.tier;
  const position = req.body.position ?? existing.position;
  const { rows } = await sql`
    UPDATE items SET tier = ${tier}, position = ${position} WHERE id = ${id}
    RETURNING *
  `;
  res.json(rows[0]);
});

app.delete('/api/items/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { rows: existingRows } = await sql`SELECT * FROM items WHERE id = ${id}`;
  const existing = existingRows[0];
  if (!existing) return res.status(404).json({ error: 'Not found' });

  if (existing.image_path) {
    try {
      await del(existing.image_path);
    } catch {
      // blob already gone, ignore
    }
  }
  await sql`DELETE FROM items WHERE id = ${id}`;
  res.json({ ok: true });
});

export default app;
