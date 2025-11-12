"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { DotsVerticalIcon } from "@radix-ui/react-icons";

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export default function DashboardCard({
  title,
  value,
  subtitle,
}: DashboardCardProps) {
  return (
    <div className="bg-white rounded-xl2 shadow-card p-5 flex flex-col justify-between border border-gray-100 hover:shadow-lg transition">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm text-gray-500">{title}</h3>
          <p className="text-3xl font-semibold text-purplecrm-700 mt-1">
            {value}
          </p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>

        {/* Radix Dropdown for actions */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="p-2 rounded-full hover:bg-gray-100 focus:outline-none">
              <DotsVerticalIcon />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            align="end"
            className="bg-white rounded-lg shadow-card border border-gray-200 p-2 w-32"
          >
            <DropdownMenu.Item className="p-2 text-sm hover:bg-purplecrm-50 rounded-md cursor-pointer">
              View
            </DropdownMenu.Item>
            <DropdownMenu.Item className="p-2 text-sm hover:bg-purplecrm-50 rounded-md cursor-pointer">
              Edit
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    </div>
  );
}
