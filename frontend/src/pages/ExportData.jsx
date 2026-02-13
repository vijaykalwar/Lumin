import { Download, FileJson, FileText, Package } from 'lucide-react';
import axios from 'axios';
import { showToast } from '../utils/toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ExportData() {
  const token = localStorage.getItem('token');

  const downloadFile = (data, filename, type) => {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async (endpoint, format, dataType) => {
    try {
      showToast.loading(`Exporting ${dataType}...`);

      const response = await axios.get(`${API_URL}/export/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: format === 'csv' ? 'text' : 'json'
      });

      if (format === 'json') {
        const jsonStr = JSON.stringify(response.data, null, 2);
        downloadFile(jsonStr, `lumin-${dataType}-${Date.now()}.json`, 'application/json');
      } else {
        downloadFile(response.data, `lumin-${dataType}-${Date.now()}.csv`, 'text/csv');
      }

      showToast.dismiss();
      showToast.success(`${dataType} exported successfully!`);

    } catch (error) {
      showToast.dismiss();
      showToast.error(error.response?.data?.message || `Failed to export ${dataType}`);
    }
  };

  const exportOptions = [
    {
      title: '📔 Entries',
      description: 'Export all your journal entries',
      icon: FileText,
      color: 'from-purple-500 to-pink-500',
      actions: [
        {
          label: 'Export as JSON',
          icon: FileJson,
          onClick: () => handleExport('entries/json', 'json', 'entries'),
          className: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50'
        },
        {
          label: 'Export as CSV',
          icon: FileText,
          onClick: () => handleExport('entries/csv', 'csv', 'entries'),
          className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50'
        }
      ]
    },
    {
      title: '🎯 Goals',
      description: 'Export all your goals and progress',
      icon: Package,
      color: 'from-green-500 to-emerald-500',
      actions: [
        {
          label: 'Export as JSON',
          icon: FileJson,
          onClick: () => handleExport('goals/json', 'json', 'goals'),
          className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
        },
        {
          label: 'Export as CSV',
          icon: FileText,
          onClick: () => handleExport('goals/csv', 'csv', 'goals'),
          className: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-900/50'
        }
      ]
    },
    {
      title: '📦 All Data',
      description: 'Export everything (entries + goals + profile)',
      icon: Download,
      color: 'from-orange-500 to-red-500',
      actions: [
        {
          label: 'Export Complete Backup',
          icon: FileJson,
          onClick: () => handleExport('all', 'json', 'backup'),
          className: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
            <Download className="w-8 h-8 text-purple-600" />
            Export Data
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Download your data in JSON or CSV format for backup or analysis
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-8">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">📌 About Data Export</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <li>• <strong>JSON:</strong> Best for backup and importing to other apps</li>
            <li>• <strong>CSV:</strong> Easy to open in Excel, Google Sheets, or any spreadsheet software</li>
            <li>• <strong>Privacy:</strong> All exports are generated in real-time and not stored on our servers</li>
          </ul>
        </div>

        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exportOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
              >
                {/* Icon Header */}
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${option.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  {option.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  {option.description}
                </p>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {option.actions.map((action, actionIndex) => {
                    const ActionIcon = action.icon;
                    return (
                      <button
                        key={actionIndex}
                        onClick={action.onClick}
                        className={`w-full px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${action.className}`}
                      >
                        <ActionIcon className="w-4 h-4" />
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Security Note */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            🔒 <strong>Security:</strong> Your data is yours! Exports are generated securely and never shared with third parties.
          </p>
        </div>
      </div>
    </div>
  );
}
