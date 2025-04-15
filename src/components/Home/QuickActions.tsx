import Link from "next/link";
import {
  FiDollarSign,
  FiFileText,
  FiPieChart,
  FiUsers,
  FiPlus,
  FiTrendingUp,
} from "react-icons/fi";

type QuickAction = {
  title: string;
  description: string;
  icon: React.ReactNode;
  bg: string;
  textColor: string;
  link: string;
  hoverEffect: string;
};

export const QuickActions = () => {
  const quickActions: QuickAction[] = [
    {
      title: "Add Customers",
      description: "Create new customer profiles",
      icon: (
        <FiUsers
          className="group-hover:scale-110 transition-transform"
          size={24}
        />
      ),
      bg: "bg-blue-50",
      textColor: "text-blue-600",
      link: "/customers/add-customers",
      hoverEffect: "hover:bg-blue-100 hover:border-blue-300",
    },
    {
      title: "Create Invoice",
      description: "Generate new invoices",
      icon: (
        <FiDollarSign
          className="group-hover:scale-110 transition-transform"
          size={24}
        />
      ),
      bg: "bg-emerald-50",
      textColor: "text-emerald-600",
      link: "/invoices/create-invoices",
      hoverEffect: "hover:bg-emerald-100 hover:border-emerald-300",
    },
    {
      title: "Add Products",
      description: "Expand your catalog",
      icon: (
        <>
          <FiPieChart
            className="group-hover:scale-110 transition-transform"
            size={24}
          />
          <FiPlus className="absolute -top-1 -right-1 text-xs bg-white rounded-full p-0.5 border" />
        </>
      ),
      bg: "bg-amber-50",
      textColor: "text-amber-600",
      link: "/products/add-products",
      hoverEffect: "hover:bg-amber-100 hover:border-amber-300",
    },
    {
      title: "Sales Report",
      description: "View business insights",
      icon: (
        <FiTrendingUp
          className="group-hover:scale-110 transition-transform"
          size={24}
        />
      ),
      bg: "bg-purple-50",
      textColor: "text-purple-600",
      link: "/sales-report",
      hoverEffect: "hover:bg-purple-100 hover:border-purple-300",
    },
  ];

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
        <p className="text-sm text-gray-500">Shortcuts to key functions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            href={action.link}
            className={`group relative p-5 rounded-xl border border-transparent transition-all duration-300 ${action.bg} ${action.hoverEffect} flex flex-col items-center text-center`}
          >
            <div
              className={`relative mb-4 p-3 rounded-full ${action.bg} ${action.textColor}`}
            >
              {action.icon}
            </div>
            <h3 className={`text-lg font-medium mb-1 ${action.textColor}`}>
              {action.title}
            </h3>
            <p className="text-sm text-gray-600">{action.description}</p>
            <span className="mt-3 text-xs font-medium text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
              Click to access →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};
