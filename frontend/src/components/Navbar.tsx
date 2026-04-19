import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Leaf, LogOut, User, Settings, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/explore", label: "Explore Species" },
    { to: "/map", label: "Map" },
    { to: "/report", label: "Report Sighting" },
  ];

  // Only show Dashboard and Admin if admin
  if (isAdmin) {
    navLinks.push({ to: "/dashboard", label: "Dashboard" });
    navLinks.push({ to: "/admin", label: "Admin" });
  }

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold shrink-0">
            <Leaf className="h-5 w-5" />
          </div>
          WildIntel
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === l.to
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
            >
              {l.label}
            </Link>
          ))}

          <div className="ml-4 pl-4 border-l flex items-center gap-3">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 border border-muted hover:border-primary transition-colors">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="" alt={user?.username} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs uppercase">
                        {user?.username?.slice(0, 2) || "UI"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none">{user?.username || "Admin"}</p>
                      <p className="text-xs leading-none text-muted-foreground capitalize">
                        {user?.role || "Admin"} Account
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={isAdmin ? "/admin" : "/report"} className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>{isAdmin ? "Admin Panel" : "Reports"}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onClick={() => logout()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild size="sm">
                  <Link to="/login" className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    <span>Login / Register</span>
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile toggle */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-b bg-background px-4 pb-4 space-y-1">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === l.to
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-2 mt-2 border-t">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-3 py-2 text-sm font-medium text-muted-foreground flex items-center gap-2 bg-muted/50 rounded-md">
                  <User className="h-4 w-4" />
                  {user?.username} ({user?.role})
                </div>
                <Button variant="outline" className="w-full justify-start text-destructive" onClick={() => { logout(); setOpen(false); }}>
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </Button>
              </div>
            ) : (
              <div className="pt-2">
                <Button variant="outline" asChild className="w-full">
                  <Link to="/login" onClick={() => setOpen(false)}>
                    Login / Register
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
