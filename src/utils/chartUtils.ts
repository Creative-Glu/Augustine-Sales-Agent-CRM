export const calculateFooterStats = (data: any[], config: any[]) => {
  return config.map((stat) => {
    const total = data.reduce((sum, item) => sum + (item[stat.key] || 0), 0);

    const value = stat.isAverage ? (total / data.length).toFixed(1) : total;

    return {
      ...stat,
      value,
    };
  });
};
