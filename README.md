# TalentFlow - Mini Hiring Platform

A modern, full-featured hiring platform built with React, TypeScript, and cutting-edge frontend technologies. TalentFlow provides a comprehensive solution for managing jobs, candidates, and assessments in a single, intuitive interface.

## Features

### Jobs Management
- **Drag-and-Drop Reordering**: Intuitive job list management with optimistic updates and rollback on errors
- **CRUD Operations**: Create, read, update, and archive jobs with real-time validation
- **Advanced Filtering**: Search by title, filter by status, and sort by various criteria
- **Pagination**: Efficient handling of large job lists with server-side pagination simulation
- **Job-Specific Features**: Each job has its own candidates kanban board and assessment builder
- **Activate/Archive**: Toggle job status directly from job detail pages

### Candidates Management
- **Dual View System**: Switch between Kanban board and virtualized list views
- **High-Performance List**: Virtualized rendering for 1000+ candidates with TanStack Virtual
- **Kanban Board**: Visual candidate pipeline with drag-and-drop stage management
- **Global & Job-Specific Views**: Access all candidates or filter by specific job
- **Advanced Filtering**: Server-side stage filtering and client-side search
- **Detailed Profiles**: Comprehensive candidate information with timeline tracking
- **Notes System**: Add notes with @mentions (highlighted and rendered)
- **Timeline Tracking**: Complete audit trail of candidate interactions and stage changes

### Assessment Builder
- **Live Preview**: Side-by-side builder and preview for real-time assessment creation
- **Multiple Question Types**: Single-choice, multi-choice, short text, long text, numeric (min/max), and file upload stub
- **Drag-and-Drop**: Reorder sections and questions with visual feedback
- **Validation Rules**: Required fields, max length, numeric ranges enforced at runtime
- **Conditional Logic**: Show/hide questions based on prior answers
- **Local Persistence**: Builder state and candidate responses stored in IndexedDB
- **Job-Specific**: Each job has its own assessment builder

## 🛠 Technology Stack

### Core Framework
- **React 18+**: Modern React with hooks and concurrent features
- **TypeScript**: Full type safety and enhanced developer experience
- **Vite**: Lightning-fast build tool and development server

### State Management
- **TanStack Query (React Query)**: Powerful data fetching, caching, and synchronization
- **Zustand**: Lightweight global state management for UI state

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Headless UI**: Accessible, unstyled UI components
- **Heroicons**: Beautiful SVG icons

### Data & API
- **Mock Service Worker (MSW)**: API mocking with realistic network simulation
- **Dexie.js**: IndexedDB wrapper for local data persistence
- **React Hook Form**: Performant forms with easy validation
- **Zod**: TypeScript-first schema validation

### Advanced Features
- **dnd-kit**: Modern, accessible drag-and-drop functionality
- **TanStack Virtual**: Efficient virtualization for large lists
- **React Router v6**: Declarative routing with nested routes
- **React Hot Toast**: Beautiful toast notifications

## 🏗 Architecture & Technical Decisions

### Application Structure
The application follows a feature-based architecture with clear separation of concerns:

```
src/
├── api/                    # Data layer (MSW + Dexie)
│   ├── db.ts              # Database schema and seeding
│   ├── handlers.ts        # MSW API handlers
│   └── msw-browser.ts     # MSW browser setup
├── components/            # Shared UI components
│   ├── Layout.tsx         # Main application layout
│   ├── ErrorBoundary.tsx  # Error handling
│   └── LoadingSkeleton.tsx # Loading states
├── features/              # Feature-specific components
│   ├── jobs/              # Job management components
│   ├── candidates/        # Candidate management components
│   └── assessments/       # Assessment builder components
├── pages/                 # Top-level page components
│   ├── JobsPage.tsx       # Jobs listing and management
│   ├── JobDetailPage.tsx  # Individual job details
│   ├── CandidatesPage.tsx # Global candidates view
│   ├── JobCandidatesPage.tsx # Job-specific candidates
│   ├── CandidateProfilePage.tsx # Individual candidate profile
│   └── AssessmentPage.tsx # Assessment builder
├── lib/                   # Utilities and API client
│   └── api.ts            # Centralized API functions
└── store/                # Global state management
    └── ui.ts             # UI state (Zustand)
```

### Routing Structure
- `/` → Redirects to `/jobs`
- `/jobs` → Jobs listing page
- `/jobs/:jobId` → Job detail page with Assessment and Candidates buttons
- `/jobs/:jobId/assessment` → Job-specific assessment builder
- `/jobs/:jobId/candidates` → Job-specific candidates kanban
- `/candidates` → Global candidates page (Kanban/List toggle)
- `/candidates/:candidateId` → Individual candidate profile

### Why These Technologies?

**TanStack Query**: Chosen for its robust caching, optimistic updates, and error handling capabilities. Essential for the drag-and-drop reordering feature where we need instant UI updates with rollback on server errors.

**MSW + Dexie.js**: Provides a realistic development experience with persistent data. MSW simulates real API behavior including network latency and error conditions, while Dexie ensures data persists across page refreshes.

**dnd-kit**: Selected over react-beautiful-dnd for its modern API, better accessibility, and TypeScript support. Provides smooth drag-and-drop experiences across all features.

**TanStack Virtual**: Enables efficient rendering of 1000+ candidates without performance degradation. Critical for maintaining smooth user experience with large datasets.

**Zustand**: Lightweight alternative to Redux for simple global state. Perfect for managing modal visibility and UI state without the complexity of Redux.

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd talentflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to see the application.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## Usage

### Jobs Management
1. Navigate to the Jobs page to view all available positions
2. Use the search bar to find specific jobs
3. Filter by status (Active/Archived) or sort by different criteria
4. Drag and drop jobs to reorder them
5. Click "New Job" to create a new position
6. Click on any job to view details, assessment builder, and candidates
7. Use Activate/Archive buttons on job detail pages to change status

### Candidates Management
1. **Global View**: Go to the Candidates page to see all applicants
2. **Job-Specific View**: Navigate to Jobs → [Job] → Candidates for job-specific candidates
3. **View Toggle**: Switch between Kanban board and virtualized list views
4. **Filtering**: Use stage dropdown for server-side filtering, search bar for client-side search
5. **Drag & Drop**: Drag candidates between stages to update their status (optimistic with rollback)
6. **Candidate Profiles**: Click on any candidate to view detailed profile with timeline
7. **Notes & Mentions**: Add notes with @mentions that are highlighted and rendered
8. **Timeline**: View complete audit trail of candidate interactions and stage changes

### Assessment Builder
1. Navigate to a job's assessment page (Jobs → [Job] → Assessment)
2. Create sections and add questions (single, multi, text, long-text, numeric, file stub)
3. Configure validation (required, max length, numeric min/max) and conditional logic
4. Use drag-and-drop to reorder sections and questions
5. Use the live preview to test the assessment
6. Click Save to persist the assessment definition to IndexedDB

## Configuration

### Environment Variables
The application uses environment variables for configuration:

```env
VITE_API_BASE_URL=/api
VITE_MSW_ENABLED=true
```

### Database Schema
The application uses IndexedDB with the following schema:

- **Jobs**: Job postings with metadata, ordering, and status
- **Candidates**: Applicant information, current stage, and job association
- **Assessments**: Assessment definitions with sections and questions (job-specific)
- **Assessment Responses**: Candidate responses to assessments
- **Timeline Events**: Complete audit trail for candidate interactions and stage changes
- **Notes**: Candidate notes with @mentions and metadata

## Testing

The application includes comprehensive error handling and simulated network conditions:

- **Network Latency**: 200-1200ms delays simulate real API behavior
- **Error Simulation**: 5-10% chance of server errors on write operations
- **Optimistic Updates**: Instant UI updates with rollback on errors
- **Error Boundaries**: Graceful error handling with user-friendly messages

## Performance Optimizations

- **Virtual Scrolling**: Efficient rendering of 1000+ candidates with TanStack Virtual
- **Query Caching**: Intelligent data caching with TanStack Query
- **Code Splitting**: Lazy loading of route components
- **Optimistic Updates**: Instant UI feedback for better UX with rollback on errors
- **Dual Search Strategy**: Server-side filtering for stages, client-side for names/emails
- **Efficient Re-renders**: Minimal re-renders with proper React Query cache invalidation
- **Drag & Drop Performance**: Smooth interactions with dnd-kit and optimistic updates

## Future Enhancements

### Planned Features
- **Advanced Conditional Logic**: Enhanced conditional questions in assessments
- **File Upload**: Complete file upload functionality for assessments
- **Email Integration**: Send emails to candidates directly from the platform
- **Analytics Dashboard**: Insights into hiring metrics and candidate flow
- **Bulk Operations**: Mass actions for candidates and jobs
- **Advanced Search**: Full-text search with filters and sorting
- **Export Functionality**: Export candidate data and assessment results
- **Real-time Collaboration**: Multiple users working on the same candidate
- **Advanced Timeline**: Rich timeline with file attachments and comments
- **Assessment Analytics**: Detailed insights into assessment performance

### Technical Improvements
- **Unit Testing**: Comprehensive test coverage with Jest and React Testing Library
- **E2E Testing**: End-to-end tests with Playwright
- **Performance Monitoring**: Real-time performance metrics
- **Accessibility**: Enhanced WCAG compliance
- **PWA Features**: Offline support and mobile app capabilities

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with modern React patterns and best practices
- Inspired by leading hiring platforms and ATS systems
- Uses cutting-edge frontend technologies for optimal performance
- Designed with accessibility and user experience in mind

---

**TalentFlow** - Streamlining the hiring process with modern technology and intuitive design.