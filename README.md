# Garage Pro

A web application for automotive workshops that enables customers to quickly find available appointment slots for basic car repairs and make reservations. The system also allows workshop staff to handle phone reservations through the same interface, with an admin panel for monthly scheduling of mechanics and workstations availability.

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
   git clone https://github.com/your-username/garage-pro.git
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

5. Open [http://localhost:4321](http://localhost:4321) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run astro` - Run Astro CLI commands
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier

## Project Scope

### MVP Features
- **Appointment Search**: Browse available time slots across all mechanics with service type filtering
- **Online Booking**: Customer booking form with inline validation for logged-in users
- **Reservation Management**: Full CRUD operations for customers and staff
- **Admin Panel**: Monthly scheduling of mechanics and workstation availability (unlocked on the 10th of each month)
- **AI-powered Maintenance Recommendations**: Suggestions based on repair history displayed after booking
- **KPI Dashboard**: Monthly cancellation reports for staff
- **Authentication & Authorization**: Role-based access (customers see only their bookings, staff sees all)

### Out of Scope (Future Versions)
- Dedicated workstations for specialized repairs
- Complex repairs requiring multiple mechanics
- Mobile applications
- External calendar integrations
- Push notifications, SMS, email notifications
- Recommendation accuracy monitoring
- Audit logs and change history
- Load testing beyond 2 concurrent users

## Project Status

This project is currently in **MVP development phase**. The core booking functionality is being implemented with focus on:
- Customer appointment booking workflow
- Staff reservation management
- Admin scheduling interface
- AI-powered maintenance recommendations

Success metrics:
- >50% of reservations made online
- Cancellation rates below established threshold
- Demo showcasing booking, editing, and cancellation scenarios

## License

MIT License - see LICENSE file for details
