import { colorForUser, initialsForUser } from '../lib/userColor.js';

export default function PresenceBar({ users, currentUsername }) {
  if (!users.length) return null;

  return (
    <div className="presence-bar">
      <span className="presence-label">LIVE NOW</span>
      <div className="presence-chips">
        {users.map((username) => (
          <span
            key={username}
            className={`presence-chip ${username === currentUsername ? 'presence-you' : ''}`}
            style={{ background: colorForUser(username) }}
            title={username}
          >
            {initialsForUser(username)}
          </span>
        ))}
      </div>
    </div>
  );
}
