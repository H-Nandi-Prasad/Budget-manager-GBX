import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    console.log('Login - Auth state:', { isAuthenticated, isLoading });
    console.log('Login - Location state:', location.state);
    
    if (isAuthenticated && !isLoading) {
      const from = (location.state as any)?.from || "/";
      console.log('Login - Already authenticated, redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, location, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Login - Attempting login with email:', email);
      await login(email, password);
      const from = (location.state as any)?.from || "/";
      console.log('Login - Redirecting to:', from);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login - Error:', err);
      setError("Failed to login. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen min-w-screen relative">
      {/* Background with chart pattern */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900 to-black">
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 100 50" 
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full opacity-30"
        >
          {/* Grid background */}
          <rect width="100%" height="100%" fill="transparent" />
          <path d="M0,0 L100,0 M0,10 L100,10 M0,20 L100,20 M0,30 L100,30 M0,40 L100,40 M0,50 L100,50" 
                stroke="rgba(255,255,255,0.1)" strokeWidth="0.1" />
          <path d="M0,0 L0,50 M10,0 L10,50 M20,0 L20,50 M30,0 L30,50 M40,0 M50,0 L50,50 M60,0 L60,50 M70,0 L70,50 M80,0 L80,50 M90,0 L90,50 M100,0 L100,50" 
                stroke="rgba(255,255,255,0.1)" strokeWidth="0.1" />
          
          {/* Chart lines */}
          <polyline 
            points="0,35 10,25 20,40 30,20 40,30 50,15 60,35 70,25 80,40 90,20 100,30"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="0.8"
          />
          <polyline 
            points="0,25 10,35 20,20 30,40 40,25 50,35 60,15 70,35 80,20 90,30 100,20"
            fill="none"
            stroke="#22c55e"
            strokeWidth="0.6"
          />
        </svg>
      </div>
      
      {/* Glassy overlay */}
      <div 
        className="fixed inset-0"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
        }}
      />

      {/* Login container */}
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-full max-w-md p-8 rounded-xl bg-black/30 border border-white/10 relative">
          <div className="text-center">
            <div className="mx-auto h-40 w-40 relative">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <polygon 
                  points="100,10 190,50 190,150 100,190 10,150 10,50" 
                  fill="#1D4ED8" 
                  stroke="none"
                />
                <polygon 
                  points="100,40 155,65 155,135 100,160 45,135 45,65" 
                  fill="none" 
                  stroke="rgba(255,255,255,0.5)" 
                  strokeWidth="1.5"
                />
                <text x="35" y="110" fill="white" fontSize="60" fontWeight="bold" fontFamily="Arial, sans-serif">G</text>
                <text x="83" y="110" fill="white" fontSize="60" fontWeight="bold" fontFamily="Arial, sans-serif">B</text>
                <text x="133" y="110" fill="white" fontSize="60" fontWeight="bold" fontFamily="Arial, sans-serif">X</text>
              </svg>
            </div>
            <h1 className="text-3xl font-bold mt-4 text-white">GLOBALBUDGETX</h1>
            <p className="mt-2 text-sm text-blue-100">ENTERPRISE FINANCIAL PLANNING</p>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-lg w-full px-4 py-3 
                          border border-white/10 bg-white/5
                          text-white placeholder-blue-200/60
                          focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting || isLoading}
              />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-lg w-full px-4 py-3 
                          border border-white/10 bg-white/5
                          text-white placeholder-blue-200/60
                          focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting || isLoading}
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-3 rounded-lg
                        bg-blue-600 hover:bg-blue-700
                        text-white font-medium
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                        transition-colors duration-200
                        disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 