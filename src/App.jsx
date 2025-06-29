import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

// Import komponen LinkLite (yang berisi Auth dan Dashboard)
import LinkLite from './components/LinkLite'; // Sesuaikan path jika perlu

// Import halaman Guest BARU
import Guest from './components/Guest'; // Sesuaikan path jika perlu

// Import halaman-halaman statis Anda
import NggoVsLinktree from './pages/NggoVsLinktree';
import About from './pages/About';
import Faq from './pages/Faq';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Notification from './components/Notification'; // Asumsi Anda punya komponen ini

// Komponen untuk redirect dari link pendek
function RedirectShort() {
  const { shortcode } = useParams();
  useEffect(() => {
    if (shortcode) {
      window.location.replace(`https://link.nggo.site/${shortcode}`);
    }
  }, [shortcode]);
  return <div className="w-full min-h-screen flex items-center justify-center">Mengarahkan...</div>;
}

function App() {
  // 2. State untuk mengontrol notifikasi (tidak ada perubahan di sini)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });

  // 3. Fungsi untuk menampilkan notifikasi (tidak ada perubahan di sini)
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    // Sembunyikan setelah 4 detik
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  return (
    <>
      {/* 4. Render komponen Notifikasi dengan props yang sesuai */}
      <Notification 
        show={notification.show} 
        message={notification.message} 
        type={notification.type} 
      />
      <BrowserRouter>
        <Routes>
          {/* Rute Utama (Landing Page) sekarang adalah komponen Guest */}
          <Route path="/" element={<Guest showNotification={showNotification} />} />

          {/* Rute /app akan menjalankan komponen LinkLite lama Anda */}
          {/* LinkLite akan secara internal menampilkan Auth atau Dashboard */}
          <Route path="/app" element={<LinkLite />} />
          
          {/* Rute-rute statis lainnya */}
          <Route path="/shortlink-gratis" element={<Guest showNotification={showNotification} />} /> {/* Arahkan ke Guest */}
          <Route path="/nggo-vs-linktree" element={<NggoVsLinktree />} />
          <Route path="/tentang" element={<About />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          {/* Handler untuk shortcode (ini harus di paling bawah) */}
          <Route path="/:shortcode" element={<RedirectShort />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;