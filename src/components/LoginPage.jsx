import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, CheckCircle2 } from 'lucide-react';

const LoginPage = () => {
  const { login, signup } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SafeZone</h1>
          <p className="text-gray-600">WHS Audit Platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600 mb-6">Sign in to access your audit workspace</p>

          <div className="space-y-3">
            <button
              onClick={login}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Sign In
            </button>

            <button
              onClick={signup}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg border-2 border-gray-200 transition-colors duration-200"
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Features List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Features</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">Multi-station audit management</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">Real-time compliance tracking</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">AI-powered audit analysis</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">Customizable audit templates</span>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Secure authentication powered by Netlify Identity</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
