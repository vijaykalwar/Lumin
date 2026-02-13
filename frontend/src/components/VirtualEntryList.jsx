import { FixedSizeList as List } from 'react-window';
import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2 } from 'lucide-react';

/**
 * Virtual scrolling wrapper for Entries list
 * Optimized for 100+ entries with smooth 60fps scrolling
 */

const EntryRow = memo(({ index, style, data }) => {
  const { entries, handleDelete } = data;
  const entry = entries[index];

  if (!entry) return null;

  return (
    <div style={style} className="px-2">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 group h-full">
        {/* Header with Mood & Actions */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{entry.moodEmoji}</span>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">
                {entry.title || 'Untitled'}
              </h3>
              <p className="text-xs text-gray-500">
                {new Date(entry.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link
              to={`/entries/${entry._id}/edit`}
              className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Edit2 className="w-4 h-4 text-blue-600" />
            </Link>
            <button
              onClick={() => handleDelete(entry._id)}
              className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>

        {/* Entry Content */}
        <p className="text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
          {entry.notes}
        </p>

        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {entry.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs"
              >
                #{tag}
              </span>
            ))}
            {entry.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                +{entry.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
            {entry.category}
          </span>
          <span>
            {entry.wordCount || 0} words
          </span>
        </div>
      </div>
    </div>
  );
});

EntryRow.displayName = 'EntryRow';

export default function VirtualEntryList({ entries, handleDelete, containerHeight = 600 }) {
  const itemData = { entries, handleDelete };
  
  // Calculate item height based on screen size
  const getItemSize = () => {
    if (window.innerWidth >= 1024) return 280; // lg screens
    if (window.innerWidth >= 768) return 300;  // md screens
    return 320; // sm screens
  };

  const itemSize = getItemSize();

  return (
    <List
      height={containerHeight}
      itemCount={entries.length}
      itemSize={itemSize}
      itemData={itemData}
      width="100%"
      className="scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-200 dark:scrollbar-track-gray-800"
    >
      {EntryRow}
    </List>
  );
}
