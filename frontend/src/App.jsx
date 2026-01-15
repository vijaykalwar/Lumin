import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';
// Pages
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddEntry from './pages/AddEntry';
import Entries from './pages/Entries';
import Goals from './pages/Goals';
import Analytics from './pages/Analytics';
import CreateGoal from './pages/CreateGoal';
import GoalDetail from './pages/GoalDetail';
import Challenges from './pages/Challenges';
import AIChat from './pages/AIChat';
import PomodoroTimer from './pages/PomodoroTimer';
import CommunityFeed from './pages/CommunityFeed';
import Teams from './pages/Teams';
import TeamDetail from './pages/TeamDetail';
import Profile from './pages/Profile';
import InstallPWA from './components/InstallPWA'; 
// Protected Route
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>

        {/* 🆕 Toast Container */}
          <Toaster
            position="top-center"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              // Default options
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                padding: '16px',
                borderRadius: '12px',
                fontSize: '14px',
                maxWidth: '500px'
              },
              // Success toast
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
              // Error toast
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
              // Loading toast
              loading: {
                style: {
                  background: '#dbeafe',
                  color: '#1e40af',
                  border: '2px solid #3b82f6'
                }
              }
            }}
          />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/add-entry" 
            element={<ProtectedRoute><AddEntry /></ProtectedRoute>} 
          />
          <Route 
            path="/entries" 
            element={<ProtectedRoute><Entries /></ProtectedRoute>} 
          />
          <Route 
            path="/goals" 
            element={<ProtectedRoute><Goals /></ProtectedRoute>} 
          />
          
          <Route 
           path="/analytics" 
           element={<ProtectedRoute><Analytics /></ProtectedRoute>} 
          />
          <Route 
  path="/add-goal" 
  element={<ProtectedRoute><CreateGoal /></ProtectedRoute>} 
/>

          <Route 
            path="/create-goal" 
            element={<ProtectedRoute><CreateGoal /></ProtectedRoute>} 
          />
          <Route 
             path="/goals/:id" 
             element={<ProtectedRoute><GoalDetail /></ProtectedRoute>} 
          />
          <Route 
            path="/challenges" 
            element={<ProtectedRoute><Challenges /></ProtectedRoute>} 
          />
          <Route 
            path="/ai-chat" 
            element={<ProtectedRoute><AIChat /></ProtectedRoute>} 
          />
          <Route 
            path="/pomodoro" 
            element={<ProtectedRoute><PomodoroTimer /></ProtectedRoute>} 
          />    
          <Route 
          path="/community" 
          element={<ProtectedRoute><CommunityFeed /></ProtectedRoute>} 
          />
          <Route 
          path="/teams" 
          element={<ProtectedRoute><Teams /></ProtectedRoute>} 
          />
          <Route 
          path="/teams/:id" 
         element={<ProtectedRoute><TeamDetail /></ProtectedRoute>} 
          />
          <Route
            path="/profile"
            element={
          <ProtectedRoute>
         <Profile />
         </ProtectedRoute>
          }
        />
        </Routes>
        <InstallPWA />

      </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
