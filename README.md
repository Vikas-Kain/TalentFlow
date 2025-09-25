# TalentFlow - Mini Hiring Platform

A modern, full-featured hiring platform built with React, TypeScript, and cutting-edge frontend technologies. TalentFlow provides a comprehensive solution for managing jobs, candidates, and assessments in a single, intuitive interface.

## Features

### Jobs Management
- **Drag-and-Drop Reordering**: Intuitive job list management with optimistic updates and rollback on errors
- **CRUD Operations**: Create, read, update, and archive jobs with real-time validation
- **Advanced Filtering**: Search by title, filter by status, and sort by various criteria
- **Pagination**: Efficient handling of large job lists with server-side pagination simulation

### Candidates Management
- **Kanban Board**: Visual candidate pipeline with drag-and-drop stage management (single view)
- **High-volume Data**: 1,000+ seeded candidates with client search and stage filtering
- **Detailed Profiles**: Comprehensive candidate information with timeline tracking
- **Notes System**: Add notes with @mentions (rendered) and local suggestions

### Assessment Builder
- **Live Preview**: Side-by-side builder and preview for real-time assessment creation
- **Multiple Question Types**: Single-choice, multi-choice, short text, long text, numeric (min/max), and a file upload stub
- **Drag-and-Drop**: Reorder sections and questions with visual feedback
- **Validation Rules**: Required fields, max length, numeric ranges enforced at runtime
- **Conditional Logic**: Show/hide questions based on prior answers (e.g. show QX if QY === "Yes")
- **Local Persistence**: Builder state and candidate responses are stored in IndexedDB (via MSW + Dexie)

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
6. Use the action buttons to view details, edit, or archive jobs

### Candidates Management
1. Go to the Candidates page to see all applicants (Kanban only)
2. Drag candidates between stages to update their status (optimistic with rollback)
3. Use the search bar to find specific candidates; filter by stage
4. Click on a candidate to view the profile, timeline, and add notes with @mentions

### Assessment Builder
1. Navigate to a job's assessment page (Jobs → View assessment)
2. Create sections and add questions (single, multi, text, long-text, numeric, file stub)
3. Configure validation (required, max length, numeric min/max) and optional conditional logic
4. Use the live preview to fill the form; Validate or Save (local) the responses
5. Click Save to persist the assessment definition to IndexedDB (through MSW)

## Configuration

### Environment Variables
The application uses environment variables for configuration:

```env
VITE_API_BASE_URL=/api
VITE_MSW_ENABLED=true
```

### Database Schema
The application uses IndexedDB with the following schema:

- **Jobs**: Job postings with metadata and ordering
- **Candidates**: Applicant information and current stage
- **Assessments**: Assessment definitions with sections and questions
- **Assessment Responses**: Candidate responses to assessments
- **Timeline Events**: Audit trail for candidate interactions

## Testing

The application includes comprehensive error handling and simulated network conditions:

- **Network Latency**: 200-1200ms delays simulate real API behavior
- **Error Simulation**: 5-10% chance of server errors on write operations
- **Optimistic Updates**: Instant UI updates with rollback on errors
- **Error Boundaries**: Graceful error handling with user-friendly messages

## Performance Optimizations

- **Virtual Scrolling**: Efficient rendering of large candidate lists
- **Query Caching**: Intelligent data caching with TanStack Query
- **Code Splitting**: Lazy loading of route components
- **Optimistic Updates**: Instant UI feedback for better UX
- **Debounced Search**: Efficient search with minimal API calls

## Future Enhancements

### Planned Features
- **Conditional Questions**: Full implementation of conditional logic in assessments
- **File Upload**: Complete file upload functionality for assessments
- **Email Integration**: Send emails to candidates directly from the platform
- **Analytics Dashboard**: Insights into hiring metrics and candidate flow
- **Bulk Operations**: Mass actions for candidates and jobs
- **Advanced Search**: Full-text search with filters and sorting
- **Export Functionality**: Export candidate data and assessment results

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