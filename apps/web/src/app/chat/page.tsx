'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import ChatWindow from '@/components/chat/ChatWindow';

export default function ChatPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleNewChat = () => {
    setActiveConversationId(null);
  };

  const handleConversationCreated = (id: string) => {
    setActiveConversationId(id);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="h-screen flex bg-white">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        onNewChat={handleNewChat}
        onLogout={logout}
        userName={user.name}
        refreshKey={refreshKey}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-gray-200 flex items-center px-4 gap-3 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1">
            <h2 className="text-sm font-medium text-gray-900">
              {activeConversationId ? 'Conversation' : 'New Conversation'}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
              AI Agent Active
            </span>
          </div>
        </header>

        {/* Chat Window */}
        <ChatWindow
          conversationId={activeConversationId}
          onConversationCreated={handleConversationCreated}
        />
      </div>
    </div>
  );
}
