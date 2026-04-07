export const getFunnelCounts = (counts?: number[], totalJourneys = 0) => {
  if (counts && counts.length >= 3) {
    return {
      outreached: counts[0],
      engaged: counts[1],
      mql: counts[2],
    };
  }

  if (totalJourneys > 0) {
    const outreached = Math.round(totalJourneys * 0.6);
    const engaged = Math.round(totalJourneys * 0.3);
    const mql = Math.max(0, totalJourneys - outreached - engaged);

    return { outreached, engaged, mql };
  }

  return { outreached: 120, engaged: 45, mql: 12 };
};

export const getConversionRate = (base: number, next: number): string =>
  base > 0 ? ((next / base) * 100).toFixed(1) : '0';
