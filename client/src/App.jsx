import { useState, useEffect, useCallback } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import AuthScreen from './components/AuthScreen.jsx';
import FaceScan from './components/FaceScan.jsx';
import TierRow from './components/TierRow.jsx';
import UnrankedTray from './components/UnrankedTray.jsx';
import AddItemBar from './components/AddItemBar.jsx';
import CommandCenter from './components/CommandCenter.jsx';
import { fetchItems, reorderItems } from './lib/api.js';

const TIERS = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];

function Placeholder({ number, rotate }) {
  return (
    <div className="placeholder-spot" style={{ transform: `rotate(${rotate}deg)` }}>
      <span className="tape tape-tl" />
      <span className="tape tape-br" />
      <span className="spot-number">{number}</span>
    </div>
  );
}

function Sticker({ children, style, variant = '' }) {
  return <div className={`decor-sticker ${variant}`} style={style}>{children}</div>;
}

function Tape({ style }) {
  return <div className="loose-tape" style={style} />;
}

export default function App() {
  const [showCommandCenter, setShowCommandCenter] = useState(true);

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('tierlist_user');
      const parsed = saved ? JSON.parse(saved) : null;
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch { return null; }
  });
  const [scanned, setScanned] = useState(false);
  const [items, setItems] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const loadItems = useCallback(async () => {
    const data = await fetchItems();
    setItems(data);
  }, []);

  useEffect(() => {
    if (!user || !scanned) return;
    loadItems();
  }, [user, scanned, loadItems]);

  function handleUpload(item) {
    setItems((prev) => (prev.some((i) => i.id === item.id) ? prev : [...prev, item]));
  }

  if (showCommandCenter) {
    return <CommandCenter onOpenTierList={() => setShowCommandCenter(false)} />;
  }

  function handleAuth(userData) {
    localStorage.setItem('tierlist_user', JSON.stringify(userData));
    setUser(userData);
  }

  function handleLogout() {
    localStorage.removeItem('tierlist_user');
    setUser(null);
    setScanned(false);
  }

  function itemsForTier(tier) {
    return items.filter((i) => i.tier === tier).sort((a, b) => a.position - b.position);
  }

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  function handleDragOver(event) {
    const { active, over } = event;
    if (!over) return;

    const activeItem = items.find((i) => String(i.id) === active.id);
    if (!activeItem) return;

    let overTier;
    if (String(over.id).startsWith('tier-')) {
      overTier = over.id.replace('tier-', '');
    } else {
      const overItem = items.find((i) => String(i.id) === over.id);
      overTier = overItem?.tier;
    }

    if (overTier && activeItem.tier !== overTier) {
      setItems((prev) => {
        const tierItems = prev.filter((i) => i.tier === overTier);
        return prev.map((i) =>
          i.id === activeItem.id ? { ...i, tier: overTier, position: tierItems.length } : i
        );
      });
    }
  }

  async function handleDragEnd(event) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeItem = items.find((i) => String(i.id) === active.id);
    if (!activeItem) return;

    let targetTier;
    if (String(over.id).startsWith('tier-')) {
      targetTier = over.id.replace('tier-', '');
    } else {
      const overItem = items.find((i) => String(i.id) === over.id);
      targetTier = overItem?.tier ?? activeItem.tier;
    }

    const tierItems = items
      .filter((i) => i.tier === targetTier)
      .sort((a, b) => a.position - b.position);

    const oldIndex = tierItems.findIndex((i) => i.id === activeItem.id);
    let newIndex;

    if (String(over.id).startsWith('tier-')) {
      newIndex = tierItems.length - 1;
    } else {
      newIndex = tierItems.findIndex((i) => String(i.id) === over.id);
    }

    if (newIndex < 0) newIndex = tierItems.length - 1;
    if (newIndex < 0) newIndex = 0;

    const reordered = oldIndex >= 0 ? arrayMove(tierItems, oldIndex, newIndex) : tierItems;

    const updates = reordered.map((item, idx) => ({
      id: item.id,
      tier: targetTier,
      position: idx
    }));

    if (!updates.some((u) => u.id === activeItem.id)) {
      updates.push({ id: activeItem.id, tier: targetTier, position: updates.length });
    }

    setItems((prev) => {
      const next = prev.map((i) => {
        const upd = updates.find((u) => u.id === i.id);
        return upd ? { ...i, tier: upd.tier, position: upd.position } : i;
      });
      return next;
    });

    await reorderItems(updates);
  }

  function handleDelete(id) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  if (!user) {
    return <AuthScreen onAuth={handleAuth} />;
  }

  if (!scanned) {
    return <FaceScan username={user.username} onComplete={() => setScanned(true)} />;
  }

  return (
    <div className="app">
      {/* Scattered stickers + junk all over the page */}
      <Sticker style={{ top: 4, left: 16, transform: 'rotate(-7deg)', background: '#ADFF2F' }}>EXPOSED</Sticker>
      <Sticker style={{ top: -6, right: 40, transform: 'rotate(5deg)', background: '#FF6EC7' }}>NO SHAME</Sticker>
      <Sticker style={{ top: 120, left: -10, transform: 'rotate(-90deg)', background: '#00FFEF' }} variant="side-tab">
        VOL. 1
      </Sticker>
      <Sticker style={{ top: 210, right: 6, transform: 'rotate(8deg)', background: '#FFE135' }}>
        L + RATIO
      </Sticker>
      <Sticker style={{ bottom: 90, left: 6, transform: 'rotate(-4deg)', background: '#FF3B3B', color: '#fff' }}>
        TOUCH GRASS
      </Sticker>
      <div className="stamp" style={{ top: 60, right: 90, transform: 'rotate(-14deg)' }}>
        <span>CERTIFIED</span>
        <span className="stamp-big">DIABOLICAL</span>
      </div>
      <svg className="doodle-arrow arrow-1" width="90" height="70" viewBox="0 0 90 70">
        <path d="M5 10 Q 40 5 70 40 T 80 60" stroke="#111" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M65 52 L80 60 L70 68" stroke="#111" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <Tape style={{ top: -10, left: '38%', transform: 'rotate(-3deg)' }} />
      <Tape style={{ top: -8, left: '61%', transform: 'rotate(4deg)' }} />

      <header>
        <div className="header-banner">
          <Tape style={{ top: -16, left: 24, transform: 'rotate(-8deg)' }} />
          <Tape style={{ top: -16, right: 30, transform: 'rotate(6deg)' }} />
          <div className="header-sticker">HALL OF SHAME</div>
          <div className="header-sticker header-sticker-2">EST. NEVER</div>
          <h1>Vinay's Diabolical Reel Tier List</h1>
          <p className="subtitle">Ranking the most unhinged reels this man has liked</p>
          <div className="scribble-underline" />
        </div>
      </header>

      <AddItemBar username={user.username} onUpload={handleUpload} />

      <div className="page-grid">
        {/* Left sidebar with placeholder image spots, stacked messily */}
        <div className="sidebar">
          <Placeholder number={1} rotate={-3} />
          <Placeholder number={2} rotate={2} />
          <Placeholder number={3} rotate={-2} />
          <Sticker style={{ position: 'static', alignSelf: 'flex-start', transform: 'rotate(-5deg)', background: '#4D7CFF', color: '#fff', marginTop: 4 }}>
            evidence →
          </Sticker>
        </div>

        {/* Main tier board */}
        <div className="main-content">
          <Sticker style={{ top: -14, left: '50%', transform: 'translateX(-50%) rotate(2deg)', background: '#111', color: '#ADFF2F', zIndex: 6 }}>
            DO NOT SCROLL PAST
          </Sticker>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="board">
              {TIERS.map((tier) => (
                <TierRow key={tier} tier={tier} items={itemsForTier(tier)} onDelete={handleDelete} />
              ))}
            </div>

            <UnrankedTray items={itemsForTier('UNRANKED')} onDelete={handleDelete} />
          </DndContext>
        </div>
      </div>

      {/* Bottom row of placeholders, messy */}
      <div className="bottom-strip">
        <Placeholder number={4} rotate={2} />
        <Placeholder number={5} rotate={-3} />
        <Placeholder number={6} rotate={1.5} />
      </div>

      <Sticker style={{ bottom: 8, right: 24, transform: 'rotate(-6deg)', background: '#C4A1FF' }}>
        SEEK HELP
      </Sticker>

      <footer>
        <p>
          Logged in as <strong>{user.username}</strong>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </p>
      </footer>
    </div>
  );
}
