import { useState } from 'react';
import { TeamManager } from '../Team/TeamManager';
import { CompletionLog } from '../History/CompletionLog';

type SidebarTab = 'team' | 'history';

export function Sidebar() {
  const [activeTab, setActiveTab] = useState<SidebarTab>('team');

  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('team')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'team'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Team
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          History
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'team' ? <TeamManager /> : <CompletionLog />}
      </div>
    </aside>
  );
}
