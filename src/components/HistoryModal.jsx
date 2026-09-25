import React, { useState } from 'react';
import { X, ArrowLeft, Copy } from 'lucide-react';
import './HistoryModal.css';

const HistoryModal = ({ isOpen, onClose, chats }) => {
  const [selectedChat, setSelectedChat] = useState(null);

  if (!isOpen) return null;

  const handleCloseModal = () => {
    setSelectedChat(null);
    onClose();
  };

  return (
    <div className="history-modal-overlay" onClick={handleCloseModal}>
      <div className="history-modal-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Tombol Close Popup */}
        <button className="history-close-btn" onClick={handleCloseModal} aria-label="Tutup">
          <X size={18} />
        </button>

        {selectedChat ? (
          <div className="history-detail-view">
            {/* Header Detail Chat */}
            <div className="detail-header">
              <div className="detail-header-left">
                <button 
                  className="btn-back" 
                  onClick={() => setSelectedChat(null)}
                  aria-label="Kembali ke daftar"
                >
                  <ArrowLeft size={16} />
                </button>
                <div className="detail-header-title-group">
                  <h3 className="detail-main-title">Riwayat Chat</h3>
                  <span className="detail-sub-title">{selectedChat.title}</span>
                </div>
              </div>
              <span className="detail-header-date">{selectedChat.date}</span>
            </div>

            {/* Container Isi Percakapan (Scrollable dengan Padding Bawah) */}
            <div className="detail-messages-container">
              {selectedChat.messages && selectedChat.messages.length > 0 ? (
                selectedChat.messages.map((msg) => {
                  if (msg.sender === 'divider') {
                    return (
                      <div key={msg.id} className="history-date-badge">
                        <span>{msg.text}</span>
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={msg.id} 
                      className={`history-bubble-row ${msg.sender === 'user' ? 'user-row' : 'anna-row'}`}
                    >
                      {/* Avatar Anna */}
                      {msg.sender === 'anna' && (
                        <div className="avatar-box anna-avatar">
                          <span>A</span>
                        </div>
                      )}

                      {/* Konten Bubble & Copy Icon */}
                      <div className="bubble-wrapper">
                        <div className="bubble-content">
                          <p>{msg.text}</p>
                        </div>
                        <div className="bubble-footer">
                          <button className="btn-copy" title="Salin Teks">
                            <Copy size={12} />
                          </button>
                          <span className="msg-timestamp">{msg.time}</span>
                        </div>
                      </div>

                      {/* Avatar User */}
                      {msg.sender === 'user' && (
                        <div className="avatar-box user-avatar">
                          <span>DS</span>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="history-empty-text">Tidak ada percakapan terrekam.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="history-list-view">
            <h2 className="history-modal-title">Riwayat Chat</h2>

            <div className="history-list-container">
              {chats && chats.length > 0 ? (
                chats.map((chat) => (
                  <div
                    key={chat.id}
                    className="history-card-item"
                    onClick={() => setSelectedChat(chat)}
                  >
                    <span className="history-chat-title">{chat.title}</span>
                    <span className="history-chat-date">{chat.date}</span>
                  </div>
                ))
              ) : (
                <p className="history-empty-text">Belum ada riwayat chat.</p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default HistoryModal;