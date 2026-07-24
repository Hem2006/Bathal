import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import ItemCard from './ItemCard.jsx';

const TIER_COLORS = {
  S: '#FF3B3B',
  A: '#FF6B1A',
  B: '#FFE135',
  C: '#ADFF2F',
  D: '#00FFEF',
  E: '#C4A1FF',
  F: '#FF6EC7'
};

export default function TierRow({ tier, items, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({ id: `tier-${tier}` });
  const ids = items.map((i) => String(i.id));

  return (
    <div className={`tier-row ${isOver ? 'tier-over' : ''}`}>
      <div className="tier-label" style={{ backgroundColor: TIER_COLORS[tier] }}>
        {tier}
      </div>
      <div ref={setNodeRef} className="tier-items">
        <SortableContext items={ids} strategy={horizontalListSortingStrategy}>
          {items.map((item) => (
            <ItemCard key={item.id} item={item} onDelete={onDelete} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
