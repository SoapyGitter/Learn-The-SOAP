import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function SplitLayout({ leftPane, rightPane, progressPct }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // If there's no leftPane content, we force it to be collapsed and hide the toggle
  const hasLeftPane = Boolean(leftPane);
  const effectivelyCollapsed = isCollapsed || !hasLeftPane;

  // The progress ring at the top of the Theory pane
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((progressPct || 0) / 100) * circumference;

  return (
    <div className="flex h-full w-full overflow-hidden bg-midnight-950 relative">
      {/* Left Pane (Theory) */}
      <div 
        className={`relative transition-all duration-300 ease-in-out border-r border-surface-elevated
                    bg-midnight-900/60 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] flex flex-col // Glassmorphism
                    ${effectivelyCollapsed ? 'w-0 opacity-0 overflow-hidden border-r-0' : 'w-[320px] md:w-[400px] xl:w-[480px] flex-shrink-0'}`}
      >
        <div className="absolute top-4 right-4 z-10 flex items-center justify-center">
          <div className="relative flex items-center justify-center w-10 h-10 bg-midnight-900/80 backdrop-blur-md rounded-full shadow-lg border border-surface-elevated">
            <svg className="w-10 h-10 transform -rotate-90">
              <circle
                className="text-midnight-700"
                strokeWidth="3"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="20"
                cy="20"
              />
              <circle
                className="text-neon transition-all duration-500 ease-out"
                strokeWidth="3"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="20"
                cy="20"
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-neon">
              {Math.round(progressPct || 0)}%
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar h-full relative">
          {leftPane}
        </div>
      </div>

      {/* Right Pane (Workspace) */}
      <div className="flex-1 h-full min-w-0 relative">
        {/* Collapse Toggle Button - Anchored to the edge of the right pane */}
        {hasLeftPane && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`absolute z-20 top-1/2 -translate-y-1/2 bg-surface-elevated border border-surface-elevated 
                        hover:bg-surface-raised text-gray-400 hover:text-white p-1 rounded-r-md shadow-md transition-all duration-300
                        ${isCollapsed ? 'left-0 rounded-l-none' : '-left-3 rounded-l-md hidden md:block'}`}
            style={!isCollapsed ? { left: '-14px' } : {}}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}

        {rightPane}
      </div>
    </div>
  );
}
