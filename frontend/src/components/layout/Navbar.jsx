import { Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useThemeStore } from "../../stores/themeStore";
import { LogOut, MessageSquare, Settings, User, Sun, Moon } from "lucide-react";
import RainbowHover from "../shared/RainbowHover";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <header
      className="glass-effect fixed w-full top-0 z-40 border-b border-base-content/10
    shadow-sm"
    >
      <div className="container mx-auto px-4 h-16 max-w-7xl">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 smooth-transition group">
              <div className="size-9 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:scale-110 smooth-transition shadow-lg">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold tracking-tight"><RainbowHover>Ripple</RainbowHover></h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="btn btn-sm btn-ghost gap-2 hover:bg-primary/10 smooth-transition ml-2"
              onClick={toggleTheme}
            >
              {theme === "dark" ? (
                <Sun className="size-5" />
              ) : (
                <Moon className="size-5" />
              )}
              <span className="hidden sm:inline font-medium">
                {theme === "dark" ? "Light" : "Dark"}
              </span>
            </button>

            <Link
              to={"/settings"}
              className="btn btn-sm btn-ghost gap-2 hover:bg-primary/10 smooth-transition"
            >
              <RainbowHover><Settings className="w-4 h-4" /></RainbowHover>
              <span className="hidden sm:inline font-medium"><RainbowHover>Settings</RainbowHover></span>
            </Link>

            {authUser && (
              <>
                <Link to={"/profile"} className="btn btn-sm btn-ghost gap-2 hover:bg-primary/10 smooth-transition">
                  <User className="size-5" />
                  <span className="hidden sm:inline font-medium">Profile</span>
                </Link>

                <button className="flex gap-2 items-center btn btn-sm btn-ghost hover:bg-error/10 hover:text-error smooth-transition" onClick={logout}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline font-medium">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
