import React, { useEffect, useState } from 'react';
import { Inventory } from '../../typings';
import InventorySlot from './InventorySlot';
import { useAppSelector } from '../../store';
import { useIntersection } from '../../hooks/useIntersection';

const PAGE_SIZE = 42;

interface Props {
  inventory: Inventory;
  // Slice of inventory.items to render (0-based, end exclusive). Defaults to everything.
  start?: number;
  end?: number;
  className?: string;
}

const InventoryGrid: React.FC<Props> = ({ inventory, start = 0, end, className }) => {
  const [page, setPage] = useState(0);
  const { ref, entry } = useIntersection({ threshold: 0.5 });
  const isBusy = useAppSelector((state) => state.inventory.isBusy);

  useEffect(() => {
    if (entry && entry.isIntersecting) {
      setPage((prev) => prev + 1);
    }
  }, [entry]);

  const visible = inventory.items.slice(start, end).slice(0, (page + 1) * PAGE_SIZE);

  return (
    <div
      className={`inventory-grid-container${className ? ` ${className}` : ''}`}
      style={{ pointerEvents: isBusy ? 'none' : 'auto' }}
    >
      {visible.map((item, index) => (
        <InventorySlot
          key={`${inventory.type}-${inventory.id}-${item.slot}`}
          item={item}
          ref={index === (page + 1) * PAGE_SIZE - 1 ? ref : null}
          inventoryType={inventory.type}
          inventoryGroups={inventory.groups}
          inventoryId={inventory.id}
        />
      ))}
    </div>
  );
};

export default InventoryGrid;