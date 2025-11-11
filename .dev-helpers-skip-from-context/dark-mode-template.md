Szablon implementacji Dark Mode
🔧 1. Importy potrzebne dla dark mode:
import { Switch } from "@/components/ui/switch";import { Moon, Sun } from "lucide-react";
🎯 2. Stan lokalny dla dark mode:
const [isDarkMode, setIsDarkMode] = useState(false);const handleDarkModeToggle = (checked: boolean) => {  setIsDarkMode(checked);};
🎨 3. Toggle w UI (prawym górnym rogu):
<div className="flex items-center gap-2">  <Sun     size={16}     className={`transition-colors duration-200 ${      isDarkMode ? 'text-blue-300/60' : 'text-yellow-500'    }`}   />  <Switch    checked={isDarkMode}    onCheckedChange={handleDarkModeToggle}    className="data-[state=checked]:bg-blue-200 data-[state=unchecked]:bg-white/20"    aria-label="Toggle dark mode"  />  <Moon     size={16}     className={`transition-colors duration-200 ${      isDarkMode ? 'text-blue-200' : 'text-blue-300/60'    }`}   /></div>
🌟 4. Tło całej strony (jeśli potrzebne):
<div className="fixed inset-0 -z-10 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900" />
📦 5. Style dla kontenerów:
// Główny kontener<div className={`rounded-xl p-6 ${  isDarkMode     ? 'bg-white/5 border border-white/10 shadow-2xl backdrop-blur-xl'     : 'bg-white border border-gray-200 shadow-sm'}`}>// Niewybrany elementclassName={isDarkMode   ? "bg-white/5 border border-white/10 shadow-2xl backdrop-blur-xl hover:border-white/20 hover:bg-white/10"  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}// Wybrany/wyróżniony elementclassName={isDarkMode   ? "bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900 text-white shadow-2xl backdrop-blur-xl border border-white/10"  : "border-blue-500 bg-blue-50 ring-2 ring-blue-200"}
📝 6. Style dla tekstów:
// Nagłówek główny<h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>// Opis/dodatkowy tekst<p className={isDarkMode ? 'text-blue-100/90' : 'text-gray-600'}>// Mały tekst/czas trwania<div className={`flex items-center mt-2 text-sm ${  isDarkMode ? 'text-blue-200' : 'text-gray-500'}`}>
🔘 7. Style dla radio buttonów i innych kontrolek:
<input  className={`mt-1 h-4 w-4 focus:ring-2 ${    isDarkMode      ? 'text-blue-200 focus:ring-blue-200/50 border-white/20 bg-white/5'      : 'text-blue-600 focus:ring-blue-500 border-gray-300'  }`}/>
🎯 8. Przyciski z gradientem:
<Button   type="submit"   className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"   disabled={!selectedServiceId}>
⚠️ 9. Komunikaty błędów:
<div className={`text-sm rounded-xl p-4 ${  isDarkMode     ? 'text-red-200 bg-red-500/10 border border-red-500/20 backdrop-blur-sm'     : 'text-red-600 bg-red-50 border border-red-200'}`}>
🎨 10. Kolorystyka:
Główne tło: bg-white/5 (przezroczyste)
Wyróżnione elementy: bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900
Granice: border-white/10 (dark), border-gray-200 (light)
Teksty: text-white (dark), text-gray-900 (light)
Opisy: text-blue-100/90 (dark), text-gray-600 (light)
Małe teksty: text-blue-200 (dark), text-gray-500 (light)
🔄 11. Efekty przejść:
Dodaj transition-all duration-200 do wszystkich elementów które się zmieniają
Użyj backdrop-blur-xl dla przezroczystych kontenerów
Dodaj shadow-2xl dla głębokich cieni
🎯 12. Struktura komponentu:
Importy na górze
Stan lokalny (useState)
Handler dla toggle
Tło strony (jeśli potrzebne)
Główny kontener z warunkowymi stylami
Toggle w prawym górnym rogu
Zawartość z warunkowymi stylami dla wszystkich elementów
Ten szablon możesz zastosować do dowolnego komponentu React w aplikacji! 🚀✨


