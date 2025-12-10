'use client';

import { useState, useEffect } from 'react';
import { Cookie, X, Check } from 'lucide-react';

export function ManualSession() {
  const [show_modal, setShowModal] = useState(false);
  const [session_input, setSessionInput] = useState('');
  const [current_session, setCurrentSession] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('manual_sessionId');
    if (stored) {
      setCurrentSession(stored);
      // Asegurar que la cookie esté establecida
      document.cookie = `sessionId=${stored}; path=/; max-age=86400; SameSite=Lax`;
    }
  }, []);

  const handle_save = () => {
    if (session_input.trim()) {
      const session_value = session_input.trim();
      localStorage.setItem('manual_sessionId', session_value);
      
      // Establecer la cookie con SameSite=Lax para que funcione en el navegador
      document.cookie = `sessionId=${session_value}; path=/; max-age=86400; SameSite=Lax`;
      
      setCurrentSession(session_value);
      setShowModal(false);
      
      // Pequeño delay para asegurar que la cookie se estableció
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };

  const handle_clear = () => {
    localStorage.removeItem('manual_sessionId');
    document.cookie = 'sessionId=; path=/; max-age=0; SameSite=Lax';
    setCurrentSession(null);
    window.location.href = '/login';
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-4 right-4 p-3 text-white rounded-full shadow-lg transition-colors z-50"
        style={{ backgroundColor: '#540c97' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6b0ec4'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#540c97'}
        title="Configurar Session ID manual"
      >
        <Cookie className="w-6 h-6" />
      </button>

      {show_modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-700">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                Session ID Manual (Desarrollo)
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>

            <div className="p-6">
              {current_session ? (
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                      Session ID Activo
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 font-mono break-all">
                      {current_session.substring(0, 50)}...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    No hay session ID configurado. Pega tu cookie sessionId de Postman o del navegador.
                  </p>
                </div>
              )}

              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Session ID Cookie
              </label>
              <textarea
                value={session_input}
                onChange={(e) => setSessionInput(e.target.value)}
                placeholder="Pega aquí el valor de la cookie sessionId..."
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-zinc-900 dark:text-white font-mono text-sm resize-none"
                rows={6}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handle_save();
                  }
                }}
              />
              <p className="text-xs text-zinc-500 mt-2">
                Ejemplo: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
              </p>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Como obtener la cookie:</strong>
                  <br />
                  1. Haz login con Postman en <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">POST {'{API_URL}'}/auth/sign_in</code>
                  <br />
                  2. Copia el valor de la cookie <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">sessionId</code> de la respuesta
                  <br />
                  3. Pegalo aqui y guarda
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-6 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-700">
              {current_session && (
                <button
                  onClick={handle_clear}
                  className="px-4 py-3 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Limpiar Session
                </button>
              )}
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handle_save}
                disabled={!session_input.trim()}
                className="flex-1 px-4 py-3 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#540c97' }}
                onMouseEnter={(e) => !session_input.trim() || (e.currentTarget.style.backgroundColor = '#6b0ec4')}
                onMouseLeave={(e) => !session_input.trim() || (e.currentTarget.style.backgroundColor = '#540c97')}
              >
                Guardar y Recargar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

