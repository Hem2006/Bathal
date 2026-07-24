const PALETTE = ['#FF3B3B', '#FF6B1A', '#FFE135', '#ADFF2F', '#00FFEF', '#C4A1FF', '#FF6EC7', '#4D7CFF'];

export function colorForUser(username) {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = (hash * 31 + username.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

export function initialsForUser(username) {
  return username.slice(0, 2).toUpperCase();
}
