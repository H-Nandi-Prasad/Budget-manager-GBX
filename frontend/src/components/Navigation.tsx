import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { useState } from "react";

interface NavigationProps {
  onExpandChange: (expanded: boolean) => void;
}

export default function Navigation({ onExpandChange }: NavigationProps) {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onExpandChange(newExpanded);
  };

  return (
    <nav className={cn(
      "fixed left-0 top-0 h-full backdrop-blur-lg bg-slate-900/30 border-r border-white/20 transition-all duration-300 ease-in-out z-50 shadow-lg",
      isExpanded ? "w-64" : "w-16"
    )}>
      <div className="flex flex-col h-full">
        <div className="p-4 flex items-center justify-between">
          <button
            onClick={toggleExpand}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          {isExpanded && (
            <span 
              className="text-lg font-semibold text-white" 
              style={{ 
                textShadow: "0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.3), 0 0 30px rgba(255,255,255,0.2)",
                background: "linear-gradient(to right, #ffffff, #e2e8f0)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "0.5px"
              }}
            >
              Global Budget X
            </span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-2 p-2">
            <Link
              to="/"
              className={cn(
                "flex items-center p-2 rounded-lg transition-colors text-white",
                location.pathname === "/"
                  ? "bg-white/20 text-white"
                  : "hover:bg-white/10"
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="9" />
                <rect x="14" y="3" width="7" height="5" />
                <rect x="14" y="12" width="7" height="9" />
                <rect x="3" y="16" width="7" height="5" />
              </svg>
              {isExpanded && <span className="ml-3">Dashboard</span>}
            </Link>
            <Link
              to="/departments"
              className={cn(
                "flex items-center p-2 rounded-lg transition-colors text-white",
                location.pathname === "/departments"
                  ? "bg-white/20 text-white"
                  : "hover:bg-white/10"
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              {isExpanded && <span className="ml-3">Departments</span>}
            </Link>
            <Link
              to="/transactions"
              className={cn(
                "flex items-center p-2 rounded-lg transition-colors text-white",
                location.pathname === "/transactions"
                  ? "bg-white/20 text-white"
                  : "hover:bg-white/10"
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              {isExpanded && <span className="ml-3">Transactions</span>}
            </Link>
            <Link
              to="/reports"
              className={cn(
                "flex items-center p-2 rounded-lg transition-colors text-white",
                location.pathname === "/reports"
                  ? "bg-white/20 text-white"
                  : "hover:bg-white/10"
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 3v18h18" />
                <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
              </svg>
              {isExpanded && <span className="ml-3">Reports</span>}
            </Link>
            <Link
              to="/settings"
              className={cn(
                "flex items-center p-2 rounded-lg transition-colors text-white",
                location.pathname === "/settings"
                  ? "bg-white/20 text-white"
                  : "hover:bg-white/10"
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              {isExpanded && <span className="ml-3">Settings</span>}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 