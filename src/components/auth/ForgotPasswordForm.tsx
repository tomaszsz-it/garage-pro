import React, { useState } from "react";
import { Mail, Send, CheckCircle } from "lucide-react";
import { Button } from "../ui/button";

interface ForgotPasswordFormData {
  email: string;
}

interface ForgotPasswordFormErrors {
  email?: string;
  general?: string;
}

export default function ForgotPasswordForm() {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  });
  const [errors, setErrors] = useState<ForgotPasswordFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: ForgotPasswordFormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Adres e-mail jest wymagany";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Wprowadź prawidłowy adres e-mail";
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
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrors({
          general: result.error?.message || "Wystąpił błąd podczas wysyłania e-maila",
        });
        return;
      }

      setIsSuccess(true);
    } catch {
      setErrors({
        general: "Wystąpił błąd połączenia. Spróbuj ponownie.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      email: e.target.value,
    });

    // Clear field error when user starts typing
    if (errors.email) {
      setErrors((prev) => ({
        ...prev,
        email: undefined,
      }));
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
          <CheckCircle size={32} className="text-green-400" />
        </div>
        <h3 className="text-xl font-semibold text-white">E-mail wysłany!</h3>
        <p className="text-blue-100/80 text-sm leading-relaxed">
          Jeśli konto z tym adresem e-mail istnieje, otrzymasz wiadomość z linkiem do resetowania hasła.
        </p>
        <div className="pt-4">
          <Button
            onClick={() => (window.location.href = "/auth/login")}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200"
          >
            Powrót do logowania
          </Button>
        </div>
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
            onChange={handleInputChange}
            className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border backdrop-blur-sm text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all ${
              errors.email ? "border-red-400/50 focus:ring-red-400/50" : "border-white/10 hover:border-white/20"
            }`}
            placeholder="twoj@email.com"
            disabled={isLoading}
          />
        </div>
        {errors.email && <p className="text-red-300 text-sm">{errors.email}</p>}
      </div>

      {/* Info Text */}
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
        <p className="text-blue-200 text-sm">
          Wprowadź adres e-mail powiązany z Twoim kontem. Wyślemy Ci link do resetowania hasła.
        </p>
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
            Wysyłanie...
          </>
        ) : (
          <>
            <Send size={18} />
            Wyślij link resetujący
          </>
        )}
      </Button>
    </form>
  );
}
