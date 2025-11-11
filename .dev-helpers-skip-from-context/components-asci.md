src/pages/index.astro
├── HomeLayout.astro
│   └── components/ui/sonner.tsx (Toaster)
└── components/Welcome.astro
    └── assets/backgrounds/garage-pro.png

src/pages/reservations.astro
├── Layout.astro
│   ├── components/shared/Navigation.astro
│   │   ├── components/auth/AuthNav.tsx
│   │   │   └── components/ui/button.tsx
│   │   ├── components/shared/DarkModeToggle.tsx
│   │   └── lucide-react icons
│   └── components/ui/sonner.tsx (Toaster)
└── components/reservations/ReservationsView.tsx
    ├── components/reservations/ReservationsFilterPanel.tsx
    ├── components/reservations/ReservationsList.tsx
    │   └── components/reservations/ReservationListItem.tsx
    ├── components/shared/PaginationControls.tsx
    ├── components/reservations/LoadingIndicator.tsx
    ├── components/reservations/ErrorNotification.tsx
    ├── components/reservations/EmptyStateMessage.tsx
    └── components/reservations/hooks/useReservations.ts
        ├── types.ts
        └── constants.ts

src/pages/vehicles.astro
├── Layout.astro (patrz powyżej)
└── components/vehicles/VehiclesView.tsx
    ├── components/vehicles/VehiclesActionPanel.tsx
    ├── components/vehicles/VehiclesList.tsx
    │   └── components/vehicles/VehicleListItem.tsx
    ├── components/shared/PaginationControls.tsx
    ├── components/shared/LoadingIndicator.tsx
    ├── components/shared/ErrorNotification.tsx
    ├── components/vehicles/EmptyStateMessage.tsx
    ├── components/vehicles/DeleteConfirmationDialog.tsx
    │   └── components/ui/dialog.tsx
    ├── components/vehicles/hooks/useVehicles.ts
    ├── components/vehicles/hooks/useVehicleDelete.ts
    └── sonner (toast notifications)

src/pages/reservations/available.astro
└── components/reservations/available/ReservationsAvailableView.tsx
    ├── components/reservations/available/ActionButtons.tsx
    ├── components/reservations/available/BookingConfirmationForm.tsx
    ├── components/reservations/available/CalendarView.tsx
    ├── components/reservations/available/RecommendationSection.tsx
    ├── components/reservations/available/ReservationConfirmationView.tsx
    ├── components/reservations/available/ReservationDetailsCard.tsx
    ├── components/reservations/available/ServiceSelectionForm.tsx
    └── components/reservations/available/hooks/useAvailableReservations.ts

Komponenty współdzielone (src/components/shared/):
├── Navigation.astro
├── DarkModeToggle.tsx
├── ErrorNotification.tsx
├── LoadingIndicator.tsx
└── PaginationControls.tsx

Komponenty UI (src/components/ui/):
├── button.tsx
├── dialog.tsx
├── sonner.tsx
├── badge.tsx
├── avatar.tsx
├── skeleton.tsx
├── select.tsx
├── switch.tsx
└── pagination.tsx

Komponenty autoryzacji (src/components/auth/):
├── AuthNav.tsx
├── LoginForm.tsx
├── RegisterForm.tsx
├── ForgotPasswordForm.tsx
└── ResetPasswordForm.tsx

API Endpoints (src/pages/api/):
├── reservations.ts
│   └── lib/services/reservationService.ts
├── vehicles.ts
│   └── lib/services/vehicleService.ts
├── reservations/available.ts
├── auth/
│   ├── login.ts
│   ├── register.ts
│   ├── logout.ts
│   └── forgot-password.ts
└── services.ts

Warstwa usług (src/lib/services/):
├── reservationService.ts
├── vehicleService.ts
└── reservationAvailabilityService.ts

Hooki (src/components/*/hooks/):
├── reservations/hooks/
│   ├── useReservations.ts
│   └── useReservationDetail.ts
├── vehicles/hooks/
│   ├── useVehicles.ts
│   ├── useVehicleDelete.ts
│   └── useVehicleForm.ts
└── reservations/available/hooks/
    └── useAvailableReservations.ts

Middleware:
└── src/middleware/index.ts
    ├── db/supabase.client.ts
    └── lib/validation/

Baza danych i typy:
├── db/supabase.client.ts
├── db/database.types.ts
├── types.ts
└── lib/validation/
    ├── reservationSchema.ts
    └── vehicleSchema.ts