import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { deleteItem } from '../lib/api.js';
import { colorForUser } from '../lib/userColor.js';
import { API_BASE } from '../lib/config.js';

export default function ItemCard({ item, onDelete, draggedByOther }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: String(item.id),
    disabled: !!draggedByOther
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    ...(draggedByOther
      ? {
          outline: `3px solid ${colorForUser(draggedByOther)}`,
          outlineOffset: '2px',
          animation: 'live-drag-pulse 0.8s ease-in-out infinite'
        }
      : {})
  };

  async function handleDelete(e) {
    e.stopPropagation();
    await deleteItem(item.id);
    onDelete?.(item.id);
  }

  return (
    <div ref={setNodeRef} style={style} className="item-card" {...attributes} {...listeners}>
      {draggedByOther && (
        <span className="live-drag-tag" style={{ background: colorForUser(draggedByOther) }}>
          {draggedByOther} is moving this
        </span>
      )}
      <button className="delete-btn" onPointerDown={(e) => e.stopPropagation()} onClick={handleDelete}>
        &times;
      </button>
      <img src={`${API_BASE}${item.image_path}`} alt={item.caption || 'uploaded'} draggable={false} />
      {item.caption && <span className="caption">{item.caption}</span>}
      {item.added_by && <span className="added-by">- {item.added_by}</span>}
    </div>
  );
}
