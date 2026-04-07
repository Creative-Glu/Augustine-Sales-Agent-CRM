import { STAGE_COLORS, STAGE_ICONS } from '@/constants/dashboardColors';
import { STAGE_ORDER } from '@/constants/journey';

export const getStageStats = (counts: number[] = []) =>
  STAGE_ORDER.map((stage, index) => ({
    stage,
    value: counts[index] ?? 0,
    color: STAGE_COLORS[stage],
    icon: STAGE_ICONS[stage],
  }));
