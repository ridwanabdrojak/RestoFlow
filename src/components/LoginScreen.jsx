import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LockKeyhole, ArrowRight, AlertCircle } from 'lucide-react';

const LoginScreen = ({ onLogin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  // Hardcoded PIN for now - commonly used default for demos or simple setups
  // In a real app complexity, this might come from env or backend
  const CORRECT_PIN = "9999";

  const handleNumberClick = (num) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === CORRECT_PIN) {
      onLogin();
    } else {
      setError(true);
      setPin('');
    }
  };

  // Auto-submit when 4 digits are entered
  React.useEffect(() => {
    if (pin.length === 4) {
      if (pin === CORRECT_PIN) {
        onLogin();
      } else {
        setError(true);
        setTimeout(() => setPin(''), 500);
      }
    }
  }, [pin, onLogin]);

  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-blue-500/20 rounded-full">
            <LockKeyhole className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-2">RestoFlow Access</h2>
        <p className="text-slate-400 text-center mb-8">Enter authorized PIN to continue</p>

        <div className="flex justify-center gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${i < pin.length
                ? error ? 'bg-red-500' : 'bg-blue-500 scale-110'
                : 'bg-slate-700'
                }`}
            />
          ))}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 flex items-center justify-center gap-2 mb-6 text-sm"
          >
            <AlertCircle size={16} />
            <span>Incorrect PIN</span>
          </motion.div>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              className="h-16 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-white text-2xl font-medium transition-colors active:scale-95"
            >
              {num}
            </button>
          ))}
          <div className="h-16"></div> {/* Empty slot */}
          <button
            onClick={() => handleNumberClick(0)}
            className="h-16 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-white text-2xl font-medium transition-colors active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="h-16 rounded-xl bg-slate-700/50 hover:bg-red-500/20 hover:text-red-400 text-slate-400 text-lg font-medium transition-colors flex items-center justify-center active:scale-95"
          >
            DEL
          </button>
        </div>


      </div>
    </div>
  );
};

export default LoginScreen;
