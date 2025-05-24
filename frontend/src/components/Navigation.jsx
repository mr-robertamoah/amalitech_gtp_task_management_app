import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/user/userSlice';
import { useNavigate } from 'react-router-dom';

export default function Navigation() {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
            <Link to="/team" className="hover:underline">Team</Link>
            <Link to="/project" className="hover:underline">Project</Link>
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
