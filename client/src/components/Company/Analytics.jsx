import React from "react";

const Analytics = ({ jobs, applications }) => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trends */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Application Trends</h3>

          <div className="h-64 flex items-end gap-2">
            {[40, 70, 45, 90, 65, 80, 95].map((height, i) => (
              <div key={i} className="flex-1 bg-indigo-100 rounded-t-sm relative group">
                <div
                  style={{ height: `${height}%` }}
                  className="bg-indigo-500 rounded-t-sm transition-all group-hover:bg-indigo-600"
                />
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500">
                  Day {i + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sourcing */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Top Sourcing Channels</h3>

          <div className="space-y-4">
            {[
              { label: "LinkedIn", value: 45, color: "bg-blue-500" },
              { label: "Indeed", value: 30, color: "bg-indigo-500" },
              { label: "Direct Referral", value: 15, color: "bg-purple-500" },
              { label: "Other", value: 10, color: "bg-gray-400" },
            ].map((channel) => (
              <div key={channel.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{channel.label}</span>
                  <span className="font-medium">{channel.value}%</span>
                </div>

                <div className="w-full bg-gray-100 h-2 rounded-full">
                  <div
                    className={`${channel.color} h-2 rounded-full`}
                    style={{ width: `${channel.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
