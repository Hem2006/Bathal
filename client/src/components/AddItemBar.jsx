import { useState, useRef } from 'react';
import { uploadImage } from '../lib/api.js';

export default function AddItemBar({ username, onUpload }) {
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  async function handleFiles(files) {
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const item = await uploadImage(file, null, username);
        onUpload?.(item);
      }
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) {
      handleFiles(e.dataTransfer.files);
    }
  }

  return (
    <div className="add-bar">
      <div
        className={`drop-zone ${dragging ? 'drop-active' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <span>Drop screenshots here or click to upload</span>
      </div>
    </div>
  );
}
