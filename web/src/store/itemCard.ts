import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CardAnchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ItemCardState {
  open: boolean;
  slot: number | null;
  anchor: CardAnchor | null;
}

const initialState: ItemCardState = {
  open: false,
  slot: null,
  anchor: null,
};

export const itemCardSlice = createSlice({
  name: 'itemCard',
  initialState,
  reducers: {
    openItemCard(state, action: PayloadAction<{ slot: number; anchor: CardAnchor }>) {
      state.open = true;
      state.slot = action.payload.slot;
      state.anchor = action.payload.anchor;
    },
    closeItemCard(state) {
      state.open = false;
      state.slot = null;
      state.anchor = null;
    },
  },
});

export const { openItemCard, closeItemCard } = itemCardSlice.actions;

export default itemCardSlice.reducer;