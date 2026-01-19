
import React, { useEffect } from 'react';
import { Toolbar } from './components/Toolbar';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { Canvas } from './components/Canvas';
import { useStore } from './store';

const App: React.FC = () => {
  // Demo data is now handled by initial state in store.ts (Smart Body Text)
  
  return (
    <div className="h-screen w-screen flex flex-col bg-black text-neutral-200 overflow-hidden font-sans">
      <Toolbar />
      <div className="flex-1 flex overflow-hidden">
        <LeftSidebar />
        <Canvas />
        <RightSidebar />
      </div>
    </div>
  );
};

export default App;
