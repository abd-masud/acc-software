export const FinancialOverview = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Financial Overview
      </h2>
      <div className="bg-gray-50 rounded-lg h-64 flex items-center justify-center">
        <p className="text-gray-500">Chart visualization will appear here</p>
      </div>
      <div className="flex justify-between mt-4 text-sm text-gray-600">
        <span>Jan</span>
        <span>Feb</span>
        <span>Mar</span>
        <span>Apr</span>
        <span>May</span>
        <span>Jun</span>
      </div>
    </div>
  );
};
