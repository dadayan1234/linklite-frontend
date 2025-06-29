import React, { useState, useEffect } from 'react';
import { Link as IconLink, Zap, ArrowRight, Copy } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const baseUrl = "https://link.nggo.site";

const Guest = ({ showNotification }) => {
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/app', { replace: true });
    }
  }, [navigate]);

  const handleGuestShorten = async () => {
    if (!url) return showNotification("URL harus diisi", 'error');
    try { new URL(url); } catch { return showNotification("Format URL tidak valid", 'error'); }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${baseUrl}/guest/shorten`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          original_url: url,
          custom_code: customCode || null
        })
      });

      const data = await response.json();

      if (response.status === 429) {
        showNotification("Anda telah mencapai batas pemendekan link minggu ini. Silakan buat akun gratis untuk fitur tak terbatas.", 'error');
        setLoading(false);
        return;
      }

      if (!response.ok) throw new Error(data.detail);

      setResult(data.short_url);
      setUrl('');
      setCustomCode('');
      showNotification("Link berhasil dipendekkan!");
    } catch (error) {
      showNotification(error.message || "Gagal memendekkan link", 'error');
    }
    setLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showNotification("Link disalin!", 'success');
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 text-gray-800">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <IconLink className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">NggoSite</h1>
            </Link>
            <button onClick={() => navigate('/app')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg transition-colors">
              Login / Daftar
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight">
          <span className="block">Link Simple,</span>
          <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dampak Besar.</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
          Alat gratis dan elegan untuk memendekkan URL panjang Anda, membuatnya mudah dibagikan. Mulai sekarang — tanpa perlu daftar!
        </p>

        <div className="mt-10 max-w-2xl mx-auto">
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Tempelkan URL panjang Anda di sini..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGuestShorten()}
              className="w-full px-5 py-4 text-lg bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Kode custom (opsional, max 3x/minggu)"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              className="w-full px-5 py-4 text-lg bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleGuestShorten}
              disabled={loading || !url}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2 text-lg"
            >
              <Zap className="w-5 h-5" />
              <span>{loading ? 'Memendekkan...' : 'Pendekkan'}</span>
            </button>
          </div>
          {result && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between animate-fade-in-up">
              <a href={result} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 hover:underline">{result}</a>
              <button onClick={() => copyToClipboard(result)} className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600">
                <Copy className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Call to Action */}
      <div className="bg-white py-12 border-t border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Ingin Fitur Lebih?</h2>
          <p className="mt-2 text-gray-600 max-w-xl mx-auto">
            Daftar akun untuk menikmati <strong>edit link</strong>, <strong>statistik kunjungan</strong>, <strong>QR Code</strong>, dan <strong>dashboard link pribadi</strong> yang lengkap.
          </p>
          <button
            onClick={() => navigate('/app')}
            className="mt-6 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-lg inline-flex items-center space-x-2"
          >
            <span>Masuk / Daftar</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Guest;
