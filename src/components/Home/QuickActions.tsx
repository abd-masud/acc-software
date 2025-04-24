import Link from "next/link";
import {
  FiDollarSign,
  FiPieChart,
  FiUsers,
  FiPlus,
  FiTrendingUp,
} from "react-icons/fi";

type QuickAction = {
  title: string;
  description: string;
  icon: React.ReactNode;
  textColor: string;
  link: string;
  effect: string;
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
      textColor: "text-blue-600",
      link: "/customers/add-customers",
      effect: "bg-blue-50 hover:bg-blue-100 border-blue-300",
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
      textColor: "text-emerald-600",
      link: "/invoices/create-invoices",
      effect: "bg-emerald-50 hover:bg-emerald-100 border-emerald-300",
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
      textColor: "text-amber-600",
      link: "/products/add-products",
      effect: "bg-amber-50 hover:bg-amber-100 border-amber-300",
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
      textColor: "text-purple-600",
      link: "/sales-report",
      effect: "bg-purple-50 hover:bg-purple-100 border-purple-300",
    },
  ];

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
        <p className="text-sm text-gray-500 md:block hidden">
          Shortcuts to key functions
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            href={action.link}
            className={`group relative p-5 rounded-xl border transition-all duration-300 ${action.effect} flex flex-col items-center text-center`}
          >
            <div
              className={`relative mb-4 p-3 rounded-full ${action.textColor}`}
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
