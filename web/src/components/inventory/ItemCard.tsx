import React, { Fragment, useEffect, useRef, useState } from 'react';
import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectLeftInventory, setItemAmount } from '../../store/inventory';
import { closeItemCard } from '../../store/itemCard';
import { Items } from '../../store/items';
import { Locale } from '../../store/locale';
import { isSlotWithItem } from '../../helpers';
import { onUse } from '../../dnd/onUse';
import { onGive } from '../../dnd/onGive';
import { onDrop } from '../../dnd/onDrop';
import { fetchNui } from '../../utils/fetchNui';
import { setClipboard } from '../../utils/setClipboard';
import { formatWeight } from '../../utils/formatWeight';
import Markdown from '../utils/Markdown';
import WeightBar from '../utils/WeightBar';

interface CustomButton {
  label: string;
  group?: string;
}

const ItemCard: React.FC = () => {
  const dispatch = useAppDispatch();
  const card = useAppSelector((state) => state.itemCard);
  const inventory = useAppSelector(selectLeftInventory);
  const additionalMetadata = useAppSelector((state) => state.inventory.additionalMetadata);
  const [showAttachments, setShowAttachments] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const slot = card.slot !== null ? inventory.items[card.slot - 1] : undefined;
  const item = slot && isSlotWithItem(slot) ? slot : null;
  const open = card.open && !!item;

  const { refs, floatingStyles } = useFloating({
    open,
    strategy: 'fixed',
    placement: 'right-start',
    middleware: [offset({ mainAxis: 10 }), flip(), shift({ padding: 12 })],
    whileElementsMounted: autoUpdate,
  });

  // Anchor the card to the clicked slot.
  useEffect(() => {
    const anchor = card.anchor;
    if (!anchor) return;

    refs.setPositionReference({
      getBoundingClientRect() {
        return {
          x: anchor.x,
          y: anchor.y,
          width: anchor.width,
          height: anchor.height,
          top: anchor.y,
          left: anchor.x,
          right: anchor.x + anchor.width,
          bottom: anchor.y + anchor.height,
        };
      },
    });
  }, [card.anchor, refs]);

  // The selected item was moved or used up: don't let the card land on whatever fills the slot next.
  useEffect(() => {
    if (card.open && !item) dispatch(closeItemCard());
  }, [card.open, item, dispatch]);

  useEffect(() => {
    setShowAttachments(false);
  }, [card.slot]);

  // Click anywhere else closes the card. Clicks on slots are handled by the slot (it toggles).
  useEffect(() => {
    if (!open) return;

    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (cardRef.current?.contains(target)) return;
      if (target.closest('.inventory-slot')) return;
      dispatch(closeItemCard());
    };

    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open, dispatch]);

  if (!open || !item) return null;

  const itemData = Items[item.name];
  const label = item.metadata?.label || itemData?.label || item.name;
  const type = item.metadata?.type || (item.name.toUpperCase().startsWith('WEAPON_') ? 'Weapon' : 'Item');
  const description = item.metadata?.description || itemData?.description;
  const components: string[] = item.metadata?.components || [];
  const customButtons = (itemData?.buttons as unknown as CustomButton[] | undefined) || [];

  const close = () => dispatch(closeItemCard());
  const run = (action: () => void) => () => {
    action();
    close();
  };

  // Split sends half of the stack to the first free slot (pockets first).
  const freeSlot =
    inventory.items.slice(5).find((entry) => !isSlotWithItem(entry)) ||
    inventory.items.find((entry) => !isSlotWithItem(entry));
  const canSplit = item.count > 1 && !!freeSlot;

  const split = () => {
    if (!freeSlot) return;
    dispatch(setItemAmount(Math.floor(item.count / 2)));
    onDrop(
      { item: { name: item.name, slot: item.slot }, inventory: 'player' },
      { item: { slot: freeSlot.slot }, inventory: 'player' }
    );
    dispatch(setItemAmount(0));
  };

  return (
    <div
      className="item-card"
      ref={(element) => {
        cardRef.current = element;
        refs.setFloating(element);
      }}
      style={floatingStyles}
      onContextMenu={(event) => event.preventDefault()}
    >
      <div className="item-card-info">
        <div className="item-card-head">
          <h3>{label}</h3>
          <button className="item-card-collapse" onClick={close} aria-label={Locale.ui_close || 'Close'}>
            <svg viewBox="0 0 10 10">
              <path d="M5 2 9 8H1z" />
            </svg>
          </button>
        </div>
        <p className="item-card-sub">
          {type} · {formatWeight(item.weight)}
        </p>

        {item.durability !== undefined && (
          <div className="item-card-block">
            <span className="item-card-label">{Locale.ui_durability || 'Durability'}</span>
            <WeightBar percent={item.durability} segments={10} />
          </div>
        )}

        {item.metadata?.serial && (
          <div className="item-card-row">
            <span>{Locale.ui_serial || 'Serial'}</span>
            <strong>{item.metadata.serial}</strong>
          </div>
        )}
        {item.metadata?.ammo !== undefined && (
          <div className="item-card-row">
            <span>{Locale.ui_ammo || 'Ammo'}</span>
            <strong>{item.metadata.ammo}</strong>
          </div>
        )}
        {additionalMetadata.map((data: { metadata: string; value: string }, index: number) => (
          <Fragment key={`metadata-${index}`}>
            {item.metadata && item.metadata[data.metadata] && (
              <div className="item-card-row">
                <span>{data.value}</span>
                <strong>{item.metadata[data.metadata]}</strong>
              </div>
            )}
          </Fragment>
        ))}

        {description && <Markdown content={description} className="item-card-description" />}
      </div>

      <div className="item-card-actions">
        <button onClick={run(() => onUse({ name: item.name, slot: item.slot }))}>{Locale.ui_use || 'Use'}</button>
        <button onClick={run(() => onGive({ name: item.name, slot: item.slot }))}>{Locale.ui_give || 'Give'}</button>
        <button onClick={run(() => onDrop({ item: { name: item.name, slot: item.slot }, inventory: 'player' }))}>
          {Locale.ui_drop || 'Drop'}
        </button>
        {/* <button disabled={!canSplit} onClick={run(split)}>
          {Locale.ui_split || 'Split'}
        </button> */}
        {/* {item.metadata?.serial && (
          <button onClick={run(() => setClipboard(item.metadata?.serial || ''))}>
            {Locale.ui_copy_serial || 'Copy Serial'}
          </button>
        )} */}
        {item.metadata?.ammo > 0 && (
          <button onClick={run(() => fetchNui('removeAmmo', item.slot))}>
            {Locale.ui_remove_ammo || 'Remove ammo'}
          </button>
        )}
        {/* {components.length > 0 && (
          <>
            <button onClick={() => setShowAttachments((value) => !value)}>
              {Locale.ui_attachments || 'Attachments'}
            </button>
            {showAttachments &&
              components.map((component, index) => (
                <button
                  key={`${component}-${index}`}
                  className="sub"
                  onClick={run(() => fetchNui('removeComponent', { component, slot: item.slot }))}
                >
                  {Items[component]?.label || component}
                </button>
              ))}
          </>
        )} */}
        {customButtons.map((button, index) => (
          <button key={`custom-${index}`} onClick={run(() => fetchNui('useButton', { id: index + 1, slot: item.slot }))}>
            {button.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ItemCard;