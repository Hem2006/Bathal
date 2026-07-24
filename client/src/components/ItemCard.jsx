import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { deleteItem } from '../lib/api.js';

export default function ItemCard({ item, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: String(item.id)
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  async function handleDelete(e) {
    e.stopPropagation();
    await deleteItem(item.id);
    onDelete?.(item.id);
  }

  return (
    <div ref={setNodeRef} style={style} className="item-card" {...attributes} {...listeners}>
      <button className="delete-btn" onPointerDown={(e) => e.stopPropagation()} onClick={handleDelete}>
        &times;
      </button>
      <img src={item.image_path} alt={item.caption || 'uploaded'} draggable={false} />
      {item.caption && <span className="caption">{item.caption}</span>}
      {item.added_by && <span className="added-by">- {item.added_by}</span>}
    </div>
  );
}
