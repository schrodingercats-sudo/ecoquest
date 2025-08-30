# Overview

Planet Heroes is a fully functional gamified environmental education web application designed to teach school students about sustainability through interactive mini-games. The platform features role-based access for students and teachers, with students earning points and badges through gameplay while teachers can monitor progress through analytics dashboards. The application uses a modern React-based frontend with Firebase for authentication and data persistence, creating an engaging educational experience that promotes environmental awareness.

## Current Status: COMPLETED ✅
- All three mini-games fully implemented (Waste Sorting, Water Saver, Plant Tree)  
- Complete authentication system with Google OAuth via Firebase
- Student portal with game selection, badge system, and progress tracking
- Teacher dashboard with analytics, charts, and CSV export functionality
- Global leaderboard with real-time updates
- Responsive design with smooth animations using Framer Motion
- Complete Firebase integration for user data and game scores

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The application uses a modern React-based frontend built with Vite for fast development and optimized builds. The UI is constructed using shadcn/ui components with Tailwind CSS for styling, providing a consistent and responsive design system. Framer Motion is integrated for smooth animations and transitions throughout the user experience.

**Key Design Decisions:**
- **Component-based architecture**: Modular React components for reusability and maintainability
- **Route-based navigation**: Using Wouter for client-side routing with separate portals for students and teachers
- **Responsive design**: Mobile-first approach with Tailwind CSS breakpoints
- **Animation system**: Framer Motion for engaging user interactions and game feedback

## Authentication & Authorization
Firebase Authentication provides secure user management with Google OAuth integration. The system implements role-based access control distinguishing between students and teachers, with different interfaces and permissions for each role.

**Authentication Flow:**
- Google OAuth for simplified sign-in process
- Automatic user profile creation in Firestore
- Role-based routing and component rendering
- Session persistence across browser refreshes

## Data Layer
Firestore serves as the primary database for user profiles, game scores, and educational content. The data model supports real-time updates for leaderboards and progress tracking.

**Database Collections:**
- `users`: Student and teacher profiles with points, badges, and metadata
- Game scores and progress tracking
- Real-time leaderboard data synchronization

## Game Engine
Custom HTML5 Canvas-based mini-games focus on environmental education themes including waste sorting, water conservation, and tree planting. Each game provides immediate feedback and educational content through eco-facts.

**Game Architecture:**
- Canvas-based rendering for interactive gameplay
- Modular game components for different environmental themes
- Score calculation and badge awarding system
- Educational content integration through modal overlays

## Backend Services
The application uses a hybrid architecture with a Node.js/Express server for potential API endpoints and static file serving, while leveraging Firebase for real-time data operations and authentication.

**Server Configuration:**
- Express.js server with Vite integration for development
- Static file serving for production builds
- API route structure for potential future backend operations
- Development-optimized hot reloading

# External Dependencies

## Core Technologies
- **React 18**: Frontend framework with hooks and modern patterns
- **Vite**: Build tool and development server for fast compilation
- **TypeScript**: Type safety and enhanced developer experience
- **Tailwind CSS**: Utility-first CSS framework for rapid styling

## UI Component Library
- **shadcn/ui**: Pre-built accessible components built on Radix UI
- **Radix UI**: Unstyled, accessible UI primitives
- **Lucide React**: Icon library for consistent iconography
- **Framer Motion**: Animation library for smooth transitions

## Authentication & Database
- **Firebase**: Authentication, Firestore database, and hosting platform
- **Google OAuth**: Simplified sign-in process through Firebase Auth

## Development Tools
- **Drizzle**: Database toolkit configured for PostgreSQL (fallback option)
- **Recharts**: Chart library for teacher analytics dashboards
- **React Query**: Server state management and caching

## Styling & Animation
- **Class Variance Authority**: Type-safe component variant management
- **clsx**: Conditional className utility
- **PostCSS**: CSS processing with Tailwind integration

## Game Development
- **HTML5 Canvas**: Native browser API for game rendering
- **Custom game engines**: Built specifically for environmental education themes