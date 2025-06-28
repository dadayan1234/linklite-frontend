import React, { useState, useEffect } from 'react';
import { Link, Copy, Trash2, Edit3, LogOut, Eye, Plus, Globe, Zap, QrCode } from 'lucide-react';

// Konfigurasi dasar, pastikan URL backend Anda benar
const baseUrl = "https://link.penaku.site";

// =================================================================
// Komponen 1: Notifikasi
// Komponen UI untuk menampilkan pesan sukses atau error.
// =================================================================
const Notification = ({ message, type, show }) => {
  if (!show) return null;
  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 ${
      type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
    }`}>
      {message}
    </div>
  );
};

// =================================================================
// Komponen 2: Halaman Otentikasi (Login & Register)
// Komponen ini menangani tampilan dan logika untuk login dan registrasi.
// =================================================================
const AuthPage = ({ onLoginSuccess, showNotification }) => {
  const [showRegister, setShowRegister] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  // Fungsi untuk mendaftarkan user baru
  const handleRegister = async () => {
    if (!registerData.username || !registerData.password) return showNotification("Username dan password harus diisi", 'error');
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(registerData) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail);
      showNotification("Registrasi berhasil! Silakan login.");
      setShowRegister(false);
    } catch (error) { showNotification(error.message || "Registrasi gagal", 'error'); }
    setLoading(false);
  };

  // Fungsi untuk login user
  const handleLogin = async () => {
    if (!loginData.username || !loginData.password) return showNotification("Username dan password harus diisi", 'error');
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/token`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: `username=${encodeURIComponent(loginData.username)}&password=${encodeURIComponent(loginData.password)}` });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail);
      // Panggil onLoginSuccess untuk menyimpan token dan state di parent component
      onLoginSuccess(data.access_token, loginData.username);
    } catch (error) { showNotification(error.message || "Login gagal", 'error'); }
    setLoading(false);
  };

  const handleKeyPress = (e, action) => e.key === 'Enter' && action();

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-5"><div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.4)_1px,transparent_0)] [background-size:50px_50px]"></div></div>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg"><Link className="w-8 h-8 text-white" /></div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">LinkLite</h1>
          <p className="text-gray-600 mt-2">Shorten links, amplify reach</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20">
          {!showRegister ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Welcome Back</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Username" value={loginData.username} onChange={(e) => setLoginData({ ...loginData, username: e.target.value })} onKeyPress={(e) => handleKeyPress(e, handleLogin)} className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="password" placeholder="Password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} onKeyPress={(e) => handleKeyPress(e, handleLogin)} className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button onClick={handleLogin} disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-semibold shadow-lg disabled:opacity-50">{loading ? 'Signing in...' : 'Sign In'}</button>
              </div>
              <p className="text-center mt-6 text-gray-600">Don't have an account? <button onClick={() => setShowRegister(true)} className="text-blue-600 font-semibold">Sign up</button></p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Create Account</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Username" value={registerData.username} onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })} onKeyPress={(e) => handleKeyPress(e, handleRegister)} className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500" />
                <input type="password" placeholder="Password" value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} onKeyPress={(e) => handleKeyPress(e, handleRegister)} className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500" />
                <button onClick={handleRegister} disabled={loading} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-2xl font-semibold shadow-lg disabled:opacity-50">{loading ? 'Creating...' : 'Create Account'}</button>
              </div>
              <p className="text-center mt-6 text-gray-600">Already have an account? <button onClick={() => setShowRegister(false)} className="text-blue-600 font-semibold">Sign in</button></p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// =================================================================
// Komponen 3: Modal untuk QR Code
// Menampilkan gambar QR Code dari URL backend.
// =================================================================
const QRCodeModal = ({ show, onClose, shortCode }) => {
  if (!show) return null;
  // URL ini langsung menunjuk ke endpoint FastAPI yang menghasilkan gambar
  const qrUrl = `${baseUrl}/qr/${shortCode}`;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs p-8 text-center" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Scan QR Code</h2>
        <div className="p-4 bg-gray-100 rounded-2xl inline-block"><img src={qrUrl} alt={`QR Code for ${shortCode}`} className="w-48 h-48" /></div>
        <a href={qrUrl} download={`${shortCode}-qr.png`} className="mt-6 inline-block w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition">Download QR</a>
      </div>
    </div>
  );
};

// =================================================================
// Komponen 4: Modal untuk Edit Link
// Komponen terpisah untuk form edit link.
// =================================================================
const EditLinkModal = ({ show, onClose, link, onSave }) => {
  const [editData, setEditData] = useState({ url: '', customCode: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (link) {
      setEditData({ url: link.original_url, customCode: link.short_code });
    }
  }, [link]);

  if (!show) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(link.short_code, editData.url, editData.customCode);
      onClose();
    } catch (error) {
      // Notifikasi error sudah ditangani oleh parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Link</h2>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Original URL</label><input type="text" value={editData.url} onChange={(e) => setEditData({ ...editData, url: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Custom Code</label><input type="text" value={editData.customCode} onChange={(e) => setEditData({ ...editData, customCode: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50">{loading ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>
    </div>
  );
};


// =================================================================
// Komponen 5: Dashboard Utama (Halaman setelah login)
// =================================================================
const Dashboard = ({ currentUser, token, onLogout, showNotification }) => {
  const [shortenData, setShortenData] = useState({ url: '', custom: '' });
  const [userLinks, setUserLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [qrModal, setQrModal] = useState({ show: false, shortCode: null });
  const [editModal, setEditModal] = useState({ show: false, link: null });

  // Fungsi ini mengambil daftar link dari backend
  const fetchUserLinks = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${baseUrl}/user/links`, { headers: { "Authorization": `Bearer ${token}` } });
      if (!response.ok) throw new Error('Gagal mengambil link');
      const links = await response.json();
      setUserLinks(Array.isArray(links) ? links : []);
    } catch (error) { showNotification(error.message, 'error'); }
  };

  // useEffect ini akan berjalan sekali saat komponen Dashboard dimuat (karena token ada),
  // dan akan otomatis mengambil daftar link.
  useEffect(() => {
    fetchUserLinks();
  }, [token]);

  const handleShorten = async () => {
    if (!shortenData.url) return showNotification("URL harus diisi", 'error');
    try { new URL(shortenData.url); } catch { return showNotification("Format URL tidak valid", 'error'); }
    setLoading(true);
    try {
      const payload = { original_url: shortenData.url };
      if (shortenData.custom) payload.custom_code = shortenData.custom;
      const response = await fetch(`${baseUrl}/shorten`, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail);
      showNotification(`Link berhasil dibuat: ${data.short_url}`);
      setShortenData({ url: '', custom: '' });
      fetchUserLinks();
    } catch (error) { showNotification(error.message, 'error'); }
    setLoading(false);
  };
  
  const handleDelete = async (shortCode) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus link ini?")) return;
    try {
      const response = await fetch(`${baseUrl}/links/${shortCode}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
      if (!response.ok) throw new Error('Gagal menghapus link');
      showNotification("Link berhasil dihapus!");
      fetchUserLinks();
    } catch (error) { showNotification(error.message, 'error'); }
  };

  const handleUpdateLink = async (shortCode, newUrl, newCustomCode) => {
    try {
      const payload = { original_url: newUrl, custom_code: newCustomCode };
      const response = await fetch(`${baseUrl}/links/${shortCode}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Update gagal");
      showNotification("Link berhasil diperbarui!");
      fetchUserLinks();
    } catch (error) {
      showNotification(error.message, 'error');
      throw error;
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <QRCodeModal show={qrModal.show} onClose={() => setQrModal({ show: false, shortCode: null })} shortCode={qrModal.shortCode} />
      <EditLinkModal show={editModal.show} onClose={() => setEditModal({ show: false, link: null })} link={editModal.link} onSave={handleUpdateLink} />

      <div className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="flex justify-between items-center py-4"><div className="flex items-center space-x-3"><div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center"><Link className="w-5 h-5 text-white" /></div><h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">LinkLite</h1></div><div className="flex items-center space-x-4"><span className="hidden sm:block text-gray-600">Welcome, <span className="font-semibold text-gray-900">{currentUser}</span></span><button onClick={onLogout} className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-colors"><LogOut className="w-4 h-4" /><span>Logout</span></button></div></div></div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="text-center mb-8"><div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4"><Zap className="w-8 h-8 text-white" /></div><h2 className="text-3xl font-bold text-gray-900 mb-2">Shorten Your Links</h2></div>
          <div className="w-full max-w-4xl mx-auto"><div className="flex flex-col lg:flex-row gap-4"><input type="text" placeholder="Paste your long URL here..." value={shortenData.url} onChange={(e) => setShortenData({ ...shortenData, url: e.target.value })} className="flex-1 w-full px-6 py-4 text-lg bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500" /><input type="text" placeholder="Custom code (optional)" value={shortenData.custom} onChange={(e) => setShortenData({ ...shortenData, custom: e.target.value })} className="lg:w-48 w-full px-6 py-4 text-lg bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500" /><button onClick={handleShorten} disabled={loading || !shortenData.url} className="lg:w-48 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"><Plus className="w-5 h-5" /><span>{loading ? 'Shortening...' : 'Shorten'}</span></button></div></div>
        </div>

        <div className="w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center space-x-3 mb-6"><Globe className="w-6 h-6 text-blue-600" /><h3 className="text-2xl font-bold text-gray-900">Your Links</h3><span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">{userLinks.length}</span></div>
          {userLinks.length === 0 ? (<div className="text-center py-12"><p className="text-gray-500 text-lg">Anda belum memiliki link. Buat link pertama Anda di atas!</p></div>) : (
            <div className="space-y-4">
              {userLinks.map((link) => (
                <div key={link.short_code} className="w-full bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1 min-w-0"><a href={link.short_url} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-blue-600 hover:underline truncate">{link.short_url}</a><p className="text-gray-600 text-sm truncate" title={link.original_url}>{link.original_url}</p></div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center space-x-1 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full"><Eye className="w-3 h-3" /><span>{link.visits || 0}</span></div>
                      <button onClick={() => navigator.clipboard.writeText(link.short_url).then(() => showNotification('Link disalin!'))} className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm"><Copy className="w-4 h-4" /><span>Copy</span></button>
                      <button onClick={() => setEditModal({ show: true, link: link })} className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl text-sm"><Edit3 className="w-4 h-4" /><span>Edit</span></button>
                      <button onClick={() => setQrModal({ show: true, shortCode: link.short_code })} className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-sm"><QrCode className="w-4 h-4" /><span>QR Code</span></button>
                      <button onClick={() => handleDelete(link.short_code)} className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm"><Trash2 className="w-4 h-4" /><span>Delete</span></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// =================================================================
// Komponen 6: App (Komponen Utama yang Mengatur Semuanya)
// Ini adalah "otak" dari aplikasi. Ia mengatur status login dan
// memutuskan komponen mana yang harus ditampilkan.
// =================================================================
const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  // --- SOLUSI UNTUK SESI HILANG SAAT REFRESH ---
  // useEffect ini berjalan *hanya sekali* saat aplikasi pertama kali dimuat.
  useEffect(() => {
    const validateToken = async () => {
      // 1. Ambil token dari localStorage
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        try {
          // 2. Kirim token ke backend untuk divalidasi
          const response = await fetch(`${baseUrl}/validate_token`, { headers: { 'Authorization': `Bearer ${storedToken}` } });
          if (response.ok) {
            // 3. Jika valid, set state user dan token. Aplikasi akan login otomatis.
            const data = await response.json();
            setCurrentUser(data.username);
            setToken(storedToken);
          } else {
            // 4. Jika tidak valid (misal: expired), hapus dari localStorage
            localStorage.removeItem('authToken'); 
            setToken(null);
          }
        } catch (error) {
          console.error("Gagal validasi token:", error);
          localStorage.removeItem('authToken'); 
          setToken(null);
        }
      }
      // Tandai bahwa pengecekan selesai
      setIsAuthCheckComplete(true);
    };
    validateToken();
  }, []); // Dependency array kosong berarti hanya berjalan sekali

  // Fungsi ini dipanggil dari AuthPage saat login berhasil
  const handleLoginSuccess = (newToken, username) => {
    // 1. Simpan token ke localStorage agar tidak hilang saat refresh
    localStorage.setItem('authToken', newToken);
    // 2. Update state React
    setToken(newToken);
    setCurrentUser(username);
    showNotification(`Selamat datang kembali, ${username}!`);
  };

  // Menangani logout
  const handleLogout = () => {
    // Hapus token dari localStorage dan state
    localStorage.removeItem('authToken');
    setToken(null);
    setCurrentUser(null);
    showNotification("Anda berhasil logout");
  };

  // Tampilkan loading screen selagi cek otentikasi
  if (!isAuthCheckComplete) {
    return <div className="w-full min-h-screen flex items-center justify-center bg-slate-100">Memeriksa sesi...</div>;
  }

  // "Router" sederhana: Tampilkan Dashboard jika ada token, jika tidak, tampilkan AuthPage
  return (
    <>
      <Notification {...notification} />
      {token && currentUser ? (
        <Dashboard currentUser={currentUser} token={token} onLogout={handleLogout} showNotification={showNotification} />
      ) : (
        <AuthPage onLoginSuccess={handleLoginSuccess} showNotification={showNotification} />
      )}
    </>
  );
};

export default App;