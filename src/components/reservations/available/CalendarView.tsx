import React, { useState, useEffect } from "react";
import type { ServiceDto, AvailableReservationViewModel } from "../../../types";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ArrowLeft, Clock } from "lucide-react";
import { useAvailableReservations } from "./hooks/useAvailableReservations";
import { EmptyStateMessage } from "../EmptyStateMessage";

interface CalendarViewProps {
  selectedService: ServiceDto;
  availableSlots: AvailableReservationViewModel[];
  selectedDay: string | null;
  onDaySelect: (day: string) => void;
  onTimeSelect: (slot: AvailableReservationViewModel) => void;
  onBack: () => void;
  setSlots: (slots: AvailableReservationViewModel[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  selectedService,
  availableSlots,
  selectedDay,
  onDaySelect,
  onTimeSelect,
  onBack,
  setSlots,
  setLoading,
  setError,
}) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  // Get current week dates (Monday to Sunday)
  const getWeekDates = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();

    // Calculate days to subtract to get to Monday
    // getDay() returns: Sunday=0, Monday=1, Tuesday=2, ..., Saturday=6
    const daysToMonday = day === 0 ? 6 : day - 1; // If Sunday, go back 6 days, otherwise go back (day-1) days

    startOfWeek.setDate(startOfWeek.getDate() - daysToMonday);

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startOfWeek);
      weekDate.setDate(startOfWeek.getDate() + i);
      weekDates.push(weekDate);
    }

    return weekDates;
  };

  const weekDates = React.useMemo(() => getWeekDates(currentDate), [currentDate]);
  const dayNames = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nie"];

  // Use custom hook for fetching available reservations
  const { fetchAvailableReservations } = useAvailableReservations({
    onSuccess: setSlots,
    onError: setError,
    onLoading: setLoading,
  });

  // Fetch slots when service or week changes
  useEffect(() => {
    const startOfWeek = weekDates[0];
    const endOfWeek = weekDates[6];
    const now = new Date();

    // Don't query for dates more than 1 day in the past to avoid validation errors
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const queryStartDate = startOfWeek < yesterday ? yesterday : startOfWeek;

    fetchAvailableReservations({
      service_id: selectedService.service_id,
      start_ts: queryStartDate.toISOString(),
      end_ts: endOfWeek.toISOString(),
      limit: 50,
    });
  }, [selectedService.service_id, currentDate, fetchAvailableReservations, weekDates]);

  // Group slots by date and filter out past slots
  const slotsByDate = React.useMemo(() => {
    const grouped: Record<string, AvailableReservationViewModel[]> = {};
    const now = new Date();

    weekDates.forEach((date) => {
      const dateKey = date.toISOString().split("T")[0];
      grouped[dateKey] = [];
    });

    availableSlots.forEach((slot) => {
      const slotDate = new Date(slot.start_ts).toISOString().split("T")[0];
      const slotTime = new Date(slot.start_ts);

      // Only include slots that are in the future
      if (grouped[slotDate] && slotTime > now) {
        grouped[slotDate].push(slot);
      }
    });

    return grouped;
  }, [weekDates, availableSlots]);

  const handlePreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  // Auto-update calendar when month or year changes (but not on initial load)
  useEffect(() => {
    // Only update currentDate if month/year was actually changed by user
    // Don't update on initial component mount
    const today = new Date();
    if (selectedMonth !== today.getMonth() || selectedYear !== today.getFullYear()) {
      const newDate = new Date(selectedYear, selectedMonth, 1);
      setCurrentDate(newDate);
    }
  }, [selectedMonth, selectedYear]);

  const handleGoToToday = () => {
    setCurrentDate(new Date());
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const months = [
    "Styczeń",
    "Luty",
    "Marzec",
    "Kwiecień",
    "Maj",
    "Czerwiec",
    "Lipiec",
    "Sierpień",
    "Wrzesień",
    "Październik",
    "Listopad",
    "Grudzień",
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear + i);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Zmień usługę</span>
          </Button>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{selectedService.name}</h2>
            <p className="text-gray-600 text-sm">Czas trwania: {selectedService.duration_minutes} minut</p>
          </div>
        </div>
      </div>

      {/* Month/Year Selector */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
            {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
          </span>
          <Button variant="outline" size="sm" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleGoToToday} className="ml-2">
            Dzisiaj
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-4">
        {weekDates.map((date, index) => {
          const dateKey = date.toISOString().split("T")[0];
          const daySlots = slotsByDate[dateKey] || [];
          const hasSlots = daySlots.length > 0;
          const isSelectedDay = selectedDay === dateKey;
          const isPastDate = isPast(date);

          return (
            <div key={dateKey} className="min-h-[200px]">
              {/* Day Header */}
              <div
                className={`
                  p-3 text-center border rounded-t-lg cursor-pointer transition-colors
                  ${
                    isPastDate
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : hasSlots
                        ? isSelectedDay
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                        : "bg-gray-50 text-gray-500 border-gray-200"
                  }
                  ${isToday(date) && !isPastDate ? "ring-2 ring-blue-300" : ""}
                `}
                onClick={() => !isPastDate && hasSlots && onDaySelect(dateKey)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (!isPastDate && hasSlots) {
                      onDaySelect(dateKey);
                    }
                  }
                }}
                tabIndex={!isPastDate && hasSlots ? 0 : -1}
                role="button"
                aria-pressed={isSelectedDay}
                aria-disabled={isPastDate || !hasSlots}
              >
                <div className="text-xs font-medium">{dayNames[index]}</div>
                <div className="text-lg font-semibold">{date.getDate()}</div>
                {hasSlots && !isPastDate && (
                  <div className="text-xs mt-1">
                    {daySlots.length} {daySlots.length === 1 ? "termin" : "terminów"}
                  </div>
                )}
              </div>

              {/* Time Slots */}
              <div className="border-l border-r border-b rounded-b-lg min-h-[150px] p-2 bg-white">
                {isSelectedDay && hasSlots && !isPastDate ? (
                  <div className="space-y-2">
                    {daySlots.map((slot, slotIndex) => (
                      <Button
                        key={slotIndex}
                        variant="outline"
                        size="sm"
                        className="w-full text-xs justify-start hover:bg-blue-50 hover:border-blue-300"
                        onClick={() => onTimeSelect(slot)}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(slot.start_ts)}
                      </Button>
                    ))}
                  </div>
                ) : isPastDate ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-xs">Przeszłość</div>
                ) : !hasSlots ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-xs text-center">
                    Brak dostępnych terminów
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 text-xs text-center">
                    Kliknij aby zobaczyć godziny
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {Object.values(slotsByDate).every((slots) => slots.length === 0) && (
        <div className="mt-8">
          <EmptyStateMessage hasVehicles={true} hasFilters={false} />
        </div>
      )}
    </div>
  );
};

export default CalendarView;
