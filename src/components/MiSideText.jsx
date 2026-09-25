import React, { useState, useEffect } from 'react';
import './MiSideText.css';

const MiSideText = ({ text, sender = 'anna', onComplete, triggerMouth, isLoggedIn }) => {
  const [displayedChars, setDisplayedChars] = useState([]);
  const [isFalling, setIsFalling] = useState(false);

  // Batasi tampilan maksimal 220 karakter agar UI tidak meluap
  const MAX_CHAR_SHOW = 220;
  const safeText = text && text.length > MAX_CHAR_SHOW 
    ? text.substring(0, MAX_CHAR_SHOW) + '...' 
    : text;

  // Cek apakah teks dikategorikan panjang (> 100 karakter)
  const isLongText = safeText ? safeText.length > 100 : false;

  useEffect(() => {
    if (!safeText) return;

    setDisplayedChars([]);
    setIsFalling(false);

    const charArray = safeText.split('');
    const timers = [];
    const charDelay = isLongText ? 20 : 45; // Kecepatan ketik otomatis disesuaikan

    charArray.forEach((char, index) => {
      const timer = setTimeout(() => {
        setDisplayedChars((prev) => {
          if (prev.some((item) => item.id === index)) return prev;
          return [...prev, { char, id: index }];
        });
      }, index * charDelay);
      timers.push(timer);
    });

    const typingDuration = charArray.length * charDelay;

    // Trigger animasi bibir jika pengirim adalah Anna
    if (sender === 'anna' && triggerMouth) {
      triggerMouth(typingDuration + 400);
    }

    // Trigger animasi jatuh setelah selesai diketik
    const fallTimer = setTimeout(() => {
      setIsFalling(true);
    }, typingDuration + 1200);
    timers.push(fallTimer);

    // Callback complete setelah seluruh animasi jatuh selesai
    const totalDuration = typingDuration + 1200 + 2600;
    const completeTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, totalDuration);
    timers.push(completeTimer);

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [safeText, sender]);

  return (
    <div className={`miside-chat-container sender-${sender} ${isLoggedIn ? 'with-sidebar' : ''}`}>
      <div className={`miside-sentence ${sender} ${isLongText ? 'is-long' : ''}`}>
        {displayedChars.map((item) => {
          const randomRotation = `${(item.id % 2 === 0 ? 1 : -1) * (10 + (item.id * 7) % 25)}deg`;
          const randomSpreadX = `${(item.id % 2 === 0 ? 1 : -1) * (5 + (item.id * 3) % 15)}px`;
          const fallDelay = isFalling ? `${(item.id % 4) * 0.03}s` : '0s';

          return (
            <span
              key={item.id}
              className={isFalling ? 'miside-char-fall' : 'miside-char-in'}
              style={{
                '--rot': randomRotation,
                '--translateX': randomSpreadX,
                animationDelay: fallDelay,
                marginRight: item.char === ' ' ? (isLongText ? '5px' : '7px') : '1px',
              }}
            >
              {item.char}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default MiSideText;