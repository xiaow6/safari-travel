'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface SidebarProps {
  isOpen: boolean;
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onLogout: () => void;
  userName: string;
  refreshKey: number;
}

export default function Sidebar({
  isOpen,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onLogout,
  userName,
  refreshKey,
}: SidebarProps) {
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    api.listConversations().then(setConversations).catch(console.error);
  }, [refreshKey]);

  if (!isOpen) return null;

  return (
    <div className="w-72 bg-gray-900 text-white flex flex-col shrink-0">
      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-700
                     hover:bg-gray-800 transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Conversation
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelectConversation(conv.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-colors ${
              activeConversationId === conv.id
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            {conv.title}
          </button>
        ))}

        {conversations.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-8">
            No conversations yet.
            <br />
            Start planning your trip!
          </p>
        )}
      </div>

      {/* User Info */}
      <div className="p-3 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-sm font-medium shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-gray-300 truncate">{userName}</span>
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Sign out"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
