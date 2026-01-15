import React from 'react';
import { usePWA } from '../hooks/usePWA';
import { Download, X } from 'lucide-react';

export default function InstallPWA() {
  const { isInstallable, isInstalled, installPWA } = usePWA();
  const [dismissed, setDismissed] = React.useState(false);

  if (isInstalled || !isInstallable || dismissed) return null;

  const handleInstall = async () => {
    const installed = await installPWA();
    if (installed) {
      console.log('✅ PWA installed successfully!');
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 border-2 border-purple-500 z-50 animate-slide-up">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <X className="w-4 h-4 text-gray-500" />
      </button>

      <div className="flex items-start gap-3">
        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex-shrink-0">
          <Download className="w-6 h-6 text-purple-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 dark:text-white mb-1">
            Install LUMIN App
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Install LUMIN on your device for a better experience - works offline too! 📱
          </p>
          
          <button
            onClick={handleInstall}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
          >
            Install Now
          </button>
        </div>
      </div>
    </div>
  );
}