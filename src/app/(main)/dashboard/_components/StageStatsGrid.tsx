import { getStageStats } from '@/utils/stageUtils';
import { motion } from 'framer-motion';

export const StageStatsGrid = ({ counts }: { counts: number[] }) => {
  const stats = getStageStats(counts);

  return (
    <div className="grid grid-cols-3 gap-4 mb-8 mt-6">
      {stats.map((stat: any, i: number) => {
        const Icon = stat.icon;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                {stat.stage}
              </p>

              <Icon className={`w-4 h-4 text-${stat.color}-600 dark:text-${stat.color}-400`} />
            </div>

            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
          </motion.div>
        );
      })}
    </div>
  );
};
