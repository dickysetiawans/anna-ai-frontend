import React from 'react';
import { SquarePen, Settings, Clock, Search, PanelLeftClose } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ user, previousChats, onNewChat, onToggle, onOpenSettings, onOpenHistory,onSelectChat }) => {
  return (
    <aside className="sidebar-container">
      {/* Header Sidebar */}
      <div className="sidebar-header">
        <h2 className="sidebar-logo">Anna</h2>
        <div className="sidebar-header-actions">
          <button className="sidebar-icon-btn" aria-label="Cari">
            <Search size={16} />
          </button>
          {/* Tombol Tutup Sidebar */}
          <button className="sidebar-icon-btn" onClick={onToggle} aria-label="Tutup Sidebar">
            <PanelLeftClose size={16} />
          </button>
        </div>
      </div>

      {/* Tombol Chat Baru */}
      <button className="btn-chat-baru" onClick={onNewChat}>
        <SquarePen size={16} />
        <span>Chat Baru</span>
      </button>

      {/* Navigation Menu */}
      <nav className="sidebar-menu">
        <button className="sidebar-menu-item" onClick={onOpenSettings}>
          <Settings size={16} />
          <span>Pengaturan</span>
        </button>
        <button className="sidebar-menu-item" onClick={onOpenHistory}>
          <Clock size={16} />
          <span>Riwayat Chat</span>
        </button>
      </nav>

      {/* Daftar Chat Sebelumnya */}
      <div className="previous-chats-section">
        <span className="section-title">Chat Sebelumnya</span>
        <div className="chat-history-list">
          {previousChats.map((chat) => (
            <button key={chat.id} className="chat-history-item" onClick={() => onSelectChat && onSelectChat(chat)}>
              {chat.title}
            </button>
          ))}
        </div>
      </div>

      {/* Profile Footer */}
      <div className="sidebar-user-footer">
        <div className="user-info-group">
          <div className="user-avatar">{user.avatarInitial}</div>
          <div className="user-details">
            <span className="user-name">{user.name}</span>
            <span className="user-plan">{user.plan}</span>
          </div>
        </div>
        <button className="btn-upgrade">Upgrade</button>
      </div>
    </aside>
  );
};

export default Sidebar;