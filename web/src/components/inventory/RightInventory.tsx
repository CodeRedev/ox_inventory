import React, { useMemo } from 'react';
import { useDrop } from 'react-dnd';
import InventoryGrid from './InventoryGrid';
import PanelHeader from './PanelHeader';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectRightInventory } from '../../store/inventory';
import { closeItemCard } from '../../store/itemCard';
import { getTotalWeight, isSlotWithItem } from '../../helpers';
import { Locale } from '../../store/locale';
import { onDrop } from '../../dnd/onDrop';
import { DragSource, InventoryType } from '../../typings';
import { formatWeight } from '../../utils/formatWeight';

// ox_inventory opens the player's inventory with a 'newdrop' right inventory when nothing is nearby.
const isGroundType = (type: string) => type === 'drop' || type === 'newdrop' || type === '';

const RightInventory: React.FC = () => {
  const dispatch = useAppDispatch();
  const inventory = useAppSelector(selectRightInventory);

  const isGround = isGroundType(inventory.type);
  const acceptsDrops = inventory.type !== InventoryType.SHOP && inventory.type !== InventoryType.CRAFTING;
  const hasItems = useMemo(() => inventory.items.some((slot) => isSlotWithItem(slot)), [inventory.items]);
  const weight = useMemo(() => getTotalWeight(inventory.items), [inventory.items]);
  const maxWeight = inventory.maxWeight || 0;
  const hasSlots = inventory.items.length > 0;

  const [{ isOver }, drop] = useDrop<DragSource, void, { isOver: boolean }>(
    () => ({
      accept: 'SLOT',
      canDrop: (source) => acceptsDrops && hasSlots && source.inventory === InventoryType.PLAYER,
      // Dropping on empty space (not on a slot) sends the item to the first free slot of this inventory.
      drop: (source, monitor) => {
        if (monitor.didDrop()) return;
        dispatch(closeItemCard());
        onDrop(source);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }) && monitor.canDrop(),
      }),
    }),
    [acceptsDrops, hasSlots]
  );

  return (
    <div className="inventory-column">
      <section>
        {isGround ? (
          <PanelHeader
            icon="ground"
            title={Locale.ui_ground || 'Ground'}
            subtitle={Locale.ui_ground_sub || 'Drag items here to drop them'}
          />
        ) : (
          <PanelHeader
            icon="box"
            title={inventory.label || Locale.storage || 'Storage'}
            meta={
              maxWeight > 0 ? (
                <>
                  <span className="meta-main">{formatWeight(weight)}</span>
                  <span className="meta-dim"> / {maxWeight / 1000}kg</span>
                </>
              ) : undefined
            }
            percent={maxWeight > 0 ? (weight / maxWeight) * 100 : 0}
            segments={5}
          />
        )}
        <div
          className={`ground-zone${isOver ? ' is-over' : ''}${isGround && !hasItems ? '' : ' has-grid'}`}
          ref={(element) => {
            drop(element);
          }}
        >
          {isGround && !hasItems ? (
            <div className="ground-empty">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              <p className="ground-empty-title">{Locale.ui_nothing_nearby || 'Nothing nearby.'}</p>
              <p className="ground-empty-hint">
                {Locale.ui_nothing_nearby_hint ||
                  'Open a stash or shop, or drag an item here to drop it on the ground.'}
              </p>
            </div>
          ) : (
            <InventoryGrid inventory={inventory} />
          )}
        </div>
      </section>
    </div>
  );
};

export default RightInventory;