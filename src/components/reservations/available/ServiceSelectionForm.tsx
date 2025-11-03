import React, { useState } from "react";
import type { ServiceDto } from "../../../types";
import { AVAILABLE_SERVICES } from "../constants";
import { Button } from "@/components/ui/button";

interface ServiceSelectionFormProps {
  onServiceSelect: (service: ServiceDto) => void;
}

const ServiceSelectionForm: React.FC<ServiceSelectionFormProps> = ({ onServiceSelect }) => {
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Wybierz usługę</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {services.map((service) => (
            <div
              key={service.service_id}
              className={`
                relative border rounded-lg p-4 cursor-pointer transition-all
                ${
                  selectedServiceId === service.service_id
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
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
            >
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  id={`service-${service.service_id}`}
                  name="service"
                  value={service.service_id}
                  checked={selectedServiceId === service.service_id}
                  onChange={() => handleServiceChange(service.service_id)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor={`service-${service.service_id}`}
                    className="block text-lg font-medium text-gray-900 cursor-pointer"
                  >
                    {service.name}
                  </label>
                  <p className="text-gray-600 mt-1">{service.description}</p>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
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

        {error && <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">{error}</div>}

        <div className="flex justify-end">
          <Button type="submit" className="px-6 py-2" disabled={!selectedServiceId}>
            Dalej
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ServiceSelectionForm;
