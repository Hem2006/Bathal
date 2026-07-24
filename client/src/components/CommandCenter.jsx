import { useState } from 'react';
import '../neumorphism.css';
import {
  ChevronDown, ChevronRight, ChevronUp, XIcon, ThumbsUp, ArrowRight,
  BanIcon, InfoIcon, MoreIcon,
  SunIcon, DropletIcon, CloudIcon
} from './icons.jsx';

function pctFromClick(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  return Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
}

function angleFromCenter(e, rect) {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = e.clientX - cx;
  const dy = e.clientY - cy;
  let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
  if (deg < 0) deg += 360;
  return deg;
}

function Labeled({ label, children, width }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width }}>
      {children}
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--nm-text-dark)', textAlign: 'center', maxWidth: 200 }}>
        {label}
      </span>
    </div>
  );
}

function TickRing({ count, radius, length = 8, width = 2, longEvery = 0, longLength, blueIndexes = [] }) {
  return (
    <div className="tick-ring">
      {Array.from({ length: count }).map((_, i) => {
        const angle = (360 / count) * i;
        const isLong = longEvery && i % longEvery === 0;
        const len = isLong ? (longLength || length * 1.6) : length;
        const isBlue = blueIndexes.includes(i);
        return (
          <span
            key={i}
            className={`tick ${isBlue ? 'tick-blue' : ''}`}
            style={{
              height: `${len}px`,
              width: `${width}px`,
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px)`
            }}
          />
        );
      })}
    </div>
  );
}

const RARITY_TIERS = [
  { name: 'Common', weight: 50, color: '#9aa0ad' },
  { name: 'Rare', weight: 30, color: '#2ec4b6' },
  { name: 'Epic', weight: 14, color: '#4f8fe0' },
  { name: 'Legendary', weight: 5, color: '#9b5de5' },
  { name: 'Mythical', weight: 1, color: '#f4a300' }
];

const VINAY_POOL = {
  Mythical: [
    'Bathala Vinay, Destroyer of Group Chats',
    'Vinay the Eternal, First of His Cringe'
  ],
  Legendary: [
    'Vinay Bhai, SRMJEEE Rank Holder',
    "Krishnamadhavan's Nemesis",
    'The Diabolical One',
    'Vinay of the Thousand Reels',
    "Lokesh's Sworn Rival"
  ],
  Epic: [
    '3 AM Scroll Vinay',
    'Mirror Selfie Vinay',
    'Gym Bro (Never Been) Vinay',
    "Cousin's Wedding Fit Vinay",
    'All-Rounder (Never Bowled) Vinay',
    'Ghost Mode Vinay',
    'Simp Era Vinay',
    'Jaipur Rowdie Vinay',
    "Suhaas's Target Vinay",
    'Certified L Vinay'
  ],
  Rare: [
    'Studying (Not Really) Vinay',
    'Quick Ride, 4 Hours Vinay',
    'Cricket Commentary Vinay',
    'No GF (Allegedly) Vinay',
    'Denial Arc Vinay',
    'Group Project Ghost Vinay',
    'Late to Dinner Vinay',
    'Screenshot Evidence Vinay',
    'Cringe Compilation Vinay',
    'Bathala Apprentice Vinay'
  ],
  Common: [
    'Regular Tuesday Vinay',
    'Just Vibing Vinay',
    'Half Asleep Vinay',
    'Mid Reel Vinay',
    'Background Noise Vinay',
    'Generic Vinay',
    'Vinay.exe',
    'Loading... Vinay',
    'NPC Vinay',
    'Placeholder Vinay'
  ]
};

function rollVinay() {
  const roll = Math.random() * 100;
  let cumulative = 0;
  let tier = RARITY_TIERS[0];
  for (const t of RARITY_TIERS) {
    cumulative += t.weight;
    if (roll <= cumulative) { tier = t; break; }
  }
  const pool = VINAY_POOL[tier.name];
  const name = pool[Math.floor(Math.random() * pool.length)];
  return { tier, name };
}

const SPIN_BUMP_ANGLES = Array.from({ length: 10 }, (_, i) => (360 / 10) * i);

function SpinWheel() {
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);

  function spin() {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    const pulled = rollVinay();
    const extraTurns = 5 + Math.floor(Math.random() * 3);
    const randomOffset = Math.random() * 360;
    setAngle((a) => a + extraTurns * 360 + randomOffset);
    setTimeout(() => {
      setSpinning(false);
      setResult(pulled);
    }, 2600);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div
        className="big-dial nm-raised-lg"
        onClick={spin}
        style={{ cursor: spinning ? 'wait' : 'pointer' }}
        title="Click to spin for a Vinay"
      >
        <span className="dial-pointer" />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `rotate(${angle}deg)`,
            transition: spinning ? 'transform 2.6s cubic-bezier(0.15, 0.75, 0.2, 1)' : 'none'
          }}
        >
          {SPIN_BUMP_ANGLES.map((a, i) => (
            <span
              key={i}
              className="bump nm-raised-sm"
              style={{ transform: `translate(-50%, -50%) rotate(${a}deg) translateY(-108px)` }}
            />
          ))}
          <div className="dial-ring-1 nm-inset-sm" />
          <div className="dial-ring-2 nm-raised-sm" />
          <div className="dial-ring-3 nm-inset-sm" />
          <div
            className="dial-center nm-raised-md"
            style={{ background: result ? result.tier.color : undefined, transition: 'background 0.3s ease' }}
          />
        </div>
      </div>
      <div style={{ textAlign: 'center', maxWidth: 200 }}>
        {spinning ? (
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--nm-text-dark)' }}>Spinning...</span>
        ) : result ? (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: result.tier.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {result.tier.name}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--nm-text-dark)' }}>{result.name}</div>
          </>
        ) : (
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--nm-text-dark)' }}>Vinay Spin Wheel — click to pull</span>
        )}
      </div>
    </div>
  );
}

function Knob() {
  const [angle, setAngle] = useState(18);
  const norm = ((angle % 360) + 360) % 360;
  const level = Math.round(norm / 18) % 20;
  const blueIndexes = Array.from({ length: level + 1 }, (_, i) => i);

  function handlePointerDown(e) {
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function handlePointerMove(e) {
    if (e.buttons !== 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setAngle(angleFromCenter(e, rect));
  }

  return (
    <Labeled label={`Yap Volume: ${level + 1}/20`}>
      <div
        className="knob nm-raised-lg"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        style={{ cursor: 'grab', touchAction: 'none' }}
        title="Drag to crank the volume"
      >
        <span className="knob-pointer" />
        <TickRing count={20} radius={98} length={8} longEvery={5} longLength={14} blueIndexes={blueIndexes} />
        <div className="knob-ring" style={{ transform: `rotate(${angle}deg)`, transition: 'transform 0.05s linear' }}>
          <div className="knob-core nm-raised-md" />
        </div>
      </div>
    </Labeled>
  );
}

function DotGridSelector() {
  const [active, setActive] = useState([4, 6, 7, 8]);
  function toggle(i) {
    setActive((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  }
  return (
    <Labeled label={`Witnesses confirmed: ${active.length}/9`}>
      <div>
        <div className="dot-grid">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              onClick={() => toggle(i)}
              className={`dot ${active.includes(i) ? 'active' : 'nm-raised-sm'}`}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </div>
        <div className="dot-ticks">
          <span /><span /><span />
        </div>
      </div>
    </Labeled>
  );
}

const FORECASTS = ['Simp Era ☀️', 'Crying Arc 🌧️', 'Ghost Mode ☁️'];

function WeatherWheel() {
  const [angle, setAngle] = useState(0);
  const norm = ((angle % 360) + 360) % 360;
  const index = Math.round(norm / 120) % 3;

  function handlePointerDown(e) {
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function handlePointerMove(e) {
    if (e.buttons !== 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setAngle(angleFromCenter(e, rect));
  }

  return (
    <Labeled label={`Vinay Forecast: ${FORECASTS[index]}`}>
      <div
        className="wheel nm-raised-lg"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        style={{ cursor: 'grab', touchAction: 'none', transform: `rotate(${angle}deg)`, transition: 'transform 0.05s linear' }}
        title="Drag to spin the forecast"
      >
        <div className="wedge rain nm-inset-sm">
          <DropletIcon className="wedge-icon" style={{ position: 'absolute', top: '22%', left: '58%' }} />
        </div>
        <div className="wedge sun">
          <SunIcon className="wedge-icon" style={{ position: 'absolute', top: '22%', left: '68%', color: '#fff' }} />
        </div>
        <div className="wedge cloud nm-inset-sm">
          <CloudIcon className="wedge-icon" style={{ position: 'absolute', bottom: '14%', left: '38%' }} />
        </div>
        <div className="wheel-divider" style={{ transform: 'rotate(0deg)' }} />
        <div className="wheel-divider" style={{ transform: 'rotate(60deg)' }} />
        <div className="wheel-divider" style={{ transform: 'rotate(120deg)' }} />
        <div className="wheel-divider" style={{ transform: 'rotate(180deg)' }} />
        <div className="wheel-divider" style={{ transform: 'rotate(240deg)' }} />
        <div className="wheel-divider" style={{ transform: 'rotate(300deg)' }} />
      </div>
    </Labeled>
  );
}

const QUESTIONS = [
  'Dinner konchum late aithe Vinay ochi krishnamadhavan ni thinesthada?',
  '1 over - 1 run to win, anna finish chesthada?',
  'Vinay Ki gf undha?',
  'Suhaas gaadu Vinay ni esada?',
  'Vinay lo endhaina lopam vundha?',
  'Vinay lokesh tho, sarasarlu addeda?'
];

function SelectionToggle() {
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const answer = answers[qIndex] ?? null;

  function next() {
    setQIndex((i) => (i + 1) % QUESTIONS.length);
  }

  return (
    <div className="selection-panel nm-raised-md">
      <div className="panel-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span>{QUESTIONS[qIndex]}</span>
        {QUESTIONS.length > 1 && (
          <button
            className="icon-btn nm-raised-sm"
            style={{ width: 32, height: 32, flexShrink: 0 }}
            onClick={next}
            title="Next question"
          >
            <ChevronRight />
          </button>
        )}
      </div>
      <div className="seg-toggle nm-inset-sm">
        <div className="seg-track" />
        <span className="seg-label on" style={{ cursor: 'pointer' }} onClick={() => setAnswers((a) => ({ ...a, [qIndex]: 'yes' }))}>Yes</span>
        <span className="seg-label off" style={{ cursor: 'pointer' }} onClick={() => setAnswers((a) => ({ ...a, [qIndex]: 'no' }))}>No</span>
        <div
          className="seg-thumb nm-raised-sm"
          style={{ left: answer === 'yes' ? '6px' : '50%', transition: 'left 0.25s ease' }}
        />
      </div>
    </div>
  );
}

function ButtonPair({ onAdd }) {
  const [choice, setChoice] = useState(null);
  return (
    <div className="button-pair nm-raised-md">
      <span
        className="btn-ghost"
        style={{ cursor: 'pointer', color: choice === 'add' ? 'var(--nm-blue-dark)' : undefined }}
        onClick={() => { setChoice('add'); onAdd(); }}
      >
        {choice === 'add' ? 'Added ✅' : 'Add to Board'}
      </span>
      <button className="btn-solid" onClick={() => setChoice('spare')}>
        {choice === 'spare' ? 'Spared 🙏' : 'Spare Him'}
      </button>
    </div>
  );
}

function TickedSlider() {
  const [pct, setPct] = useState(32);
  return (
    <Labeled label={`Diabolical-o-Meter: ${Math.round(pct / 10)}/10`} width={340}>
      <div className="ticked-slider nm-inset-sm" onClick={(e) => setPct(pctFromClick(e))} style={{ cursor: 'pointer' }}>
        <div className="slider-fill" style={{ width: `${pct}%` }}>
          {Array.from({ length: 10 }).map((_, i) => <span key={i} />)}
        </div>
        <div className="slider-ticks" style={{ marginLeft: `${pct + 2}%` }}>
          {Array.from({ length: 18 }).map((_, i) => <span key={i} />)}
        </div>
        <div className="slider-thumb nm-raised-md" style={{ left: `${pct}%` }} />
      </div>
    </Labeled>
  );
}

function ClockDial({ reelsAdded }) {
  const hours = (reelsAdded * 2) % 24;
  return (
    <Labeled label={`Doomsday Clock — ${reelsAdded} reel${reelsAdded === 1 ? '' : 's'} logged`}>
      <div className="clock-dial nm-raised-lg" title="Ticks forward every time a reel is added to the board">
        <span className="clock-pointer" />
        <div className="clock-hand" style={{ transform: `translate(-50%, 0) rotate(${(hours / 24) * 360 + 35}deg)`, transition: 'transform 0.4s ease' }} />
        <div className="clock-hub nm-raised-sm" />
      </div>
    </Labeled>
  );
}

const PHOTOS_OF_THE_DAY = [
  { emoji: '🕶️', caption: 'Exhibit A: mirror selfie, hallway lighting, 3 AM' },
  { emoji: '🍜', caption: "Exhibit B: 'studying' at the mess, plot twist — he wasn't" },
  { emoji: '🏏', caption: 'Exhibit C: claims all-rounder, has never bowled' },
  { emoji: '📉', caption: 'Exhibit D: the SRMJEEE rank screenshot, framed and everything' },
  { emoji: '🛵', caption: "Exhibit E: 'quick ride' that took four hours" },
  { emoji: '📵', caption: "Exhibit F: 'I don't even have Instagram'" }
];

function PhotoOfTheDay() {
  const [visible, setVisible] = useState(true);
  const [index, setIndex] = useState(0);
  const [day, setDay] = useState(412);
  const photo = PHOTOS_OF_THE_DAY[index];

  if (!visible) {
    return (
      <div className="popup-card nm-inset-sm" style={{ minWidth: 340, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => setVisible(true)}>
        <span style={{ fontSize: 13, color: 'var(--nm-text)' }}>We don't talk about this one. (click to reopen)</span>
      </div>
    );
  }

  function nextPhoto() {
    setIndex((i) => (i + 1) % PHOTOS_OF_THE_DAY.length);
    setDay((d) => d + 1);
  }

  return (
    <div className="popup-card nm-raised-md">
      <button className="popup-close nm-raised-sm" onClick={() => setVisible(false)}><XIcon /></button>
      <h3>Vinay Photo of the Day</h3>
      <div
        className="nm-inset-sm"
        style={{ borderRadius: 16, padding: '24px 0', marginBottom: 12, textAlign: 'center', fontSize: 52 }}
      >
        {photo.emoji}
      </div>
      <p style={{ fontStyle: 'normal' }}>{photo.caption}</p>
      <button className="popup-cta" onClick={nextPhoto}>Day {day} →</button>
      <div style={{ clear: 'both' }} />
    </div>
  );
}

function Dropdown({ options, chevron = 'down', filled = false }) {
  const [idx, setIdx] = useState(0);
  return (
    <div
      className={`nm-field ${filled ? 'filled' : 'nm-raised-sm'}`}
      onClick={() => setIdx((i) => (i + 1) % options.length)}
    >
      <span>{options[idx]}</span>
      {chevron === 'down' ? <ChevronDown /> : <ChevronRight />}
    </div>
  );
}

function TextInput() {
  const [value, setValue] = useState('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div className="nm-field nm-inset-sm">
        <input type="text" placeholder="Write a roast..." value={value} onChange={(e) => setValue(e.target.value)} />
      </div>
      {value && <span style={{ fontSize: 11, color: 'var(--nm-text)', paddingLeft: 6 }}>caption preview: "{value}"</span>}
    </div>
  );
}

function ExpandedList({ options, selected }) {
  const [sel, setSel] = useState(selected);
  return (
    <div className="expand-list nm-raised-md">
      {options.map((opt) => (
        <div
          key={opt}
          onClick={() => setSel(opt)}
          className={`list-item ${opt === sel ? 'selected nm-raised-sm' : ''}`}
          style={{ cursor: 'pointer' }}
        >
          {opt}
        </div>
      ))}
    </div>
  );
}

function EmojiReactions() {
  const [counts, setCounts] = useState({ '💀': 0, '😂': 0, '🤮': 0, '🔥': 0 });
  function bump(emoji) {
    setCounts((prev) => ({ ...prev, [emoji]: prev[emoji] + 1 }));
  }
  return (
    <div className="icon-row">
      {Object.keys(counts).map((emoji) => (
        <button key={emoji} className="icon-btn nm-raised-sm" style={{ fontSize: 22, position: 'relative' }} onClick={() => bump(emoji)}>
          {emoji}
          {counts[emoji] > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4, background: 'var(--nm-blue)', color: '#fff',
              borderRadius: '50%', fontSize: 10, width: 18, height: 18, display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontWeight: 700
            }}>
              {counts[emoji]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

const TIERS = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];

function TierNudge() {
  const [tierIndex, setTierIndex] = useState(3);
  return (
    <Labeled label={`Current tier: ${TIERS[tierIndex]}`}>
      <div className="icon-row">
        <button className="icon-btn nm-raised-sm" title="Move up a tier" onClick={() => setTierIndex((i) => Math.max(0, i - 1))}>
          <ChevronUp />
        </button>
        <button className="icon-btn nm-raised-sm" title="Move down a tier" onClick={() => setTierIndex((i) => Math.min(TIERS.length - 1, i + 1))}>
          <ChevronDown />
        </button>
      </div>
    </Labeled>
  );
}

function VoteRow() {
  const [vindicated, setVindicated] = useState(false);
  const [shares, setShares] = useState(0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="icon-row">
        <button
          className={`icon-btn ${vindicated ? 'nm-inset-sm' : 'nm-raised-sm'}`}
          style={{ color: vindicated ? 'var(--nm-blue)' : undefined }}
          onClick={() => setVindicated((v) => !v)}
          title="Vindicate Vinay"
        >
          <ThumbsUp />
        </button>
        <button className="icon-btn nm-raised-sm" onClick={() => setShares((s) => s + 1)} title="Share to the group chat">
          <ArrowRight />
        </button>
      </div>
      <span style={{ fontSize: 11, color: 'var(--nm-text-dark)', fontWeight: 600 }}>
        {vindicated ? 'Vindicated — maybe not that bad' : 'Not vindicated'}{shares > 0 ? ` · shared ${shares}x` : ''}
      </span>
    </div>
  );
}

function ToggleSwitch({ initial = false, label }) {
  const [on, setOn] = useState(initial);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div className={`toggle-switch ${on ? 'on nm-inset-sm' : 'off nm-inset-sm'}`} onClick={() => setOn((v) => !v)}>
        <span className="toggle-thumb" />
      </div>
      {label && <span style={{ fontSize: 10, color: 'var(--nm-text)', textAlign: 'center', maxWidth: 90 }}>{label}: {on ? 'on' : 'off'}</span>}
    </div>
  );
}

const STAGES = ['Aware', 'Concerned', 'Intervening'];

function VerticalStepper() {
  const [stage, setStage] = useState(0);
  return (
    <Labeled label={`Intervention: ${STAGES[stage]}`}>
      <div className="v-stepper nm-inset-sm" onClick={() => setStage((s) => (s + 1) % 3)} style={{ cursor: 'pointer' }}>
        {[0, 1, 2].map((i) => (
          <span key={i} className="v-dot" style={{ background: i <= stage ? 'var(--nm-blue)' : '#c3c7d1' }} />
        ))}
        <div className="v-handle nm-raised-sm" style={{ bottom: `${16 + stage * 40}px`, transition: 'bottom 0.25s ease' }} />
      </div>
    </Labeled>
  );
}

function MiniSlider() {
  const [pct, setPct] = useState(58);
  return (
    <Labeled label={`Plausible deniability: ${Math.round(pct)}%`} width={200}>
      <div className="mini-slider nm-inset-sm" onClick={(e) => setPct(pctFromClick(e))} style={{ cursor: 'pointer' }}>
        <div className="mini-fill" style={{ width: `${pct}%` }} />
        <div className="mini-thumb nm-raised-sm" style={{ left: `${pct}%` }} />
      </div>
    </Labeled>
  );
}

function LineSlider({ initial = 30, bars = false, label }) {
  const [pct, setPct] = useState(initial);
  return (
    <Labeled label={label ? `${label}: ${Math.round(pct)}%` : ''} width={180}>
      <div className="line-slider" onClick={(e) => setPct(pctFromClick(e))} style={{ cursor: 'pointer' }}>
        <div className="line-track" />
        <div
          className={`line-thumb ${bars ? 'bars nm-raised-sm' : 'nm-raised-sm'}`}
          style={{ left: `${pct}%`, transform: 'translate(-50%, -50%)', top: '50%' }}
        >
          {bars && <><span /><span /><span /></>}
        </div>
      </div>
    </Labeled>
  );
}

function ProgressSlider() {
  const [pct, setPct] = useState(84);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 260 }}>
      <div className="progress-slider nm-inset-sm" onClick={(e) => setPct(pctFromClick(e))} style={{ cursor: 'pointer' }}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
        <div className="progress-thumb nm-raised-md" style={{ left: `${pct}%` }} />
      </div>
      <span style={{ fontSize: 11, color: 'var(--nm-text-dark)', fontWeight: 600 }}>
        {pct >= 100 ? '🎉 Vinay has been fully exposed' : `Roast Progress: ${Math.round(pct)}%`}
      </span>
    </div>
  );
}

function AdminBanRow() {
  const [banned, setBanned] = useState(false);
  const [hidden, setHidden] = useState(false);
  return (
    <div className="icon-row">
      <button
        className={`icon-btn ${banned ? 'nm-inset-sm' : 'nm-raised-sm'}`}
        style={{ color: banned ? '#e05555' : undefined }}
        onClick={() => setBanned((v) => !v)}
        title="Ban this reel"
      >
        <BanIcon />
      </button>
      <button
        className={`icon-btn ${hidden ? 'nm-inset-sm' : 'nm-raised-sm'}`}
        onClick={() => setHidden((v) => !v)}
        title="Hide this reel"
      >
        <XIcon />
      </button>
      {(banned || hidden) && (
        <span style={{ fontSize: 11, color: 'var(--nm-text-dark)', fontWeight: 600 }}>
          {banned ? 'Banned' : ''}{banned && hidden ? ' · ' : ''}{hidden ? 'Hidden' : ''}
        </span>
      )}
    </div>
  );
}

const MENU_ITEMS = ['Generate Personality Report', 'Export Shame Certificate (PDF)', 'Summon Vinay'];

function InfoMoreRow() {
  const [showInfo, setShowInfo] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <div className="icon-row">
        <button className="icon-btn nm-raised-sm" onClick={() => { setShowInfo((v) => !v); setShowMenu(false); }} title="Stats">
          <InfoIcon />
        </button>
        <button className="icon-btn nm-raised-sm" onClick={() => { setShowMenu((v) => !v); setShowInfo(false); }} title="More">
          <MoreIcon />
        </button>
      </div>
      {showInfo && (
        <div className="popup-card nm-raised-md" style={{ position: 'absolute', top: 60, left: 0, zIndex: 10, minWidth: 220 }}>
          <p style={{ fontStyle: 'normal', fontSize: 12, margin: 0 }}>
            Reels added: 27<br />
            Average tier: B-<br />
            Worst reel: "cousin's wedding fit check"<br />
            Days active: 412<br />
            Jaipur Rowdie Index: 8.4
          </p>
        </div>
      )}
      {showMenu && (
        <div className="expand-list nm-raised-md" style={{ position: 'absolute', top: 60, left: 0, zIndex: 10, minWidth: 220 }}>
          {MENU_ITEMS.map((item) => (
            <div key={item} className="list-item" style={{ cursor: 'pointer' }} onClick={() => setShowMenu(false)}>
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommandCenter({ onOpenTierList }) {
  const [reelsAdded, setReelsAdded] = useState(1);

  return (
    <div className="command-center">
      <div className="cc-title">
        <h1>BATHALA COMMAND CENTER</h1>
        <p>every dial does something now &mdash; go click stuff</p>
        {onOpenTierList && (
          <button
            className="nm-field filled"
            style={{ margin: '18px auto 0', border: 'none', cursor: 'pointer' }}
            onClick={onOpenTierList}
          >
            <span>Open the Tier List</span>
            <ArrowRight />
          </button>
        )}
      </div>

      <div className="cc-grid">
        {/* Row 1 */}
        <div className="cc-row">
          <SpinWheel />
          <Knob />
          <DotGridSelector />
          <WeatherWheel />
          <SelectionToggle />
        </div>

        {/* Row 2 */}
        <div className="cc-row">
          <ButtonPair onAdd={() => setReelsAdded((n) => n + 1)} />
          <TickedSlider />
          <ClockDial reelsAdded={reelsAdded} />
          <PhotoOfTheDay />
        </div>

        {/* Row 3 */}
        <div className="cc-row">
          <Dropdown options={['Pick his excuse', 'I was hacked', "My cousin's account", 'Research purposes', "I don't even have Instagram"]} chevron="down" />
          <TextInput />
          <Dropdown options={['Snitch to which group', 'Family Group', 'Cricket Boys', 'College Batch', 'Society Aunties']} chevron="right" />
          <ExpandedList options={['Mild Ick', 'Unhinged', 'Diabolical', 'No Return']} selected="Diabolical" />
        </div>

        {/* Row 4 */}
        <div className="cc-row">
          <Dropdown options={['Select intervention', 'Gentle Roast', 'Public Shaming', 'Emergency Tier Reset', 'Nuclear Option']} chevron="down" filled />
          <EmojiReactions />
          <TierNudge />
        </div>

        {/* Row 5 */}
        <div className="cc-row">
          <ExpandedList options={['Aware', 'Concerned', 'Full Bathala']} selected="Aware" />
          <MiniSlider />
          <div className="icon-row">
            <ToggleSwitch initial label="Anonymous vote" />
            <ToggleSwitch label="NSFW warning" />
          </div>
          <VerticalStepper />
          <VoteRow />
        </div>

        {/* Row 6 */}
        <div className="cc-row" style={{ alignItems: 'center' }}>
          <ToggleSwitch label="Vinay in the room" />
          <AdminBanRow />
          <LineSlider initial={20} label="Shame alarm volume" />
          <ProgressSlider />
          <InfoMoreRow />
          <LineSlider initial={55} bars label="Reputation drag" />
        </div>
      </div>
    </div>
  );
}
