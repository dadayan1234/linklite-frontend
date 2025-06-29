import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

const Notification = ({ message, type = 'info', show }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Efek ini akan memicu animasi saat prop 'show' berubah
  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  // Konfigurasi untuk setiap tipe notifikasi
  const styles = {
    success: {
      bg: 'bg-green-100 border-green-400',
      text: 'text-green-800',
      icon: <CheckCircle className="text-green-500" />,
    },
    error: {
      bg: 'bg-red-100 border-red-400',
      text: 'text-red-800',
      icon: <XCircle className="text-red-500" />,
    },
    info: {
      bg: 'bg-blue-100 border-blue-400',
      text: 'text-blue-800',
      icon: <Info className="text-blue-500" />,
    },
    warning: {
      bg: 'bg-yellow-100 border-yellow-400',
      text: 'text-yellow-800',
      icon: <AlertTriangle className="text-yellow-500" />,
    },
  };

  const currentStyle = styles[type] || styles.info;

  return (
    <div 
      className={`fixed top-5 right-5 z-50 flex items-center p-4 rounded-lg shadow-xl border transition-all duration-500 transform
        ${currentStyle.bg} ${currentStyle.text}
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
      `}
      role="alert"
    >
      <div className="flex-shrink-0">{currentStyle.icon}</div>
      <div className="ml-3 text-sm font-semibold">{message}</div>
    </div>
  );
};

export default Notification;