'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, ArrowRight, Package } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    firstName: '',
    lastName: '',
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(formData);
    } catch {
      // handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Package className="text-white w-5 h-5" />
          </div>
          <span className="font-black text-2xl text-slate-900">Rental Platform</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
            <p className="text-slate-500 text-sm mt-1">Free forever. Start renting or earning today.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="firstName" className="text-sm font-semibold text-slate-700">
                  First name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  placeholder="Abebe"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-white transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="lastName" className="text-sm font-semibold text-slate-700">
                  Last name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  placeholder="Kebede"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-sm font-semibold text-slate-700">
                Phone number
              </label>
              <input
                id="phone"
                name="phone"
                placeholder="+251 91 234 5678"
                value={formData.phone}
                onChange={handleChange}
                required
                autoComplete="tel"
                className="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-white transition-all"
              />
              <p className="text-xs text-slate-400">Ethiopian phone number required</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  className="w-full h-11 px-4 pr-11 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <ul className="text-xs text-slate-400 mt-1.5 space-y-0.5">
                <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>8+ characters</li>
                <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>One uppercase letter (A-Z)</li>
                <li className={/[a-z]/.test(formData.password) ? 'text-green-600' : ''}>One lowercase letter (a-z)</li>
                <li className={/\d/.test(formData.password) ? 'text-green-600' : ''}>One number (0-9)</li>
                <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-green-600' : ''}>One special character (!@#$...)</li>
              </ul>
            </div>

            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, agreeToTerms: e.target.checked }))
                }
                className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="agreeToTerms" className="text-sm text-slate-500 leading-snug cursor-pointer">
                I agree to the{' '}
                <Link href="/terms" className="text-primary font-semibold hover:underline">
                  Terms and Conditions
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || !formData.agreeToTerms || formData.password.length < 8 || !/[A-Z]/.test(formData.password) || !/[a-z]/.test(formData.password) || !/\d/.test(formData.password) || !/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
