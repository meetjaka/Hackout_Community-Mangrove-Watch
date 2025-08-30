# Community Mangrove Watch - Frontend

A modern React-based frontend application for the Community Mangrove Watch participatory monitoring system. This application enables citizens, fishermen, and conservation communities to report threats to mangrove ecosystems and participate in conservation efforts.

## 🚀 Features

### Core Functionality
- **User Authentication & Management**: Secure login/registration with role-based access control
- **Incident Reporting**: Submit geotagged reports with media uploads
- **Dashboard & Analytics**: Real-time insights and statistics
- **Community Engagement**: Forums, resources, and community features
- **Gamification**: Points, badges, and leaderboards
- **Responsive Design**: Mobile-first approach with dark/light theme support

### User Roles
- **Citizen Scientist**: Report incidents and participate in conservation
- **NGO Admin**: Validate reports and manage organization data
- **Government Officer**: Enforcement and policy decision making
- **Researcher**: Access data for scientific analysis
- **Super Admin**: Full system control and management

## 🛠️ Technology Stack

### Frontend Framework
- **React 18**: Modern React with hooks and functional components
- **React Router DOM**: Client-side routing
- **Vite**: Fast build tool and development server

### State Management & Data Fetching
- **Zustand**: Lightweight state management
- **React Query**: Server state management and caching
- **Axios**: HTTP client for API communication

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful and consistent icons
- **Framer Motion**: Smooth animations and transitions
- **React Hook Form**: Performant forms with validation

### Additional Libraries
- **React Dropzone**: File upload handling
- **React Hot Toast**: Toast notifications
- **Date-fns**: Date manipulation utilities
- **Leaflet & React-Leaflet**: Interactive mapping (coming soon)

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Auth/           # Authentication components
│   ├── Layout/         # Layout and navigation
│   └── UI/             # Common UI elements
├── contexts/            # React contexts
│   ├── AuthContext.jsx # Authentication state
│   └── ThemeContext.jsx # Theme management
├── pages/               # Page components
│   ├── Auth/           # Authentication pages
│   ├── Dashboard/      # Dashboard pages
│   ├── Reports/        # Report management
│   ├── Community/      # Community features
│   ├── Gamification/   # Gamification system
│   ├── Profile/        # User profile
│   └── Admin/          # Admin features
├── services/            # API services
│   └── api.js          # API client and endpoints
├── App.jsx             # Main application component
├── index.css           # Global styles and Tailwind
└── main.jsx           # Application entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Backend server running (see backend README)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   # or
   yarn build
   ```

## 🔧 Configuration

### Tailwind CSS
The application uses Tailwind CSS with custom configuration:
- Custom color palette (primary, mangrove, success, warning, danger)
- Custom animations and transitions
- Responsive design utilities
- Dark mode support

### API Configuration
- Base URL configuration via environment variables
- Automatic token management
- Request/response interceptors
- Error handling and authentication

## 🎨 Design System

### Color Palette
- **Primary**: Blue tones for main actions and branding
- **Mangrove**: Green tones representing nature and conservation
- **Success**: Green tones for positive actions
- **Warning**: Yellow/orange tones for caution
- **Danger**: Red tones for errors and critical actions

### Typography
- **Inter**: Primary font for body text
- **Poppins**: Display font for headings and titles

### Components
- **Buttons**: Multiple variants (primary, secondary, success, warning, danger)
- **Cards**: Consistent card design with shadows and borders
- **Forms**: Styled form elements with validation states
- **Badges**: Status indicators and labels

## 📱 Responsive Design

The application is built with a mobile-first approach:
- Responsive grid layouts
- Mobile-optimized navigation
- Touch-friendly interactions
- Adaptive content sizing

## 🌙 Dark Mode

- Automatic theme detection based on system preferences
- Manual theme toggle
- Persistent theme storage
- Consistent theming across all components

## 🔐 Authentication

- JWT-based authentication
- Role-based access control
- Protected routes
- Automatic token refresh
- Secure password handling

## 📊 State Management

- **Zustand**: Client-side state (user preferences, UI state)
- **React Query**: Server state (API data, caching, synchronization)
- **Context API**: Global state (authentication, theme)

## 🚀 Performance Features

- Code splitting and lazy loading
- Optimized bundle size
- Efficient re-renders
- Image optimization
- Caching strategies

## 🧪 Development

### Code Style
- ESLint configuration for code quality
- Prettier for code formatting
- Consistent component structure
- TypeScript-ready (can be migrated later)

### Testing (Coming Soon)
- Unit tests with Jest
- Component tests with React Testing Library
- E2E tests with Playwright

## 📦 Build & Deployment

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deployment
The built application can be deployed to any static hosting service:
- Vercel
- Netlify
- AWS S3
- GitHub Pages

## 🔗 API Integration

The frontend integrates with the backend API through:
- RESTful API endpoints
- Real-time updates (coming soon)
- File upload handling
- Error handling and retry logic

## 🚧 Coming Soon

- **Interactive Maps**: Leaflet integration for incident visualization
- **Real-time Updates**: WebSocket integration for live data
- **Advanced Analytics**: Charts and data visualization
- **Mobile App**: React Native version
- **Offline Support**: Service worker and offline capabilities
- **Internationalization**: Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Updates

Stay updated with the latest changes:
- Follow the repository for updates
- Check the changelog
- Review release notes

---

**Community Mangrove Watch** - Empowering communities to protect mangrove ecosystems through participatory monitoring and citizen science.
