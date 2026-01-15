import toast from 'react-hot-toast';

// Custom toast with icons
export const showToast = {
  success: (message) => {
    toast.success(message, {
      icon: '✅',
    });
  },

  error: (message) => {
    toast.error(message, {
      icon: '❌',
    });
  },

  loading: (message) => {
    return toast.loading(message, {
      icon: '⏳',
    });
  },

  promise: (promise, messages) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading || 'Loading...',
        success: messages.success || 'Success!',
        error: messages.error || 'Something went wrong!',
      }
    );
  },

  custom: (message, options = {}) => {
    toast(message, {
      icon: options.icon || '💡',
      duration: options.duration || 4000,
      ...options
    });
  },

  // Dismiss specific toast
  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },

  // Dismiss all toasts
  dismissAll: () => {
    toast.dismiss();
  }
};