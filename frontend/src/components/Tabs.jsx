import React from 'react';

const Tabs = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`inline-flex items-center gap-1 p-1 rounded-lg bg-surface-2 border border-border ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeTab === tab.value
              ? 'bg-primary text-primary-foreground shadow-glow-purple'
              : 'text-muted-foreground hover:text-foreground hover:bg-surface-3'
          }`}
        >
          {tab.icon && <span className="mr-2">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
