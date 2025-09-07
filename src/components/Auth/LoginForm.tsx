import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate a brief loading state for better UX
    setTimeout(() => {
      const success = login(username, password);
      if (!success) {
        setError('Nom d\'utilisateur ou mot de passe incorrect');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-trust-50 via-banking-50 to-trust-100 flex items-center justify-center px-4 py-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f1f5f9' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}></div>
      </div>
      
      <div className="relative w-full max-w-lg">
        {/* Security Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-banking-200 shadow-banking">
            <svg className="w-4 h-4 text-banking-900 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-sm font-medium text-trust-700">Connexion Sécurisée</span>
          </div>
        </div>

        {/* Main Login Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-banking-lg shadow-banking-xl border border-white/20 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-banking-900 to-trust-900 px-8 py-6">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 border border-white/30 p-2">
                <img 
                  src="https://i0.wp.com/unimagec.ma/wp-content/uploads/2021/03/Logo-Unimagec-Web3.png?w=370&ssl=1" 
                  alt="Unimagec Logo" 
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">Se connecter</h1>
              <p className="text-banking-100 text-sm font-medium">Gestion Bancaires Unimagec</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="px-8 py-8">

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                <div>
                  <label htmlFor="username" className="block text-sm font-semibold text-trust-800 mb-3">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-banking-900 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Nom d'utilisateur
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="w-full px-4 py-4 pl-12 border-2 border-trust-200 rounded-banking bg-trust-50/50 focus:bg-white focus:border-banking-500 focus:ring-4 focus:ring-banking-100 transition-all duration-300 text-trust-900 placeholder-trust-400 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Saisissez votre identifiant"
                      disabled={isLoading}
                    />
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-trust-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-trust-800 mb-3">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-banking-900 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Mot de passe
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-4 pl-12 border-2 border-trust-200 rounded-banking bg-trust-50/50 focus:bg-white focus:border-banking-500 focus:ring-4 focus:ring-banking-100 transition-all duration-300 text-trust-900 placeholder-trust-400 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Saisissez votre mot de passe"
                      disabled={isLoading}
                    />
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-trust-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-risk-50 border-2 border-risk-200 rounded-banking p-4 animate-slide-up">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-risk-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-semibold text-risk-800">Erreur d'authentification</h3>
                      <p className="text-sm text-risk-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full bg-gradient-to-r from-banking-900 to-trust-900 hover:from-trust-900 hover:to-banking-900 text-white py-4 px-6 rounded-banking font-semibold text-base shadow-banking-md hover:shadow-banking-lg focus:outline-none focus:ring-4 focus:ring-banking-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex items-center justify-center">
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Authentification...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        <span>Accéder </span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>

            {/* Footer Section */}
            <div className="mt-8 pt-6 border-t border-trust-200">
              <div className="bg-gradient-to-r from-banking-50 to-trust-50 rounded-banking border border-banking-200 p-5">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-banking-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-banking-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="text-sm font-semibold text-trust-800 mb-2">Accès de démonstration</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-trust-600">Identifiant :</span>
                        <code className="text-sm font-mono bg-white px-2 py-1 rounded border border-banking-200 text-banking-700 font-semibold">USERtest</code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-trust-600">Mot de passe :</span>
                        <code className="text-sm font-mono bg-white px-2 py-1 rounded border border-banking-200 text-banking-700 font-semibold">test123</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Footer */}
          <div className="bg-trust-800 px-8 py-4">
            <div className="flex items-center justify-center text-center">
              <div className="flex items-center text-trust-300 text-xs">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Connexion sécurisée SSL • Données chiffrées</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;