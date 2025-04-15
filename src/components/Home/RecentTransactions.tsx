import { FiDollarSign } from "react-icons/fi";

export const RecentTransactions = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Recent Transactions
      </h2>
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="flex justify-between items-center pb-3 border-b border-gray-100"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <FiDollarSign className="text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  Invoice #{1000 + item}
                </p>
                <p className="text-sm text-gray-500">Client {item}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-800">
                ${(1200 + item * 150).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                {item} day{item !== 1 ? "s" : ""} ago
              </p>
            </div>
          </div>
        ))}
      </div>
      <button className="mt-4 text-blue-600 text-sm font-medium hover:text-blue-800">
        View All Transactions →
      </button>
    </div>
  );
};
