import React, { useState, useEffect } from 'react';
import { X, Settings as SettingsIcon, Bell, Volume2, CreditCard, Search } from 'lucide-react';
import './SettingsModal.css';

const SettingsModal = ({ isOpen, onClose, isLoggedIn, isBgmPlaying, onToggleBgm }) => {
  const [activeTab, setActiveTab] = useState('umum');
  const [searchQuery, setSearchQuery] = useState('');

  // Jika modal ditutup atau status login berubah, pastikan tab default kembali ke 'umum'
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('umum');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Tombol Close */}
        <button className="settings-close-btn" onClick={onClose} aria-label="Tutup">
          <X size={18} />
        </button>

        {/* Column Kiri: Sidebar Settings */}
        <div className="settings-sidebar">
          <h3 className="settings-title">Pengaturan</h3>
          
          <div className="settings-search-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Cari"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="settings-menu-list">
            {/* Tab Umum (Selalu Ada) */}
            <button
              className={`settings-menu-item ${activeTab === 'umum' ? 'active' : ''}`}
              onClick={() => setActiveTab('umum')}
            >
              <SettingsIcon size={16} />
              <span>Umum</span>
            </button>

            {/* Tab Pemberitahuan (HANYA MUNCUL SAAT LOGIN) */}
            {isLoggedIn && (
              <button
                className={`settings-menu-item ${activeTab === 'pemberitahuan' ? 'active' : ''}`}
                onClick={() => setActiveTab('pemberitahuan')}
              >
                <Bell size={16} />
                <span>Pemberitahuan</span>
              </button>
            )}

            {/* Tab Suara (Selalu Ada) */}
            <button
              className={`settings-menu-item ${activeTab === 'suara' ? 'active' : ''}`}
              onClick={() => setActiveTab('suara')}
            >
              <Volume2 size={16} />
              <span>Suara</span>
            </button>

            {/* Tab Penagihan (HANYA MUNCUL SAAT LOGIN) */}
            {isLoggedIn && (
              <button
                className={`settings-menu-item ${activeTab === 'penagihan' ? 'active' : ''}`}
                onClick={() => setActiveTab('penagihan')}
              >
                <CreditCard size={16} />
                <span>Penagihan</span>
              </button>
            )}
          </div>
        </div>

        {/* Column Kanan: Content Settings */}
        <div className="settings-content">
          <h2 className="content-header-title">
            {activeTab === 'umum' && 'Umum'}
            {activeTab === 'pemberitahuan' && 'Pemberitahuan'}
            {activeTab === 'suara' && 'Suara'}
            {activeTab === 'penagihan' && 'Penagihan'}
          </h2>

          {activeTab === 'umum' && (
            <div className="settings-tab-umum">
              {/* Box Catatan Penting */}
              <div className="notice-box-black">
                <div className="notice-header">
                  <span className="warning-icon">▲</span> Catatan Penting
                </div>
                <div className="notice-body">
                  <p>
                    AI ini saat ini dirancang untuk menjawab pertanyaan-pertanyaan sederhana
                    dan dapat digunakan sebagai teman ngobrol di waktu senggang.
                  </p>
                  <p>
                    Untuk saat ini, AI menggunakan Bahasa Indonesia sebagai bahasa utama. Fitur
                    deteksi bahasa otomatis (auto-detect) masih dalam tahap pengembangan
                    dan belum tersedia.
                  </p>
                  <p>
                    Untuk fitur suara, voice default saat ini menggunakan suara berbahasa
                    Jepang. Ke depannya, AI akan mendukung multi-bahasa, sehingga pengguna
                    dapat berinteraksi menggunakan berbagai bahasa.
                  </p>
                  <p>
                    Selain itu, pengguna nantinya juga dapat memilih voice actor sesuai dengan
                    preferensi masing-masing.
                  </p>
                  <div className="notice-footer-status">
                    <strong>Status: Masih dalam tahap pengembangan.</strong> Beberapa fitur dan kemampuan AI
                    dapat berubah atau bertambah seiring proses pengembangan.
                  </div>
                </div>
              </div>

              {/* Opsi Form Setting */}
              <div className="settings-options-list">
                <div className="setting-row">
                  <span className="row-label">Bahasa</span>
                  <select className="row-select" defaultValue="indonesia">
                    <option value="indonesia">Indonesia </option>
                    <option value="english">English</option>
                    <option value="japanese">Japanese </option>
                  </select>
                </div>

                <div className="setting-row">
                  <span className="row-label">Musik Latar Belakang</span>
                  <select 
                    className="row-select" 
                    value={isBgmPlaying ? 'default' : 'off'}
                    onChange={(e) => onToggleBgm(e.target.value === 'default')}
                  >
                    <option value="default">Default (Aktif) </option>
                    <option value="off">Mati </option>
                  </select>
                </div>

                <div className="setting-row">
                  <span className="row-label">Warna Tulisan Anda</span>
                  <div className="row-value-indicator">
                    <span className="color-dot yellow"></span> Default
                  </div>
                </div>

                <div className="setting-row">
                  <span className="row-label">Warna Tulisan Anna</span>
                  <div className="row-value-indicator">
                    <span className="color-dot pink"></span> Default
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'umum' && (
            <div className="placeholder-tab-content">
              Fitur {activeTab} sedang dalam pengembangan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;