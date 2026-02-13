import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import RouteErrorBoundary from './components/RouteErrorBoundary';
import { Loader2 } from 'lucide-react';

// ════════════════════════════════════════════════════════════
// LAZY LOADED PAGES (Code Splitting)
// ════════════════════════════════════════════════════════════

// Auth Pages (loaded immediately)
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';

// Password Reset Pages
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

// Lazy loaded pages (loaded on demand)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AddEntry = lazy(() => import('./pages/AddEntry'));
const Entries = lazy(() => import('./pages/Entries'));
const Goals = lazy(() => import('./pages/Goals'));
const Analytics = lazy(() => import('./pages/Analytics'));
const CreateGoal = lazy(() => import('./pages/CreateGoal'));
const GoalDetail = lazy(() => import('./pages/GoalDetail'));
const Challenges = lazy(() => import('./pages/Challenges'));
const AIChat = lazy(() => import('./pages/AIChat'));
const PomodoroTimer = lazy(() => import('./pages/PomodoroTimer'));
const CommunityFeed = lazy(() => import('./pages/CommunityFeed'));
const Teams = lazy(() => import('./pages/Teams'));
const TeamDetail = lazy(() => import('./pages/TeamDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const ExportData = lazy(() => import('./pages/ExportData'));

// ✅ Components
const InstallPWA = lazy(() => import('./components/InstallPWA'));

// ════════════════════════════════════════════════════════════
// LOADING COMPONENT
// ════════════════════════════════════════════════════════════

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// PROTECTED ROUTE
// ════════════════════════════════════════════════════════════

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// ════════════════════════════════════════════════════════════
// MAIN APP COMPONENT
// ════════════════════════════════════════════════════════════

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>

            {/* Toast Container */}
            <Toaster
              position="top-center"
              reverseOrder={false}
              gutter={8}
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  maxWidth: '500px'
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                  style: {
                    background: '#dcfce7',
                    color: '#166534',
                    border: '2px solid #10b981'
                  }
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                  style: {
                    background: '#fee2e2',
                    color: '#991b1b',
                    border: '2px solid #ef4444'
                  }
                },
                loading: {
                  style: {
                    background: '#dbeafe',
                    color: '#1e40af',
                    border: '2px solid #3b82f6'
                  }
                }
              }}
            />

            {/* ✅ Suspense wrapper for lazy loaded components */}
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                
                {/* Protected Routes - Each wrapped with RouteErrorBoundary for isolation */}
                <Route 
                  path="/dashboard" 
                  element={<ProtectedRoute><RouteErrorBoundary><Dashboard /></RouteErrorBoundary></ProtectedRoute>} 
                />
                <Route 
                  path="/add-entry" 
                  element={<ProtectedRoute><RouteErrorBoundary><AddEntry /></RouteErrorBoundary></ProtectedRoute>} 
                />
                <Route 
                  path="/entries" 
                  element={<ProtectedRoute><RouteErrorBoundary><Entries /></RouteErrorBoundary></ProtectedRoute>} 
                />
                <Route 
                  path="/goals" 
                  element={<ProtectedRoute><RouteErrorBoundary><Goals /></RouteErrorBoundary></ProtectedRoute>} 
                />
                <Route 
                  path="/analytics" 
                  element={<ProtectedRoute><RouteErrorBoundary><Analytics /></RouteErrorBoundary></ProtectedRoute>} 
                />
                <Route 
                  path="/create-goal" 
                  element={<ProtectedRoute><RouteErrorBoundary><CreateGoal /></RouteErrorBoundary></ProtectedRoute>} 
                />
                <Route 
                  path="/goals/:id" 
                  element={<ProtectedRoute><RouteErrorBoundary><GoalDetail /></RouteErrorBoundary></ProtectedRoute>} 
                />
                <Route 
                  path="/challenges" 
                  element={<ProtectedRoute><RouteErrorBoundary><Challenges /></RouteErrorBoundary></ProtectedRoute>} 
                />
                <Route 
                  path="/ai-chat" 
                  element={<ProtectedRoute><RouteErrorBoundary><AIChat /></RouteErrorBoundary></ProtectedRoute>} 
                />
                <Route 
                  path="/pomodoro" 
                  element={<ProtectedRoute><RouteErrorBoundary><PomodoroTimer /></RouteErrorBoundary></ProtectedRoute>} 
                />
                <Route 
                  path="/community" 
                  element={<ProtectedRoute><RouteErrorBoundary><CommunityFeed /></RouteErrorBoundary></ProtectedRoute>} 
                />
                <Route 
                  path="/teams" 
                  element={<ProtectedRoute><RouteErrorBoundary><Teams /></RouteErrorBoundary></ProtectedRoute>} 
                />
                <Route 
                  path="/teams/:id" 
                  element={<ProtectedRoute><RouteErrorBoundary><TeamDetail /></RouteErrorBoundary></ProtectedRoute>} 
                />
                <Route 
                  path="/profile" 
                  element={<ProtectedRoute><RouteErrorBoundary><Profile /></RouteErrorBoundary></ProtectedRoute>} 
                />
                <Route 
                  path="/export-data" 
                  element={<ProtectedRoute><RouteErrorBoundary><ExportData /></RouteErrorBoundary></ProtectedRoute>} 
                />
                
                {/* Catch All */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>

              {/* PWA Install Prompt */}
              <InstallPWA />
            </Suspense>

          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
