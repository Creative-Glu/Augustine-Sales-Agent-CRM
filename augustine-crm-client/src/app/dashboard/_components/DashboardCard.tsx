'use client';

import { motion } from 'framer-motion';
import { ComponentType, SVGProps } from 'react';

interface CardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export default function DashboardCard({ title, value, subtitle, icon: Icon }: CardProps) {
  return (
    <motion.div
      whileHover={{
        scale: 1.03,
        boxShadow: '0 10px 24px rgba(147, 51, 234, 0.15)',
      }}
      transition={{ duration: 0.2 }}
      className={`relative p-[2px] rounded-2xl bg-gradient-to-br hover:brightness-110`}
    >
      <div className="bg-white rounded-2xl p-6 h-full flex flex-col justify-between transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="p-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 shadow-sm">
            <Icon className="w-6 h-6 text-purplecrm-600" />
          </div>
          <p className="text-3xl font-bold text-purplecrm-700">{value}</p>
        </div>
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-1 font-medium">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  );
}
