import React, { useState, useEffect } from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Menu, X, LogIn, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
const NavBar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    const checkAuthStatus = async () => {
      const {
        data
      } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };
    checkAuthStatus();
    const {
      data: authListener
    } = supabase.auth.onAuthStateChange(event => {
      if (event === 'SIGNED_IN') {
        setIsLoggedIn(true);
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
      }
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
    }
    setMobileMenuOpen(false);
  };
  return <>
      <header className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-6 md:px-10", isScrolled ? "py-3 glass-effect shadow-subtle" : "py-4 sm:py-6 bg-transparent")}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center transition-opacity hover:opacity-80">
            <img alt="WayToPoint Logo" className="h-8 sm:h-10 mr-2" src="/lovable-uploads/9c9ecc20-aa31-4cfb-8642-b9430ae12999.png" />
            <span className="text-xl font-medium tracking-tight my-0 px-0 py-0 mx-0">WayToPoint</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {["Features", "Gallery", "About", "Contact"].map(item => <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground" onClick={e => handleNavClick(e, item.toLowerCase())}>
                {item}
              </a>)}
            
            {isLoggedIn ? <div className="flex items-center space-x-4">
                <Link to="/dashboard">
                  <Button variant="outline" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Button>
                </Link>
              </div> : <Link to="/auth">
                <Button variant="outline" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Button>
              </Link>}
          </nav>

          <button className="md:hidden focus:outline-none" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            {mobileMenuOpen ? <X className="h-6 w-6 text-foreground" /> : <Menu className="h-6 w-6 text-foreground" />}
          </button>
        </div>

        <div className={cn("absolute top-full left-0 right-0 glass-effect shadow-md md:hidden transition-all duration-300 ease-in-out overflow-hidden", mobileMenuOpen ? "max-h-96 py-4" : "max-h-0 py-0")}>
          <nav className="flex flex-col space-y-4 px-4">
            {["Features", "Gallery", "About", "Contact"].map(item => <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-foreground/80 py-2 transition-colors hover:text-foreground" onClick={e => {
            handleNavClick(e, item.toLowerCase());
            setMobileMenuOpen(false);
          }}>
                {item}
              </a>)}
            
            {isLoggedIn ? <Link to="/dashboard" className="text-sm font-medium py-2 flex items-center gap-2 text-primary" onClick={() => setMobileMenuOpen(false)}>
                <User className="h-4 w-4" />
                <span>Dashboard</span>
              </Link> : <Link to="/auth" className="text-sm font-medium py-2 flex items-center gap-2 text-primary" onClick={() => setMobileMenuOpen(false)}>
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </Link>}
          </nav>
        </div>
      </header>
      <main className="pt-16 sm:pt-20">
        <Outlet />
      </main>
    </>;
};
export default NavBar;