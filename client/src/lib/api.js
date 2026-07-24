import { API_BASE } from './config.js';

const API = `${API_BASE}/api`;

export async function register(username, password) {
  const res = await fetch(`${API}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function login(username, password) {
  const res = await fetch(`${API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function fetchItems() {
  const res = await fetch(`${API}/items`);
  return res.json();
}

export async function uploadImage(file, caption, addedBy) {
  const form = new FormData();
  form.append('image', file);
  if (caption) form.append('caption', caption);
  if (addedBy) form.append('added_by', addedBy);
  const res = await fetch(`${API}/items/upload`, { method: 'POST', body: form });
  return res.json();
}

export async function moveItem(id, tier, position) {
  const res = await fetch(`${API}/items/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tier, position })
  });
  return res.json();
}

export async function reorderItems(items) {
  const res = await fetch(`${API}/items/reorder`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  });
  return res.json();
}

export async function deleteItem(id) {
  const res = await fetch(`${API}/items/${id}`, { method: 'DELETE' });
  return res.json();
}
