import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun } from 'lucide-react';

export default function DarkModeToggle() {
  const [isDark, setIsDark] = React.useState(false);

  return (
    <div className="flex items-center gap-2">
      <Sun 
        size={16} 
        className={`transition-colors duration-200 ${
          isDark ? 'text-blue-300/60' : 'text-yellow-300'
        }`} 
      />
      <Switch
        checked={isDark}
        onCheckedChange={setIsDark}
        className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-white/20 border-0 shadow-inner"
        aria-label="Toggle dark mode"
      />
      <Moon 
        size={16} 
        className={`transition-colors duration-200 ${
          isDark ? 'text-blue-200' : 'text-blue-300/60'
        }`} 
      />
    </div>
  );
}