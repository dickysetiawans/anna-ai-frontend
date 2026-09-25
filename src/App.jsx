import React, { useState, useRef, useEffect } from 'react';
import VrmCanvas from './components/VrmCanvas';
import MiSideText from './components/MiSideText';
import AuthModal from './components/AuthModal';
import Sidebar from './components/Sidebar';
import SettingsModal from './components/SettingsModal';
import HistoryModal from './components/HistoryModal';
import { Settings, History, Send, PanelLeftOpen } from 'lucide-react';
import './App.css';

// Data Dummy
const DUMMY_USER = {
  name: "Dicky S",
  plan: "Free",
  avatarInitial: "DS"
};

const DUMMY_PREVIOUS_CHATS = [
  {
    id: 1,
    title: "Kamu itu Siapa?",
    date: "Kamis, 24 mei 2026",
    messages: [
      { id: 101, sender: "divider", text: "Kemarin" },
      { id: 102, sender: "anna", text: "Haiii, teman-teman, akuuu anna, salam kenal semuanyaaa", time: "21:41" },
      { id: 103, sender: "user", text: "Saya Mau tanya, kamu itu apa?", time: "21:41" },
      { id: 104, sender: "anna", text: "Saya adalah asisten AI yang dirancang untuk membantu menjawab pertanyaan dan menemani kamu ketika kamu senggang", time: "21:42" },
      { id: 105, sender: "user", text: "Ouhh okee makasihh", time: "21:42" },
      { id: 106, sender: "anna", text: "Sama-sama, kalo ada yg ingin kamu tanyakan silahkan saja yaaa", time: "21:43" },
      { id: 107, sender: "divider", text: "Hari Ini" },
      { id: 108, sender: "anna", text: "Haiii, teman-teman, akuuu anna, salam kenal semuanyaa. Apa ada yg bisa saya bantu?", time: "13:43" },
    ]
  },
  {
    id: 2,
    title: "Penjelasan Tentang Saya",
    date: "Rabu, 23 mei 2026",
    messages: [
      { id: 201, sender: "user", text: "Bisa jelaskan tentang dirimu?", time: "10:15" },
      { id: 202, sender: "anna", text: "Aku Anna, karakter 3D AI VRM yang siap nemenin kamu ngobrol kapan saja!", time: "10:16" }
    ]
  },
  {
    id: 3,
    title: "Generate foto",
    date: "Selasa, 22 mei 2026",
    messages: [
      { id: 301, sender: "user", text: "Fitur generate foto sudah bisa?", time: "14:20" },
      { id: 302, sender: "anna", text: "Fitur ini masih dalam tahap pengembangan yaa!", time: "14:21" }
    ]
  }
];

function App() {
  const [inputValue, setInputValue] = useState("");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Management State BGM tanpa tag HTML Audio
  const [isBgmPlaying, setIsBgmPlaying] = useState(true);
  const bgmRef = useRef(null);

  const [speechQueue, setSpeechQueue] = useState([]);
  const [currentSpeech, setCurrentSpeech] = useState({ text: "", sender: "anna" });
  const [speechKey, setSpeechKey] = useState(0);

  const mouthControlRef = useRef(null);

  const activeSpeaker = (currentSpeech.text || speechQueue.length > 0) ? currentSpeech.sender : null;
  const isBusy = Boolean(activeSpeaker);

  // Inisialisasi Audio BGM sekali saja saat komponen dipasang
  useEffect(() => {
    bgmRef.current = new Audio('/bg-music.mp3');
    bgmRef.current.loop = true;
    bgmRef.current.volume = 0.25; // Volume 25% halus

    // Event listener untuk unblock Autoplay pada klik PERTAMA pengguna di mana saja
    const handleFirstInteraction = () => {
      if (bgmRef.current && bgmRef.current.paused && isBgmPlaying) {
        bgmRef.current.play().catch(() => {});
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  // Control Play/Pause dari Modal Settings
  const toggleBgm = (status) => {
    const shouldPlay = typeof status === 'boolean' ? status : !isBgmPlaying;
    setIsBgmPlaying(shouldPlay);

    if (bgmRef.current) {
      if (shouldPlay) {
        bgmRef.current.play().catch((err) => console.log("BGM play error:", err));
      } else {
        bgmRef.current.pause();
      }
    }
  };

  const splitIntoChunks = (text) => {
    if (!text) return [];
    const matches = text.match(/[^.!?\n]+[.!?\n]+/g);
    if (matches && matches.length > 0) {
      return matches.map((s) => s.trim()).filter((s) => s.length > 0);
    }
    const chunks = [];
    for (let i = 0; i < text.length; i += 120) {
      chunks.push(text.substring(i, i + 120).trim());
    }
    return chunks;
  };

  // DIPANGGIL KETIKA MODEL & ANIMASI KANVAS SELESAI LOAD
  const handleModelLoaded = () => {
    // Mulai putar BGM dengan halus begitu model siap
    if (bgmRef.current && isBgmPlaying) {
      bgmRef.current.play().catch(() => {
        // Jika diblokir browser, diputar otomatis pada klik pertama
      });
    }

    // Sambutan Teks Anna
    setTimeout(() => {
      const initialText = "Haiii, teman-teman, akuuu anna, salam kenal semuanyaaa";
      startSpeechSequence(initialText, "anna");
    }, 800);
  };

  const startSpeechSequence = (fullText, sender) => {
    const chunks = splitIntoChunks(fullText);
    if (chunks.length > 0) {
      setSpeechQueue(chunks.slice(1));
      setCurrentSpeech({
        text: chunks[0],
        sender: sender
      });
      setSpeechKey((prev) => prev + 1);
    }
  };

  const handleSelectChat = (chat) => {
    startSpeechSequence(`Melanjutkan topik: ${chat.title}`, "anna");
  };

  const handleSend = () => {
    if (!inputValue.trim() || isBusy) return;
    startSpeechSequence(inputValue, "user");
    setInputValue("");
  };

  const handleChunkComplete = () => {
    if (speechQueue.length > 0) {
      const nextText = speechQueue[0];
      setSpeechQueue((prev) => prev.slice(1));
      setCurrentSpeech((prev) => ({
        text: nextText,
        sender: prev.sender
      }));
      setSpeechKey((prev) => prev + 1);
    } else {
      setCurrentSpeech({ text: "", sender: "anna" });
    }
  };

  const getPlaceholderText = () => {
    if (activeSpeaker === "anna") return "Anna sedang berbicara...";
    if (activeSpeaker === "user") return "Anda sedang berbicara...";
    return "Tanya Anna";
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setIsSidebarOpen(true);
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const hasSidebarShift = isLoggedIn && isSidebarOpen;

  return (
    <div
      className="app-container"
      style={{ backgroundImage: `url('/room-bg.jpg')` }}
    >
      {/* 1. Sidebar Kiri */}
      {isLoggedIn && isSidebarOpen && (
        <Sidebar 
          user={DUMMY_USER} 
          previousChats={DUMMY_PREVIOUS_CHATS} 
          onNewChat={() => startSpeechSequence("Mari kita mulai percakapan baru!", "anna")}
          onToggle={() => setIsSidebarOpen(false)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onSelectChat={handleSelectChat}
        />
      )}

      {/* 2. Floating Button Buka Sidebar */}
      {isLoggedIn && !isSidebarOpen && (
        <button 
          className="btn-open-sidebar" 
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Buka Sidebar"
        >
          <PanelLeftOpen size={18} />
        </button>
      )}

      {/* Top Navigation Bar */}
      <div className={`top-nav-container ${hasSidebarShift ? 'logged-in' : ''}`}>
        {!isLoggedIn && (
          <>
            <button className="nav-btn btn-masuk" onClick={() => setIsAuthOpen(true)}>
              Masuk
            </button>
            <button className="nav-btn btn-daftar" onClick={() => setIsAuthOpen(true)}>
              Daftar Untuk Gratis
            </button>
          </>
        )}
      </div>

      <div className={`top-nav-keluar-container ${hasSidebarShift ? 'logged-in' : ''}`}>
        {isLoggedIn && (
          <button className="nav-btn btn-keluar" onClick={handleLogout}>
            Keluar
          </button>
        )}
      </div>

      {/* Modals */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLoginSuccess={handleLoginSuccess}
      />

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        isLoggedIn={isLoggedIn}
        isBgmPlaying={isBgmPlaying}
        onToggleBgm={toggleBgm}
      />

      <HistoryModal 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        chats={DUMMY_PREVIOUS_CHATS}
        onSelectChat={handleSelectChat}
      />

      {/* Canvas Model 3D VRM */}
      <div className="vrm-layer">
        <VrmCanvas
          onRegisterMouthControl={(fn) => {
            mouthControlRef.current = fn;
          }}
          onModelLoaded={handleModelLoaded}
        />
      </div>

      {/* Teks Melayang */}
      {currentSpeech.text && (
        <MiSideText
          key={speechKey}
          text={currentSpeech.text}
          sender={currentSpeech.sender}
          isLoggedIn={hasSidebarShift}
          onComplete={handleChunkComplete}
          triggerMouth={(dur) => {
            if (mouthControlRef.current) {
              mouthControlRef.current(dur);
            }
          }}
        />
      )}

      {/* Baris Input & Sub-Bar Bawah */}
      <div className={`bottom-ui-container ${hasSidebarShift ? 'with-sidebar' : ''}`}>
        <div className={`input-bar-miside ${isBusy ? 'disabled' : ''}`}>
          <input
            type="text"
            placeholder={getPlaceholderText()}
            value={inputValue}
            disabled={isBusy}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isBusy && handleSend()}
          />
          <button 
            onClick={handleSend} 
            disabled={isBusy}
            className="btn-send-arrow" 
            aria-label="Kirim"
          >
            <Send size={16} />
          </button>
        </div>

        {!isLoggedIn && (
          <div className="bottom-sub-bar">
            <button className="sub-btn" onClick={() => setIsSettingsOpen(true)}>
              <Settings size={12} /> Pengaturan
            </button>
            <button className="sub-btn" onClick={() => setIsHistoryOpen(true)}>
              Riwayat Pesan <History size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;