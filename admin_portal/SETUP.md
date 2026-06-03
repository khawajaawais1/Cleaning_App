# Happy2Clean Admin Portal - Setup Guide

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm 9+
- Angular CLI 17

### Installation Steps

1. **Install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm start
```
   Server will run on `http://localhost:4200`

3. **Build for production:**
```bash
npm run build
```
   Output will be in `dist/happy2clean-admin/`

## Project Structure Overview

```
happy2clean-admin/
├── src/
│   ├── app/
│   │   ├── core/                    # Core application logic
│   │   │   ├── models/              # Data models (User, Worker, Booking, etc)
│   │   │   ├── services/            # API services (Auth, Dashboard, Booking, etc)
│   │   │   ├── guards/              # Route protection (Auth guard)
│   │   │   └── interceptors/        # HTTP interceptors (JWT token injection)
│   │   │
│   │   ├── shared/                  # Shared across features
│   │   │   └── components/
│   │   │       ├── status-badge/    # Displays status with color coding
│   │   │       └── confirm-dialog/  # Confirmation dialog overlay
│   │   │
│   │   ├── layout/                  # Layout structure
│   │   │   └── admin-layout/        # Main layout with sidebar + header
│   │   │
│   │   ├── features/                # Feature modules
│   │   │   ├── login/               # Login page (full-page, centered)
│   │   │   ├── dashboard/           # Dashboard with stats and bookings
│   │   │   ├── worker-applications/ # Worker application management
│   │   │   ├── live-jobs/           # Real-time job tracking
│   │   │   ├── bookings/            # CRUD booking management
│   │   │   └── extension-requests/  # Worker extension request handling
│   │   │
│   │   ├── app.component.ts         # Root component
│   │   ├── app.config.ts            # App configuration & providers
│   │   └── app.routes.ts            # Route definitions
│   │
│   ├── environments/                # Environment configs
│   │   ├── environment.ts           # Development (local API)
│   │   └── environment.prod.ts      # Production (live API)
│   │
│   ├── index.html                   # HTML entry point
│   ├── main.ts                      # App bootstrap
│   └── styles.scss                  # Global styles
│
├── angular.json                     # Angular CLI configuration
├── tsconfig.json                    # TypeScript configuration
├── tsconfig.app.json               # TypeScript app-specific config
├── package.json                     # Dependencies and scripts
├── README.md                        # Full documentation
├── SETUP.md                         # This file
└── DEVELOPMENT.md                   # Development guidelines
```

## File Summary

Total Files Created: 50

### TypeScript Files (21)
- 6 Model files (User, Worker, Customer, Booking, LiveJob, ExtensionRequest)
- 6 Service files (Auth, Dashboard, Worker, Booking, LiveJob, ExtensionRequest)
- 1 Auth Guard
- 1 JWT Interceptor
- 7 Component TypeScript files (Login, Dashboard, WorkerApps, LiveJobs, Bookings, ExtensionReqs, AdminLayout)

### Template Files (7 HTML)
- Login component
- Dashboard component
- Worker Applications component
- Live Jobs component
- Bookings component
- Extension Requests component
- Admin Layout component

### Style Files (7 SCSS)
- Global styles
- Admin Layout styles
- Login styles
- Dashboard styles
- Worker Applications styles
- Live Jobs styles
- Bookings styles
- Extension Requests styles

### Configuration Files (6)
- angular.json - Angular workspace config
- tsconfig.json - TypeScript compiler options
- tsconfig.app.json - App-specific TypeScript config
- package.json - NPM dependencies
- environment.ts - Development environment
- environment.prod.ts - Production environment

### Other Files (2)
- index.html - HTML entry point
- main.ts - Application bootstrap

## Architecture Highlights

### Angular 17 Modern Features

**Standalone Components**
All components are standalone with explicit imports, no NgModules needed.

**Functional Routing**
Routes defined as arrays of Route objects with canActivate guards.

**Signals & Observables**
Uses RxJS Observables for state management and HTTP operations.

**Dependency Injection**
Constructor-based DI with proper typing.

**Change Detection**
Default strategy with OnPush optimization where applicable.

### Design System

**Color Palette**
- Primary: #10b981 (Emerald Green)
- Secondary: Grays and supporting colors
- Semantic: Success, Warning, Danger, Info

**Component Library**
- Buttons (primary, secondary, danger, ghost)
- Badges (various status colors)
- Tables with hover effects
- Forms with validation
- Cards with consistent styling
- Loading spinners and state indicators

**Responsive Design**
- Mobile-first approach
- Breakpoint at 768px
- Flexible grid layouts
- Touch-friendly buttons

## API Integration

### Base Configuration

Development: `http://localhost:5000/api`
Production: `https://api.happy2clean.com/api`

Configure in `src/environments/environment.ts`

### Authentication Flow

1. User submits login form
2. AuthService.login() sends POST to `/api/auth/login`
3. Backend returns JWT token + user info
4. Token stored in localStorage
5. JwtInterceptor adds `Authorization: Bearer <token>` header
6. Auth guard checks token for protected routes

### Demo Credentials

```
Email: admin@happy2clean.com
Password: password123
```

## Key Features Overview

### Login
- Full-page centered design
- Email + password fields
- Show/hide password toggle
- Form validation
- Error message display
- Demo credentials shown

### Dashboard
- 6 stat cards (Workers, Bookings, Jobs, Extensions, Revenue, Apps)
- Recent bookings table (last 5)
- Quick action buttons
- Loading and error states

### Worker Applications
- Filterable table by status
- Approve/Reject/Suspend/Restore actions
- Inline rejection reason dialog
- Worker avatar and details
- Rating display

### Live Jobs
- Auto-refresh every 30 seconds
- Job progress visualization
- Worker and customer details
- Time tracking (start, end, remaining)
- Status indicators
- Manual refresh button

### Booking Management
- CRUD operations
- Search and filter
- Pagination (10 per page)
- New booking modal form
- Customer and worker assignment
- Price and duration tracking

### Extension Requests
- Card-based layout
- Pending count badge
- Job progress bars
- Worker reason display
- Three actions: Ask, Deny, Allow
- Status tracking

## Development Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Build watch mode
npm run watch

# Angular CLI commands
ng generate component feature/my-component
ng generate service core/services/my-service
ng generate interface core/models/my-model
```

## Customization Guide

### Adding a New Feature

1. Create feature folder in `src/app/features/my-feature/`
2. Generate component: `ng generate component features/my-feature`
3. Create service: `ng generate service core/services/my-feature`
4. Add routes to `app.routes.ts`
5. Add navigation item to `admin-layout.component.ts`
6. Style with SCSS following BEM convention

### Styling Components

- Use component-scoped SCSS files
- Leverage CSS custom properties for colors
- Import global variables if needed
- Follow mobile-first responsive approach
- Use BEM naming: `.component-name__element--modifier`

### HTTP Requests

All HTTP calls go through services with proper error handling:

```typescript
this.service.getData()
  .pipe(takeUntilDestroyed())
  .subscribe({
    next: (data) => { /* handle success */ },
    error: (err) => { /* handle error */ }
  });
```

## Deployment

### Build & Deploy

1. Run production build:
```bash
npm run build
```

2. Deploy `dist/happy2clean-admin/` to your hosting:
   - Static hosting (Firebase, Netlify, Vercel)
   - Docker container
   - Cloud server (AWS, Azure, GCP)

### Environment Configuration

Update `src/environments/environment.prod.ts` with production API URL before building.

### Performance Optimization

- Build includes tree-shaking
- Code splitting for lazy-loaded routes
- CSS minification
- Asset optimization
- Source map generation (disable for production)

## Testing

The project structure supports testing:

- Unit tests: `component.spec.ts` files
- E2E tests: Cypress or Playwright
- Services can be tested with HttpTestingController

(Tests not yet implemented - add Jasmine/Karma for unit tests)

## Troubleshooting

### Port 4200 already in use
```bash
ng serve --port 4300
```

### Module not found errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors
Check `tsconfig.json` strict mode settings.

### API connection errors
Ensure backend is running on `http://localhost:5000`
Check browser console for CORS issues

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Security Best Practices

- JWT tokens stored in localStorage
- Consider httpOnly cookies for sensitive environments
- CORS configured on backend
- Input validation on all forms
- XSS protection via Angular's sanitization
- SQL injection protection on backend

## Performance Tips

- Use OnPush change detection where possible
- Implement trackBy in *ngFor loops
- Lazy load routes
- Unsubscribe from observables (takeUntilDestroyed)
- Use signals for reactive state

## Next Steps

1. Install dependencies: `npm install`
2. Start dev server: `npm start`
3. Open `http://localhost:4200`
4. Login with demo credentials
5. Explore each feature
6. Configure your backend API URL
7. Customize styling/colors as needed

## Support

For issues or questions:
1. Check README.md for detailed documentation
2. Review component comments and type definitions
3. Check browser console for errors
4. Verify API backend is running

---

Happy coding! Built with Angular 17
