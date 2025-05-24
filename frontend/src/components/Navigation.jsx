import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/user/userSlice';
import { useNavigate } from 'react-router-dom';

export default function Navigation() {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if current path is a team or project page
  const isTeamPage = location.pathname.includes('/team/');
  const isProjectPage = location.pathname.includes('/project/');

  const handleLogout = () => {
    dispatch(logout());
    navigate('/', { replace: true });
  };

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between sticky top-0 z-50 shadow-md">
      <div className="flex space-x-4">
        <Link to="/" className="hover:underline">Home</Link>
        {user && (
          <>
            <Link to="/profile" className="hover:underline">Profile</Link>
            
            {/* Only show Team label when on team pages */}
            {isTeamPage && (
              <span className="px-2 py-1 bg-gray-700 rounded cursor-default">Team</span>
            )}
            
            {/* Only show Project label when on project pages */}
            {isProjectPage && (
              <span className="px-2 py-1 bg-gray-700 rounded cursor-default">Project</span>
            )}
          </>
        )}
      </div>
      <div>
        {user ? (
          <button onClick={handleLogout} className="bg-red-600 px-3 py-1 rounded hover:bg-red-700">
            Logout
          </button>
        ) : (
          <>
            <Link to="/login" className="mr-4 hover:underline">Login</Link>
            <Link to="/register" className="hover:underline">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}