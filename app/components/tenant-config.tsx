'use client';

import { useEffect, useState } from 'react';
import { set_tenant_id, get_tenant_id } from '../lib/api-config';

export function TenantConfig() {
  const [show_prompt, setShowPrompt] = useState(false);
  const [tenant_input, setTenantInput] = useState('');

  useEffect(() => {
    const current_tenant = get_tenant_id();
    if (!current_tenant) {
      setShowPrompt(true);
    }
  }, []);

  const handle_save = () => {
    if (tenant_input.trim()) {
      set_tenant_id(tenant_input.trim());
      setShowPrompt(false);
      window.location.reload();
    }
  };

  if (!show_prompt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
          Configuración de Tenant
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Por favor ingresa tu Tenant ID para continuar
        </p>
        <input
          type="text"
          value={tenant_input}
          onChange={(e) => setTenantInput(e.target.value)}
          placeholder="ej: tenant-123"
          className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none text-zinc-900 dark:text-white mb-4"
          onKeyDown={(e) => e.key === 'Enter' && handle_save()}
        />
        <button
          onClick={handle_save}
          className="w-full px-4 py-3 text-white rounded-lg font-medium transition-all"
          style={{ backgroundColor: '#540c97' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6b0ec4'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#540c97'}
        >
          Guardar
        </button>
      </div>
    </div>
  );
}

