import React from "react";
import { getToken, saveToken , clearToken} from "../utils/auth";

export default function Navbar() {
  const [loggedIn, setLoggedIn] = React.useState(!!getToken());

  const handleLogout = () => {
  clearToken();// Clear token
    setLoggedIn(false);
    window.location.href = "/login"; 
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="text-xl font-bold text-blue-600 hover:text-blue-700">
              Froont
            </a>
          </div>

          {/* Links */}
          <div className="flex space-x-4 items-center">
            {!loggedIn ? (
              <>
                <a
                  href="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-white hover:bg-blue-600"
                >
                  Login
                </a>
                <a
                  href="/register"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-white hover:bg-blue-600"
                >
                  Register
                </a>
              </>
            ) : (
              <>
                <span className="text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  Logged in
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-white bg-red-500 hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
