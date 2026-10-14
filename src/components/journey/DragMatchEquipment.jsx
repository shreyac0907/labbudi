import { useState, useMemo } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function ItemVisual({ item, icons }) {
  const Icon = item.icon && icons?.[item.icon];
  if (Icon) return <Icon width={56} />;
  return <span style={{ wordBreak: 'break-word' }}>[ {item.id} ]</span>;
}

function DraggableItem({ item, icons }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: CSS.Translate.toString(transform),
        transition: isDragging ? 'none' : 'transform 200ms ease',
        opacity: isDragging ? 0.6 : 1,
        width: 90,
        height: 90,
        border: '2px dashed #DDD8D0',
        background: '#F7F4EF',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 10,
        color: '#999',
        textAlign: 'center',
        padding: 4,
        cursor: 'grab',
        touchAction: 'none',
        zIndex: isDragging ? 10 : 1,
      }}
    >
      <ItemVisual item={item} icons={icons} />
    </div>
  );
}

function DropZone({ target, matchedItem, icons }) {
  const { setNodeRef, isOver } = useDroppable({ id: target.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        width: 140,
        minHeight: 90,
        border: `2px ${matchedItem ? 'solid var(--color-mint)' : 'dashed var(--color-border)'}`,
        background: isOver ? '#EAF7F3' : '#fff',
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: 8,
      }}
    >
      {matchedItem && (
        <>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#3FA05A' }}>✓</div>
          <ItemVisual item={matchedItem} icons={icons} />
        </>
      )}
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, textAlign: 'center', color: 'var(--color-dark)' }}>
        {target.name}
      </div>
    </div>
  );
}

export default function DragMatchEquipment({ items, wrongMatchText, onFeedback, onAllMatched, icons }) {
  const [matchedIds, setMatchedIds] = useState(() => new Set());
  const shuffledTargets = useMemo(() => shuffle(items), [items]);

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return;

    if (active.id === over.id) {
      setMatchedIds((prev) => {
        const next = new Set(prev);
        next.add(active.id);
        if (next.size === items.length) onAllMatched?.();
        return next;
      });
      const item = items.find((i) => i.id === active.id);
      onFeedback?.(item?.fact ?? '');
    } else {
      onFeedback?.(wrongMatchText);
    }
  }

  const remainingItems = items.filter((i) => !matchedIds.has(i.id));

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, maxWidth: 210, justifyContent: 'center' }}>
          {remainingItems.map((item) => (
            <DraggableItem key={item.id} item={item} icons={icons} />
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, maxWidth: 320, justifyContent: 'center' }}>
          {shuffledTargets.map((target) => (
            <DropZone key={target.id} target={target} matchedItem={matchedIds.has(target.id) ? target : null} icons={icons} />
          ))}
        </div>
      </div>
      <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 12, color: '#999', marginTop: 16 }}>
        {matchedIds.size} / {items.length} matched
      </p>
    </DndContext>
  );
}
