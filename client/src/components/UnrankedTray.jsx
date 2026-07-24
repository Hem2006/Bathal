import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import ItemCard from './ItemCard.jsx';

export default function UnrankedTray({ items, onDelete, liveDrags }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'tier-UNRANKED' });
  const ids = items.map((i) => String(i.id));

  return (
    <div className={`unranked-tray ${isOver ? 'tier-over' : ''}`}>
      <h3>Unranked</h3>
      <div ref={setNodeRef} className="unranked-items">
        <SortableContext items={ids} strategy={horizontalListSortingStrategy}>
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onDelete={onDelete}
              draggedByOther={liveDrags?.[item.id]}
            />
          ))}
        </SortableContext>
        {items.length === 0 && <p className="empty-hint">Upload or paste a reel link to get started</p>}
      </div>
    </div>
  );
}
