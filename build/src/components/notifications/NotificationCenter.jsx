import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Sparkles, AlertCircle, Info, Trash2, CheckCheck } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

export function NotificationCenter() {
  const { notifications, unreadCount, markAllRead, clearRead, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread' | 'read'
  const containerRef = useRef(null);

  const readCount = notifications.filter((n) => n.read).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'badge':
        return <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'status':
        return <Check className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-400 shrink-0" />;
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'read') return n.read;
    return true;
  });

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        className="relative p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-zinc-950 bg-emerald-400 rounded-full ring-2 ring-zinc-950 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/80 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-zinc-100">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2.5">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    title="Mark all as read"
                    className="text-xs text-zinc-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs & Clear Actions */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-950/60 border-b border-zinc-800/80 text-xs">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                    activeTab === 'all'
                      ? 'bg-zinc-800 text-zinc-100'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('unread')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                    activeTab === 'unread'
                      ? 'bg-zinc-800 text-zinc-100'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('read')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                    activeTab === 'read'
                      ? 'bg-zinc-800 text-zinc-100'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Read ({readCount})
                </button>
              </div>

              {readCount > 0 && (
                <button
                  type="button"
                  onClick={clearRead}
                  title="Clear all read messages"
                  className="text-[11px] font-medium text-rose-400 hover:text-rose-300 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear read</span>
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/50">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-sm">
                  {activeTab === 'unread'
                    ? 'No unread notifications.'
                    : activeTab === 'read'
                    ? 'No read notifications.'
                    : 'No notifications yet.'}
                </div>
              ) : (
                filteredNotifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 flex gap-3 text-left transition-colors ${
                      n.read ? 'bg-zinc-900/40 text-zinc-400' : 'bg-zinc-800/30 text-zinc-200'
                    } hover:bg-zinc-800/60`}
                  >
                    <div className="mt-0.5">{getIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-zinc-100 leading-snug">{n.title}</p>
                      <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed break-words">{n.message}</p>
                      <span className="text-[10px] text-zinc-500 mt-1 block">
                        {new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

