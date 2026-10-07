import React, { useState } from 'react';
import useNuiEvent from '../../hooks/useNuiEvent';
import InventoryHotbar from './InventoryHotbar';
import { useAppDispatch } from '../../store';
import { refreshSlots, setAdditionalMetadata, setupInventory } from '../../store/inventory';
import { useExitListener } from '../../hooks/useExitListener';
import type { Inventory as InventoryProps } from '../../typings';
import RightInventory from './RightInventory';
import LeftInventory from './LeftInventory';
import ItemCard from './ItemCard';
import InventoryControl from './InventoryControl';
import Tooltip from '../utils/Tooltip';
import { closeTooltip } from '../../store/tooltip';
import { closeContextMenu } from '../../store/contextMenu';
import { closeItemCard } from '../../store/itemCard';
import Fade from '../utils/transitions/Fade';
import { Locale } from '../../store/locale';
import { fetchNui } from '../../utils/fetchNui';

const Inventory: React.FC = () => {
  const [inventoryVisible, setInventoryVisible] = useState(false);
  const dispatch = useAppDispatch();

  useNuiEvent<boolean>('setInventoryVisible', setInventoryVisible);
  useNuiEvent<false>('closeInventory', () => {
    setInventoryVisible(false);
    dispatch(closeContextMenu());
    dispatch(closeTooltip());
    dispatch(closeItemCard());
  });
  useExitListener(setInventoryVisible);

  useNuiEvent<{
    leftInventory?: InventoryProps;
    rightInventory?: InventoryProps;
  }>('setupInventory', (data) => {
    dispatch(setupInventory(data));
    !inventoryVisible && setInventoryVisible(true);
  });

  useNuiEvent('refreshSlots', (data) => dispatch(refreshSlots(data)));

  useNuiEvent('displayMetadata', (data: Array<{ metadata: string; value: string }>) => {
    dispatch(setAdditionalMetadata(data));
  });

  return (
    <>
      <Fade in={inventoryVisible}>
        <div className="inventory-wrapper">
          <header className="inventory-header">
            <div>
              <h1 className="inventory-title">{Locale.ui_inventory || 'Inventory'}</h1>
              <p className="inventory-subtitle">{Locale.ui_personal_items || 'Personal items'}</p>
            </div>
            <button className="inventory-close" onClick={() => fetchNui('exit')}>
              <span className="inventory-close-text">
                <strong>{Locale.ui_close || 'Close'}</strong>
                <small>{Locale.ui_inventory || 'Inventory'}</small>
              </span>
              <kbd>ESC</kbd>
            </button>
          </header>
          <div className="inventory-body">
            <LeftInventory />
            <InventoryControl />
            <RightInventory />
          </div>
          <Tooltip />
          <ItemCard />
        </div>
      </Fade>
      <InventoryHotbar />
    </>
  );
};

export default Inventory;