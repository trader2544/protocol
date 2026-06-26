import React, { useState } from 'react';
import { Shield, Mail, Lock, User, Eye, EyeOff, Loader2, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { getUserProfile, registerUserProfile } from '../utils/dbService';
import { UserProfile } from '../types';

interface AuthPageProps {
  onAuthSuccess: (user: UserProfile & { role: 'admin' | 'customer' }) => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrorMsg("Email address is required.");
      return;
    }
    
    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (password.length < 4) {
      setErrorMsg("Password must be at least 4 characters long.");
      return;
    }

    if (!isLogin) {
      const trimmedUser = username.trim();
      if (!trimmedUser) {
        setErrorMsg("Username is required for registration.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Retrieve profile from Firestore
        const profile = await getUserProfile(trimmedEmail);
        
        // If password already set in Firestore, check it
        if (profile.password && profile.password !== password) {
          throw new Error("Invalid password. Please check your credentials.");
        }
        
        // If no password existed yet on the account (old record or auto-created), 
        // we can set this password on the profile as their new credential.
        if (!profile.password) {
          const { updateUserProfile } = await import('../utils/dbService');
          await updateUserProfile(trimmedEmail, { password });
          profile.password = password;
        }

        setSuccessMsg("Access authorized. Redirecting...");
        localStorage.setItem('protocol_auth_email', trimmedEmail);
        
        setTimeout(() => {
          onAuthSuccess(profile);
        }, 800);

      } else {
        // Register brand new profile
        const trimmedUser = username.trim();
        const profile = await registerUserProfile(trimmedEmail, trimmedUser, password);
        
        setSuccessMsg("Account successfully registered! You can now log in.");
        localStorage.setItem('protocol_auth_email', trimmedEmail);
        
        // Switch to login tab with fields populated
        setTimeout(() => {
          setIsLogin(true);
          setPassword('');
          setConfirmPassword('');
          setSuccessMsg(null);
        }, 1500);
      }
    } catch (err: any) {
      console.error("Auth action failed:", err);
      let errMsg = "An unexpected error occurred during authorization.";
      
      if (err instanceof Error) {
        errMsg = err.message;
        // Parse custom firestore errors if any
        if (err.message.startsWith('{')) {
          try {
            const parsed = JSON.parse(err.message);
            errMsg = parsed.message || parsed.actionableResolution || errMsg;
          } catch (_) {}
        }
      }
      setErrorMsg(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#0c5460]/20 selection:text-[#0c5460]" id="auth-page-container">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        {/* Logo / Crest Badge */}
        <div className="w-14 h-14 rounded-full bg-[#e6f2f5] border-2 border-[#0c5460]/20 flex items-center justify-center text-[#0c5460] shadow-xs mb-4">
          <Shield className="w-7 h-7" />
        </div>
        
        <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Protocol Database
        </h2>
        <p className="mt-2 text-center text-xs text-gray-500 font-mono tracking-wider uppercase">
          SECURE SANDBOX PORTAL
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-gray-200 sm:rounded-lg sm:px-10 shadow-sm">
          
          {/* Tabs header */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => {
                setIsLogin(true);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition-all ${
                isLogin
                  ? 'border-[#0c5460] text-[#0c5460]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
              id="auth-tab-signin"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition-all ${
                !isLogin
                  ? 'border-[#0c5460] text-[#0c5460]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
              id="auth-tab-signup"
            >
              Create Account
            </button>
          </div>

          {/* Feedback alerts */}
          {errorMsg && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3.5 rounded flex items-start gap-2.5 text-xs text-red-700 animate-fadeIn" id="auth-alert-error">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Authorization Denied:</span> {errorMsg}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 bg-emerald-50 border-l-4 border-emerald-500 p-3.5 rounded flex items-start gap-2.5 text-xs text-emerald-700 animate-fadeIn" id="auth-alert-success">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Authorized:</span> {successMsg}
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* EMAIL */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative rounded shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded focus:outline-hidden focus:ring-1 focus:ring-[#0c5460] focus:border-[#0c5460] focus:bg-white text-sm transition-all font-sans"
                  id="auth-input-email"
                />
              </div>
            </div>

            {/* USERNAME (Signup only) */}
            {!isLogin && (
              <div className="animate-fadeIn">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Desired Username
                </label>
                <div className="relative rounded shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required={!isLogin}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded focus:outline-hidden focus:ring-1 focus:ring-[#0c5460] focus:border-[#0c5460] focus:bg-white text-sm transition-all font-sans"
                    id="auth-input-username"
                  />
                </div>
              </div>
            )}

            {/* PASSWORD */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded focus:outline-hidden focus:ring-1 focus:ring-[#0c5460] focus:border-[#0c5460] focus:bg-white text-sm transition-all font-sans"
                  id="auth-input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-hidden"
                  id="auth-toggle-password-visibility"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD (Signup only) */}
            {!isLogin && (
              <div className="animate-fadeIn">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative rounded shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!isLogin}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded focus:outline-hidden focus:ring-1 focus:ring-[#0c5460] focus:border-[#0c5460] focus:bg-white text-sm transition-all font-sans"
                    id="auth-input-confirm-password"
                  />
                </div>
              </div>
            )}

            {/* BUTTON */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded shadow-xs text-sm font-semibold text-white bg-[#0c5460] hover:bg-[#0a4650] active:bg-[#07363f] focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-[#0c5460] cursor-pointer disabled:opacity-50 transition-all gap-2"
                id="auth-btn-submit"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>{isLogin ? 'Access Database' : 'Register Profile'}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Access Note Helper */}
          <div className="mt-6 border-t border-gray-100 pt-5 text-center">
            <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
              Any email address can be registered as a test customer profile.
              <br />
              Sign in with <span className="font-mono text-[#0c5460] font-semibold select-all">patrickkamande10455@gmail.com</span> to access the Database Administrator control panel.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
