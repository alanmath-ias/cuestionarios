if (typeof window !== 'undefined' && (window as any).__isPublicQuiz) {
  const originalFetch = window.fetch;
  window.fetch = async (input, init) => {
    if (typeof input === 'string' && input.includes('/api/') && !input.includes('/api/public/')) {
      //console.log('Bloqueando llamada a API protegida:', input);
      return Promise.reject(new Error('Acceso bloqueado en modo público'));
    }
    return originalFetch(input, init);
  };
}