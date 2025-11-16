# Garage Pro

A web application for automotive workshops that enables customers to quickly find available reservations (appointment slots), make reservations, and manage vehicles (CRUD). Additionally, the application is powered by AI that provides extra ideas on how to best take care of your vehicle. 

## Tech Stack

### Frontend
- **Astro 5** - Fast, content-focused web framework
- **React 19** - Interactive components where needed
- **TypeScript 5** - Static typing and better IDE support
- **Tailwind 4** - Utility-first CSS framework
- **Shadcn/ui** - Accessible React component library

### Backend
- **Supabase** - Open source Firebase alternative
  - PostgreSQL database
  - Built-in authentication
  - SDK for multiple languages

### AI
- **Openrouter.ai** - Access to various AI models (OpenAI, Anthropic, Google, etc.) for maintenance recommendations

### Testing
- **Vitest** - Modern testing framework with native TypeScript support for unit tests
- **React Testing Library** - Testing utilities for React 19 components
- **@testing-library/user-event** - User interaction simulation for component testing
- **@astro/test** - Dedicated testing tools for Astro components
- **Playwright** - Cross-browser end-to-end testing (Chrome, Firefox, Safari, Edge)
- **MSW (Mock Service Worker)** - API mocking at network level
- **Storybook + Chromatic** - Visual regression testing and component documentation

### CI/CD & Hosting
- **GitHub Actions** - CI/CD pipelines
- **DigitalOcean** - Hosting via Docker containers

## Getting Started Locally

### Prerequisites
- Node.js 22.14.0 (use nvm: `nvm use`)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/tomaszsz-it/garage-pro.git
   cd garage-pro
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Supabase:
   - Create a Supabase project
   - Configure environment variables (see `.env.example` if available)
   - Run database migrations

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open https://garage-pro.pages.dev in your browser
   or http://localhost:3000 for local execution

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run astro` - Run Astro CLI commands
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
### Testing Scripts
- `npm run test` - Run unit tests with Vitest
- `npm run test:ui` - Run tests with Vitest UI
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests with Playwright
- `npm run test:e2e:ui` - Run E2E tests with Playwright UI
- `npm run storybook` - Start Storybook development server
- `npm run build-storybook` - Build Storybook for production

## Project Scope

### MVP Features
- **Appointment Search**: Browse available reservations across all mechanics with service type filtering
- **Online Booking**: Customer booking form with inline validation for logged-in users
- **Reservation Management**: Reservation's operations for customers
- **Vehicle Management**: CRUD operations
- **AI-powered Maintenance Recommendations**: Suggestions based on repair history displayed after booking
- **Authentication & Authorization**: Role-based access (customers see only their bookings, staff sees all)
- **Unlogged user**: User without login can search available reservations

### Out of Scope (Future Versions)
- Dedicated workstations for specialized repairs
- Complex repairs requiring multiple mechanics
- Admin Panel: Monthly scheduling of mechanics and workstation availability (unlocked on the 10th of each month)
- Mobile applications
- KPI Dashboard: Monthly cancellation reports for staff
- External calendar integrations
- Push notifications, SMS, email notifications
- Recommendation accuracy monitoring
- Audit logs and change history

Success metrics:
- >50% of reservations made online
- Booking Cancellation rates below established threshold
- Demo showcasing booking, editing, and cancellation scenarios
