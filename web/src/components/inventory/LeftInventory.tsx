import React, { useMemo } from 'react';
import InventoryGrid from './InventoryGrid';
import PanelHeader from './PanelHeader';
import { useAppSelector } from '../../store';
import { selectLeftInventory } from '../../store/inventory';
import { getTotalWeight, isSlotWithItem } from '../../helpers';
import { Locale } from '../../store/locale';
import { formatWeight } from '../../utils/formatWeight';

const HOTKEY_SLOTS = 5;

const LeftInventory: React.FC = () => {
  const inventory = useAppSelector(selectLeftInventory);

  const filledHotkeys = useMemo(
    () => inventory.items.slice(0, HOTKEY_SLOTS).filter((slot) => isSlotWithItem(slot)).length,
    [inventory.items]
  );
  const weight = useMemo(() => getTotalWeight(inventory.items), [inventory.items]);
  const maxWeight = inventory.maxWeight || 0;

  return (
    <div className="inventory-column">
      <section>
        <PanelHeader
          icon="hand"
          title={Locale.ui_hotkeys || 'Hot Keys'}
          subtitle={Locale.ui_hotkeys_sub || 'Quick access, press 1-5 in game'}
          meta={
            <>
              <span className="meta-main">{filledHotkeys}</span>
              <span className="meta-dim"> / {HOTKEY_SLOTS}</span>
            </>
          }
          metaIcon="grid"
          percent={(filledHotkeys / HOTKEY_SLOTS) * 100}
          segments={HOTKEY_SLOTS}
        />
        <InventoryGrid inventory={inventory} start={0} end={HOTKEY_SLOTS} className="hotkeys" />
      </section>
      <section>
        <PanelHeader
          icon="pockets"
          title={Locale.ui_pockets || 'Pockets'}
          subtitle={Locale.ui_pockets_sub || 'Items on your person'}
          meta={
            <>
              <span className="meta-main">{formatWeight(weight)}</span>
              {maxWeight > 0 && <span className="meta-dim"> / {maxWeight / 1000}kg</span>}
            </>
          }
          metaIcon="bag"
          percent={maxWeight > 0 ? (weight / maxWeight) * 100 : 0}
          segments={5}
        />
        <InventoryGrid inventory={inventory} start={HOTKEY_SLOTS} className="pockets" />
      </section>
    </div>
  );
};

export default LeftInventory;