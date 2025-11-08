import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';
import { Button } from '../ui/button';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterFormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function RegisterForm() {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: RegisterFormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Adres e-mail jest wymagany';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Wprowadź prawidłowy adres e-mail';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Hasło jest wymagane';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Hasło musi mieć co najmniej 8 znaków';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Hasło musi zawierać małą literę, wielką literę i cyfrę';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Potwierdzenie hasła jest wymagane';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Hasła nie są identyczne';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // TODO: Implement API call to /api/auth/register
      console.log('Register attempt:', { email: formData.email, password: formData.password });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSuccess(true);
      
    } catch (error) {
      setErrors({
        general: 'Wystąpił błąd podczas rejestracji. Spróbuj ponownie.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof RegisterFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
          <UserPlus size={32} className="text-green-400" />
        </div>
        <h3 className="text-xl font-semibold text-white">Rejestracja zakończona!</h3>
        <p className="text-blue-100/80 text-sm leading-relaxed">
          Sprawdź swoją skrzynkę e-mail i kliknij link weryfikacyjny, aby aktywować konto.
        </p>
        <Button
          onClick={() => window.location.href = '/auth/login'}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200"
        >
          Przejdź do logowania
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Error */}
      {errors.general && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm">
          <p className="text-red-200 text-sm">{errors.general}</p>
        </div>
      )}

      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-blue-100">
          Adres e-mail
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail size={18} className="text-blue-300" />
          </div>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border backdrop-blur-sm text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all ${
              errors.email 
                ? 'border-red-400/50 focus:ring-red-400/50' 
                : 'border-white/10 hover:border-white/20'
            }`}
            placeholder="twoj@email.com"
            disabled={isLoading}
          />
        </div>
        {errors.email && (
          <p className="text-red-300 text-sm">{errors.email}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-blue-100">
          Hasło
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock size={18} className="text-blue-300" />
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInputChange('password')}
            className={`w-full pl-10 pr-12 py-3 rounded-xl bg-white/5 border backdrop-blur-sm text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all ${
              errors.password 
                ? 'border-red-400/50 focus:ring-red-400/50' 
                : 'border-white/10 hover:border-white/20'
            }`}
            placeholder="Minimum 8 znaków"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-300 hover:text-blue-200 transition-colors"
            disabled={isLoading}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-300 text-sm">{errors.password}</p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-blue-100">
          Powtórz hasło
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock size={18} className="text-blue-300" />
          </div>
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            className={`w-full pl-10 pr-12 py-3 rounded-xl bg-white/5 border backdrop-blur-sm text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all ${
              errors.confirmPassword 
                ? 'border-red-400/50 focus:ring-red-400/50' 
                : 'border-white/10 hover:border-white/20'
            }`}
            placeholder="Powtórz hasło"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-300 hover:text-blue-200 transition-colors"
            disabled={isLoading}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-300 text-sm">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Rejestracja...
          </>
        ) : (
          <>
            <UserPlus size={18} />
            Zarejestruj się
          </>
        )}
      </Button>
    </form>
  );
}
