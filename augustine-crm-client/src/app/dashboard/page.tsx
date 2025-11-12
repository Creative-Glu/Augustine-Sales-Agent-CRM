import DashboardCard from "./_components/DashboardCard";

export default function DashboardPage() {
  const stats = [
    { title: "Total Leads", value: 1245 },
    { title: "Active Campaigns", value: 32 },
    { title: "Closed Deals", value: 128 },
    { title: "Revenue", value: "$84,200" },
  ];
  return (
    <div>
      <h1 className="text-2xl bg-amber-700 font-bold text-purplecrm-800 mb-6 bg-amber-800">
        Dashboard
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <DashboardCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            subtitle="This month"
          />
        ))}
      </div>
    </div>
  );
}
