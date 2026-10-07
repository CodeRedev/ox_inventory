
export const formatWeight = (grams: number): string => {
  if (!grams || grams <= 0) return '0kg';
  if (grams < 100) return `${Math.round(grams)}g`;

  return `${(grams / 1000).toFixed(2).replace(/(\.\d)0$/, '$1')}kg`;
};