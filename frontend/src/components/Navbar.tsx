import { useNavigate } from "react-router-dom";
import { clearToken } from "../Utilities/auth";

export default function Navbar() {
  const navigate = useNavigate();

  function handleLogout() {
    clearToken();        // tokeni silmek için ekledib
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <nav className="mx-auto max-w-5xl h-14 px-4 flex items-center justify-between">
        <span className="font-semibold text-gray-900 select-none cursor-default">
          MyApp
        </span>
        <div className="flex items-center gap-4 text-sm">
          <button
            onClick={() => navigate("/protected")}
            className="text-gray-700 hover:text-gray-900"
          >
            Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
}
