import { useEffect, useRef, useState } from 'react';

const SCAN_MESSAGES = [
  'Initializing camera...',
  'Detecting face...',
  'Checking for Jaipur Rowdies...',
  'Sensing Bathalas...',
  'Checking SRMJEEE rank...',
  'Checking Lokesh underwear...',
  'Verifying you\'re not Vinay...',
  'ACCESS GRANTED'
];

export default function FaceScan({ username, onComplete }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [messageIdx, setMessageIdx] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraReady(true);
      } catch {
        if (!cancelled) setCameraError(true);
      }
    }

    startCamera();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  useEffect(() => {
    if (!cameraReady && !cameraError) return;

    const totalDuration = 4500;
    const stepTime = totalDuration / SCAN_MESSAGES.length;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      if (step < SCAN_MESSAGES.length) {
        setMessageIdx(step);
        setScanProgress(Math.round((step / (SCAN_MESSAGES.length - 1)) * 100));
      } else {
        clearInterval(interval);
        setScanProgress(100);
        setTimeout(() => {
          streamRef.current?.getTracks().forEach(t => t.stop());
          onComplete();
        }, 800);
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [cameraReady, cameraError, onComplete]);

  useEffect(() => {
    if (!cameraReady || !canvasRef.current || !videoRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    function drawScanline() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const time = Date.now() / 1000;
      const y = ((Math.sin(time * 2) + 1) / 2) * canvas.height;

      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
      ctx.shadowBlur = 0;

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const rx = canvas.width * 0.28;
      const ry = canvas.height * 0.38;

      ctx.strokeStyle = `rgba(0, 255, 136, ${0.4 + Math.sin(time * 3) * 0.3})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();

      const corners = [
        [cx - rx, cy - ry],
        [cx + rx, cy - ry],
        [cx - rx, cy + ry],
        [cx + rx, cy + ry]
      ];
      const size = 20;
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 3;
      for (const [x, yc] of corners) {
        const dx = x < cx ? 1 : -1;
        const dy = yc < cy ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(x + dx * size, yc);
        ctx.lineTo(x, yc);
        ctx.lineTo(x, yc + dy * size);
        ctx.stroke();
      }

      animId = requestAnimationFrame(drawScanline);
    }

    drawScanline();
    return () => cancelAnimationFrame(animId);
  }, [cameraReady]);

  return (
    <div className="face-scan-screen">
      <div className="scan-container">
        <div className="scan-viewport">
          {cameraError ? (
            <div className="camera-fallback">
              <div className="fake-face">:-)</div>
            </div>
          ) : (
            <video ref={videoRef} autoPlay muted playsInline />
          )}
          <canvas ref={canvasRef} width={400} height={300} />
        </div>

        <div className="scan-info">
          <h2>Biometric Verification</h2>
          <p className="scan-user">Scanning: <strong>{username}</strong></p>
          <div className="scan-bar-track">
            <div className="scan-bar-fill" style={{ width: `${scanProgress}%` }} />
          </div>
          <p className={`scan-message ${scanProgress === 100 ? 'scan-done' : ''}`}>
            {SCAN_MESSAGES[messageIdx]}
          </p>
        </div>
      </div>
    </div>
  );
}
