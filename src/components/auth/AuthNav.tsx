import React, { useState } from 'react';
import { LogIn, UserPlus, LogOut, User } from 'lucide-react';
import { Button } from '../ui/button';

interface AuthNavProps {
  // TODO: This will be populated from the auth context/store
  user?: {
    email: string;
    id: string;
  } | null;
}

export default function AuthNav({ user }: AuthNavProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('Logout failed:', result.error?.message);
      }

      // Redirect to home page after logout (successful or not)
      window.location.href = '/';
      
    } catch (error) {
      console.error('Logout failed:', error);
      // Still redirect even if logout API fails
      window.location.href = '/';
    } finally {
      setIsLoading(false);
    }
  };

  // If user is authenticated, show logout button and user info
  if (user) {
    return (
      <div className="flex items-center space-x-3">
        {/* User Info - Hidden on mobile */}
        <div className="hidden md:flex items-center space-x-2 text-blue-100/90">
          <User size={18} className="text-blue-300" />
          <span className="text-sm font-medium truncate max-w-32">
            {user.email}
          </span>
        </div>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          disabled={isLoading}
          className="px-3 md:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ease-out flex items-center gap-2 text-blue-100/90 hover:text-white hover:bg-white/10 backdrop-blur-sm disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-blue-300/30 border-t-blue-300 rounded-full animate-spin" />
          ) : (
            <LogOut size={16} className="text-blue-300" />
          )}
          <span className="hidden md:inline">Wyloguj</span>
        </Button>
      </div>
    );
  }

  // If user is not authenticated, show login/register buttons
  return (
    <div className="flex items-center space-x-2">
      {/* Login Button */}
      <Button
        onClick={() => window.location.href = '/auth/login'}
        className="px-3 md:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ease-out flex items-center gap-2 text-blue-100/90 hover:text-white hover:bg-white/10 backdrop-blur-sm"
      >
        <LogIn size={16} className="text-blue-300" />
        <span className="hidden md:inline">Zaloguj</span>
      </Button>

      {/* Register Button */}
      <Button
        onClick={() => window.location.href = '/auth/register'}
        className="px-3 md:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ease-out flex items-center gap-2 bg-gradient-to-r from-white/20 to-white/10 text-white shadow-lg backdrop-blur-sm border border-white/20 hover:from-white/30 hover:to-white/20"
      >
        <UserPlus size={16} className="text-blue-200" />
        <span className="hidden md:inline">Rejestracja</span>
      </Button>
    </div>
  );
}
