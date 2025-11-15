import React, { useState } from "react";
import type { ServiceDto } from "../../../types";
import { AVAILABLE_SERVICES } from "../constants";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";

interface ServiceSelectionFormProps {
  onServiceSelect: (service: ServiceDto) => void;
}

const ServiceSelectionForm: React.FC<ServiceSelectionFormProps> = ({ onServiceSelect }) => {
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Services are already in ServiceDto format
  const services: ServiceDto[] = AVAILABLE_SERVICES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedServiceId) {
      setError("Proszę wybrać usługę");
      return;
    }

    const selectedService = services.find((s) => s.service_id === selectedServiceId);
    if (selectedService) {
      onServiceSelect(selectedService);
    }
  };

  const handleServiceChange = (serviceId: number) => {
    setSelectedServiceId(serviceId);
    setError(null);
  };

  const handleDarkModeToggle = (checked: boolean) => {
    setIsDarkMode(checked);
  };

  return (
    <>
      {/* Full page background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900" />
      
      <div className={`rounded-xl p-6 ${
        isDarkMode 
          ? 'bg-white/5 border border-white/10 shadow-2xl backdrop-blur-xl' 
          : 'bg-white border border-gray-200 shadow-sm'
      }`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Wybierz usługę
        </h2>
        
        {/* Dark Mode Toggle */}
        <div className="flex items-center gap-2">
          <Sun 
            size={16} 
            className={`transition-colors duration-200 ${
              isDarkMode ? 'text-blue-300/60' : 'text-yellow-500'
            }`} 
          />
          <Switch
            checked={isDarkMode}
            onCheckedChange={handleDarkModeToggle}
            className="data-[state=checked]:bg-blue-200 data-[state=unchecked]:bg-white/20"
            aria-label="Toggle dark mode"
          />
          <Moon 
            size={16} 
            className={`transition-colors duration-200 ${
              isDarkMode ? 'text-blue-200' : 'text-blue-300/60'
            }`} 
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {services.map((service) => (
            <div
              key={service.service_id}
              className={`
                relative border rounded-lg p-4 cursor-pointer transition-all
                ${
                  selectedServiceId === service.service_id
                    ? isDarkMode 
                      ? "bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900 text-white shadow-2xl backdrop-blur-xl border border-white/10"
                      : "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                    : isDarkMode
                      ? "bg-white/5 border border-white/10 shadow-2xl backdrop-blur-xl hover:border-white/20 hover:bg-white/10"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }
              `}
              onClick={() => handleServiceChange(service.service_id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleServiceChange(service.service_id);
                }
              }}
              tabIndex={0}
              role="button"
              aria-pressed={selectedServiceId === service.service_id}
              data-test-id={`service-option-${service.service_id}`}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  id={`service-${service.service_id}`}
                  name="service"
                  value={service.service_id}
                  checked={selectedServiceId === service.service_id}
                  onChange={() => handleServiceChange(service.service_id)}
                  className={`mt-1 h-4 w-4 focus:ring-2 ${
                    isDarkMode
                      ? 'text-blue-200 focus:ring-blue-200/50 border-white/20 bg-white/5'
                      : 'text-blue-600 focus:ring-blue-500 border-gray-300'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor={`service-${service.service_id}`}
                    className={`block text-lg font-medium cursor-pointer ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {service.name}
                  </label>
                  <p className={`mt-1 ${
                    isDarkMode ? 'text-blue-100/90' : 'text-gray-600'
                  }`}>
                    {service.description}
                  </p>
                  <div className={`flex items-center mt-2 text-sm ${
                    isDarkMode ? 'text-blue-200' : 'text-gray-500'
                  }`}>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Czas trwania: {service.duration_minutes} minut
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className={`text-sm rounded-xl p-4 ${
            isDarkMode 
              ? 'text-red-200 bg-red-500/10 border border-red-500/20 backdrop-blur-sm' 
              : 'text-red-600 bg-red-50 border border-red-200'
          }`}>
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <Button 
            type="submit" 
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={!selectedServiceId}
            data-test-id="service-selection-submit"
          >
            Dalej
          </Button>
        </div>
      </form>
      </div>
    </>
  );
};

export default ServiceSelectionForm;
