import React from 'react';
import { format, subDays } from 'date-fns';

/**
 * Weekly Activity Chart Component
 * Displays a bar chart of focus activity (pomodoros) for the last 7 days
 * 
 * @param {Array} weeklyData - Array of 7 objects: { date, focus_minutes, journal_entries_count }
 */
const WeeklyActivityChart = ({ weeklyData = [] }) => {
  // Ensure we have 7 days of data; support backend shape { _id, entries } or { date, focus_minutes, journal_entries_count }
  const ensureSevenDays = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = date.toISOString().slice(0, 10);
      const existingData = weeklyData.find((d) => {
        const dStr = d.date || d._id;
        if (!dStr) return false;
        const dataDate = new Date(dStr);
        return dataDate.toDateString() === date.toDateString();
      });

      const focusMinutes = existingData?.focus_minutes ?? 0;
      const journalCount = existingData?.journal_entries_count ?? existingData?.entries ?? 0;
      const pomodoros = Math.floor(focusMinutes / 25);
      // Show bar from focus when available, else from journal entries
      const activityValue = pomodoros > 0 ? pomodoros : journalCount;

      days.push({
        date,
        focus_minutes: focusMinutes,
        journal_entries_count: journalCount,
        pomodoros,
        activityValue
      });
    }
    return days;
  };

  const chartData = ensureSevenDays();
  const maxActivity = Math.max(...chartData.map((d) => d.activityValue), 1);

  return (
    <div className="card-glass p-6 space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Weekly Activity
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="w-3 h-3 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-sm" />
          <span>Focus & Journal</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-40 flex items-end justify-between gap-2">
        {chartData.map((day, index) => {
          const heightPercentage = day.activityValue > 0
            ? Math.max((day.activityValue / maxActivity) * 100, 5)
            : 5;

          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center gap-2 animate-fadeIn"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Bar */}
              <div className="w-full flex items-end justify-center h-32">
                <div
                  className="w-full max-w-8 bg-gradient-to-t from-purple-500 via-pink-500 to-purple-600 rounded-t transition-all duration-500 hover:opacity-80 cursor-pointer relative group"
                  style={{ height: `${heightPercentage}%` }}
                  title={day.pomodoros > 0 ? `${day.pomodoros} pomodoros` : `${day.journal_entries_count} entries`}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                      {day.pomodoros > 0 ? (
                        <>
                          <div className="font-semibold">{day.pomodoros} 🍅</div>
                          <div>{day.focus_minutes} min</div>
                        </>
                      ) : (
                        <div className="font-semibold">{day.journal_entries_count} entries</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Day Label */}
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {format(day.date, 'EEE')}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          Total this week:
        </span>
        <span className="font-semibold text-purple-600 dark:text-purple-400">
          {chartData.reduce((s, d) => s + d.pomodoros, 0)} focus · {chartData.reduce((s, d) => s + d.journal_entries_count, 0)} entries
        </span>
      </div>
    </div>
  );
};

export default WeeklyActivityChart;
