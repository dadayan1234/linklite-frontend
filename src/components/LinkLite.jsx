import React, { useState, useEffect, useRef } from 'react';
import { Link, Copy, Trash2, Edit3, LogOut, Eye, Plus, Globe, Zap } from 'lucide-react';

const LinkLite = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', password: '' });
  const [shortenData, setShortenData] = useState({ url: '', custom: '' });
  const [userLinks, setUserLinks] = useState([]);
  const [editModal, setEditModal] = useState({ show: false, shortCode: '', url: '', customCode: '' });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  
  const baseUrl = "https://link.penaku.site";
  const websocketsRef = useRef([]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const register = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData)
      });

      const data = await response.json();
      if (response.ok) {
        showNotification("Registration successful! Please login.");
        setShowRegister(false);
        setRegisterData({ username: '', password: '' });
      } else {
        showNotification(data.detail || "Registration failed", 'error');
      }
    } catch (error) {
      showNotification("Registration error: " + error.message, 'error');
    }
    setLoading(false);
  };

  const login = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `username=${loginData.username}&password=${loginData.password}`
      });

      const data = await response.json();
      if (response.ok) {
        setCurrentUser(loginData.username);
        setLoginData({ username: '', password: '' });
        showNotification(`Welcome back, ${loginData.username}!`);
        fetchUserLinks();
      } else {
        showNotification(data.detail || "Login failed", 'error');
      }
    } catch (error) {
      showNotification("Login error: " + error.message, 'error');
    }
    setLoading(false);
  };

  const shorten = async () => {
    if (!currentUser) {
      showNotification("Please login first!", 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/shorten`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentUser}`
        },
        body: JSON.stringify({ original_url: shortenData.url, custom_code: shortenData.custom })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Shortening failed");

      navigator.clipboard.writeText(data.short_url);
      showNotification(`Short link created: ${data.short_url} (Copied to clipboard)`);
      setShortenData({ url: '', custom: '' });
      fetchUserLinks();
    } catch (error) {
      showNotification(error.message, 'error');
    }
    setLoading(false);
  };

  const setupLinkViewsWebSocket = (shortCode) => {
    const ws = new WebSocket(`wss://link.m.site/ws/link-views/${shortCode}`);
    
    ws.onmessage = function(event) {
      const data = JSON.parse(event.data);
      setUserLinks(prevLinks => 
        prevLinks.map(link => 
          link.short_code === shortCode 
            ? { ...link, visits: data.views }
            : link
        )
      );
    };

    return ws;
  };

  const fetchUserLinks = async () => {
    if (!currentUser) return;

    try {
      const response = await fetch(`${baseUrl}/user/links`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${currentUser}` }
      });

      const links = await response.json();
      setUserLinks(links);

      // Close existing websockets
      websocketsRef.current.forEach(ws => ws.close());
      websocketsRef.current = [];

      // Setup new websockets
      links.forEach(link => {
        const ws = setupLinkViewsWebSocket(link.short_code);
        websocketsRef.current.push(ws);
      });
    } catch (error) {
      console.error("Error fetching links:", error);
    }
  };

  const saveEditLink = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/links/${editModal.shortCode}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentUser}`
        },
        body: JSON.stringify({ 
          original_url: editModal.url, 
          custom_code: editModal.customCode 
        })
      });

      const data = await response.json();
      if (response.ok) {
        showNotification("Link updated successfully");
        setEditModal({ show: false, shortCode: '', url: '', customCode: '' });
        fetchUserLinks();
      } else {
        showNotification(data.detail || "Failed to update link", 'error');
      }
    } catch (error) {
      showNotification("Error updating link: " + error.message, 'error');
    }
    setLoading(false);
  };

  const deleteLink = async (shortCode) => {
    if (!confirm("Are you sure you want to delete this link?")) return;

    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/links/${shortCode}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${currentUser}` }
      });

      const data = await response.json();
      if (response.ok) {
        showNotification("Link deleted successfully");
        fetchUserLinks();
      } else {
        showNotification(data.detail || "Failed to delete link", 'error');
      }
    } catch (error) {
      showNotification("Error deleting link: " + error.message, 'error');
    }
    setLoading(false);
  };

  const copyLink = (link) => {
    navigator.clipboard.writeText(link);
    showNotification("Link copied to clipboard!");
  };

  const logout = () => {
    setCurrentUser(null);
    setUserLinks([]);
    websocketsRef.current.forEach(ws => ws.close());
    websocketsRef.current = [];
    showNotification("Logged out successfully");
  };

  useEffect(() => {
    return () => {
      websocketsRef.current.forEach(ws => ws.close());
    };
  }, []);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        {/* Notification */}
        {notification.show && (
          <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 animate-pulse ${
            notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.4)_1px,transparent_0)] [background-size:50px_50px]"></div>
        </div>

        <div className="relative w-full max-w-md">
          {/* Logo Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <Link className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LinkLite
            </h1>
            <p className="text-gray-600 mt-2">Shorten links, amplify reach</p>
          </div>

          {/* Auth Form */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20">
            {!showRegister ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Welcome Back</h2>
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Username"
                      value={loginData.username}
                      onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <button
                    onClick={login}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg disabled:opacity-50"
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </div>
                <p className="text-center mt-6 text-gray-600">
                  Don't have an account?{' '}
                  <button onClick={() => setShowRegister(true)} className="text-blue-600 hover:text-blue-800 font-semibold">
                    Sign up
                  </button>
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Create Account</h2>
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Username"
                      value={registerData.username}
                      onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <button
                    onClick={register}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg disabled:opacity-50"
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </button>
                </div>
                <p className="text-center mt-6 text-gray-600">
                  Already have an account?{' '}
                  <button onClick={() => setShowRegister(false)} className="text-blue-600 hover:text-blue-800 font-semibold">
                    Sign in
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 animate-pulse ${
          notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Link className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  LinkLite
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="hidden sm:block text-gray-600">Welcome, <span className="font-semibold text-gray-900">{currentUser}</span></span>
              <button
                onClick={logout}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* URL Shortener Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Shorten Your Links</h2>
            <p className="text-gray-600">Transform long URLs into powerful, trackable short links</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Paste your long URL here..."
                  value={shortenData.url}
                  onChange={(e) => setShortenData({...shortenData, url: e.target.value})}
                  className="w-full px-6 py-4 text-lg bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="lg:w-48">
                <input
                  type="text"
                  placeholder="Custom code (optional)"
                  value={shortenData.custom}
                  onChange={(e) => setShortenData({...shortenData, custom: e.target.value})}
                  className="w-full px-6 py-4 text-lg bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <button
                onClick={shorten}
                disabled={loading || !shortenData.url}
                className="lg:w-48 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>{loading ? 'Shortening...' : 'Shorten'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Links List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Globe className="w-6 h-6 text-blue-600" />
            <h3 className="text-2xl font-bold text-gray-900">Your Shortened Links</h3>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
              {userLinks.length}
            </span>
          </div>

          {userLinks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Link className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No links yet. Create your first short link above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userLinks.map((link) => (
                <div key={link.short_code} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <a
                          href={link.short_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline truncate"
                        >
                          {link.short_url}
                        </a>
                        <div className="flex items-center space-x-1 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          <Eye className="w-3 h-3" />
                          <span>{link.visits}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm truncate" title={link.original_url}>
                        {link.original_url}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => copyLink(link.short_url)}
                        className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-colors text-sm"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </button>
                      <button
                        onClick={() => setEditModal({
                          show: true,
                          shortCode: link.short_code,
                          url: link.original_url,
                          customCode: link.short_code
                        })}
                        className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl transition-colors text-sm"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => deleteLink(link.short_code)}
                        className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-colors text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editModal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Link</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                <input
                  type="text"
                  value={editModal.url}
                  onChange={(e) => setEditModal({...editModal, url: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Custom Code</label>
                <input
                  type="text"
                  value={editModal.customCode}
                  onChange={(e) => setEditModal({...editModal, customCode: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setEditModal({ show: false, shortCode: '', url: '', customCode: '' })}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={saveEditLink}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl transition-all font-semibold disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkLite;