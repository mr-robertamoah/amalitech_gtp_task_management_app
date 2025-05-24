import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Team from './pages/Team';
import Project from './pages/Project';
import Navigation from './components/Navigation';
import AlertContainer from './components/AlertContainer';
import ProtectedTeamRoute from './components/ProtectedTeamRoute';
import { useSelector } from 'react-redux';
import './App.css';
import NotFound from './pages/NotFound';

function App() {
  const user = useSelector((state) => state.user.user);

  return (
    <Router>
      <div className="flex flex-col min-h-screen w-full">
        <Navigation />
        <AlertContainer />
        <div className="flex-grow w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={!user ? <Login /> : <Navigate to="/" replace />}
            />
            <Route
              path="/register"
              element={!user ? <Register /> : <Navigate to="/" replace />}
            />
            <Route path="/profile" element={<Profile />} />
            <Route 
                path="/team/:teamId" 
                element={
                  <ProtectedTeamRoute>
                    <Team />
                  </ProtectedTeamRoute>
                } 
              />
            <Route path="/project/:projectId" element={<Project />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
