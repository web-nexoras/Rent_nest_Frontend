const DEFAULT_UNIT_IMAGES = [
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=78",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=78",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=78",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=78",
];

export const getDefaultUnitImage = (unitNumber = "") => {
  const slot = String(unitNumber).trim().match(/(\d{2})$/);
  const index = slot ? Number(slot[1]) - 1 : -1;
  return DEFAULT_UNIT_IMAGES[index >= 0 && index < DEFAULT_UNIT_IMAGES.length ? index : 0];
};
