# Planning Poker - Improvement TODO List

This document outlines recommended improvements for the Planning Poker application, organized by priority and category.

## 🔴 High Priority

### Testing & Quality Assurance
- [x] Add testing framework (Jest + React Testing Library)
- [ ] Write unit tests for core business logic (`roomStore.ts`, `strategies.ts`)
- [ ] Add integration tests for API endpoints
- [ ] Write E2E tests for critical user flows (create room, join, vote, reveal)
- [ ] Add test coverage reporting and set minimum coverage thresholds
- [ ] Set up pre-commit hooks with Husky for running tests and linting

### Security
- [ ] Implement rate limiting on API endpoints to prevent abuse
- [ ] Add CSRF protection for API routes
- [ ] Improve room ID generation to prevent brute-force attacks (consider longer IDs or additional security)
- [ ] Add input validation and sanitization for all user inputs
- [ ] Implement Content Security Policy (CSP) headers
- [ ] Add security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- [ ] Sanitize participant names to prevent XSS attacks
- [ ] Add room password/PIN option for private sessions

### Production Readiness
- [ ] Replace in-memory storage with persistent datastore (Redis for sessions, PostgreSQL for data)
- [ ] Implement proper database migrations
- [ ] Add environment variable configuration (`.env.example` file)
- [ ] Implement proper error logging and monitoring (e.g., Sentry)
- [ ] Add health check endpoint (`/api/health`)
- [ ] Implement graceful shutdown handling
- [ ] Add structured logging with different log levels

## 🟡 Medium Priority

### Performance & Scalability
- [ ] Replace polling with WebSocket connections for real-time updates
- [ ] Implement proper caching strategy (cache room state with appropriate TTL)
- [ ] Add Redis pub/sub for multi-instance synchronization
- [ ] Optimize bundle size (analyze with webpack-bundle-analyzer)
- [ ] Implement code splitting for better initial load times
- [ ] Add service worker for offline support and caching
- [ ] Optimize re-renders in room-client.tsx component

### Code Quality & Maintainability
- [ ] Refactor large `room-client.tsx` (811 lines) into smaller, reusable components:
  - [ ] Extract voting cards component
  - [ ] Extract participant list component
  - [ ] Extract room header component
  - [ ] Extract vote summary component
- [ ] Add JSDoc comments to all public functions
- [ ] Create custom hooks for reusable logic (useRoomPolling, useParticipant, etc.)
- [ ] Implement error boundaries for React components
- [ ] Add TypeScript strict mode and fix any issues
- [ ] Standardize error handling patterns across API routes
- [ ] Extract magic numbers and strings into constants
- [ ] Implement a centralized API client utility

### Architecture
- [ ] Add repository pattern for data access layer
- [ ] Implement dependency injection for better testability
- [ ] Add API versioning strategy (e.g., `/api/v1/rooms`)
- [ ] Create a middleware layer for common API logic (auth, validation, error handling)
- [ ] Implement event sourcing for room state changes (audit log)
- [ ] Add proper separation of concerns (controllers, services, repositories)

### DevOps & Deployment
- [ ] Create Dockerfile for containerization
- [ ] Add docker-compose.yml for local development
- [ ] Set up CI/CD pipeline (GitHub Actions):
  - [ ] Run tests on PR
  - [ ] Run linting and type checking
  - [ ] Build and deploy on merge to main
- [ ] Add deployment documentation for Vercel/AWS/Docker
- [ ] Implement automated database backups
- [ ] Add infrastructure as code (Terraform/CloudFormation)
- [ ] Set up staging environment

## 🟢 Low Priority

### Features & Enhancements
- [ ] Add room expiration and automatic cleanup mechanism
- [ ] Implement participant limit per room (configurable)
- [ ] Add custom estimation scales (allow users to define their own values)
- [ ] Implement room history and session persistence
- [ ] Add export functionality (CSV/PDF) for estimation results
- [ ] Add analytics and metrics tracking
- [ ] Implement room settings (timer, voting rules, etc.)
- [ ] Add moderator role with special permissions
- [ ] Implement participant removal by moderator
- [ ] Add voting timer/countdown feature
- [ ] Support multiple concurrent estimation rounds
- [ ] Add room templates for common estimation scenarios
- [ ] Implement room cloning functionality
- [ ] Add integration with issue trackers (Jira, GitHub, Linear)

### UX & Accessibility
- [ ] Add loading skeleton screens instead of basic loading states
- [ ] Implement comprehensive keyboard navigation
- [ ] Add ARIA labels and roles for screen readers
- [ ] Conduct accessibility audit (WCAG 2.1 AA compliance)
- [ ] Add light mode theme toggle
- [ ] Improve mobile responsiveness and touch interactions
- [ ] Add animations and transitions for better UX
- [ ] Implement toast notifications instead of info messages
- [ ] Add participant avatars (Gravatar or custom uploads)
- [ ] Add sound effects for key events (optional, toggleable)
- [ ] Implement drag-and-drop for reordering participants
- [ ] Add hotkeys/shortcuts documentation modal

### Documentation
- [ ] Create comprehensive API documentation (OpenAPI/Swagger)
- [ ] Add architecture diagrams (C4 model or similar)
- [ ] Write contribution guidelines (CONTRIBUTING.md)
- [ ] Create changelog (CHANGELOG.md)
- [ ] Add ADRs (Architecture Decision Records) for major decisions
- [ ] Document deployment procedures
- [ ] Create user guide/help documentation
- [ ] Add code comments explaining complex logic
- [ ] Create development setup guide

### Developer Experience
- [ ] Add Storybook for component development
- [ ] Implement snapshot testing for components
- [ ] Add git hooks for conventional commits
- [ ] Create development scripts (seed data, reset database)
- [ ] Add debug logging in development mode
- [ ] Implement feature flags system
- [ ] Add mock API mode for frontend development

### Monitoring & Observability
- [ ] Implement application performance monitoring (APM)
- [ ] Add user analytics (privacy-respecting)
- [ ] Create admin dashboard for monitoring active rooms
- [ ] Add metrics for room usage, participant engagement
- [ ] Implement alerting for errors and anomalies
- [ ] Add distributed tracing for API requests

### Dependencies & Tooling
- [ ] Add dependency vulnerability scanning (Dependabot, Snyk)
- [ ] Implement automated dependency updates
- [ ] Add bundle size monitoring
- [ ] Configure absolute imports with path aliases
- [ ] Add Prettier for code formatting
- [ ] Consider adding Zod for runtime type validation

## 📋 Bug Fixes & Edge Cases

- [ ] Handle race conditions in auto-reveal logic
- [ ] Fix potential memory leaks in polling useEffect
- [ ] Handle network failures gracefully with retry logic
- [ ] Add proper cleanup when participant leaves during polling
- [ ] Handle browser tab close/refresh (beforeunload event)
- [ ] Fix recursive potential in `generateReadableId()` (add max retry limit)
- [ ] Validate room ID format consistently across all endpoints
- [ ] Handle edge case where all participants leave a room
- [ ] Add timeout for idle rooms to prevent memory leaks
- [ ] Fix potential state inconsistencies when multiple users act simultaneously

## 🔧 Technical Debt

- [ ] Remove unused dependencies (audit package.json)
- [ ] Update to latest stable versions of dependencies
- [ ] Migrate from class-based to function-based error handling where applicable
- [ ] Remove any console.log statements (replace with proper logging)
- [ ] Standardize naming conventions across codebase
- [ ] Remove duplicate code and extract into shared utilities
- [ ] Clean up commented-out code
- [ ] Fix TypeScript `any` types where present

## 📊 Metrics to Track

Once improvements are implemented, track:
- Test coverage percentage (target: >80%)
- Bundle size (target: <200KB initial load)
- Lighthouse score (target: >90 in all categories)
- API response times (target: <100ms p95)
- Error rates (target: <0.1%)
- Active rooms and participants
- User engagement metrics

---

## Notes

- **Priority levels** indicate recommended implementation order
- Items can be re-prioritized based on business needs
- Some items may be dependent on others (e.g., database setup before room persistence)
- Consider creating GitHub issues for individual items for better tracking
- Review and update this TODO list regularly as items are completed

**Last Updated**: 2025-11-03
