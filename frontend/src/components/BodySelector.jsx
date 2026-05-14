import React, { Suspense, useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, useProgress, Environment, ContactShadows } from '@react-three/drei';
import HumanModel, { getBodyPartLabel, getBodyPartIcon } from './HumanModel';
import { 
  RotateCcw, 
  Eye, 
  FlipHorizontal, 
  X, 
  Crosshair, 
  ZoomIn, 
  ZoomOut, 
  Scan,
  Maximize2,
  RefreshCw,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
        <div className="flex flex-col items-center gap-1">
          <span className="text-primary font-bold text-sm tracking-widest uppercase">Initializing Neural Link</span>
          <div className="w-32 h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-primary" 
            />
          </div>
          <span className="text-slate-500 text-[10px] font-bold mt-1">{progress.toFixed(0)}%</span>
        </div>
      </div>
    </Html>
  );
}

export default function BodySelector() {
  const { selectedAreas, toggleArea } = useStore();
  const [key, setKey] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [hoveredBodyPart, setHoveredBodyPart] = useState(null);
  const controlsRef = useRef();

  const handleReset = useCallback(() => {
    setKey(prev => prev + 1);
    setAutoRotate(false);
  }, []);

  const setFrontView = useCallback(() => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      controls.setAzimuthalAngle(0);
      controls.setPolarAngle(Math.PI / 2);
      controls.update();
    }
  }, []);

  const setBackView = useCallback(() => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      controls.setAzimuthalAngle(Math.PI);
      controls.setPolarAngle(Math.PI / 2);
      controls.update();
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      controls.object.position.multiplyScalar(0.85);
      controls.update();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      controls.object.position.multiplyScalar(1.15);
      controls.update();
    }
  }, []);

  return (
    <div className="flex flex-col gap-6 h-full relative">
      {/* 3D Viewer Glass Container */}
      <div className="glass-card rounded-[2.5rem] flex-1 flex flex-col relative overflow-hidden min-h-[600px] border-white/5">
        
        {/* Top Control Bar */}
        <div className="absolute top-6 left-6 right-6 z-10 flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <Scan size={18} className="text-primary" />
              Anatomical Pain Mapping
            </h2>
            <div className="flex items-center gap-2">
              {hoveredBodyPart ? (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-xs text-primary font-bold bg-primary/10 px-3 py-1 rounded-full border border-primary/20"
                >
                  <span className="text-sm">{getBodyPartIcon(hoveredBodyPart)}</span>
                  {getBodyPartLabel(hoveredBodyPart)}
                </motion.div>
              ) : (
                <span className="text-[11px] text-slate-500 font-medium">Click on body parts to indicate pain centers</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="glass-card p-1 rounded-2xl border-white/5 flex gap-1">
              <ControlButton icon={<Maximize2 size={16} />} onClick={() => {}} title="Fullscreen" />
              <ControlButton icon={<RefreshCw size={16} />} onClick={handleReset} title="Reset View" />
            </div>
          </div>
        </div>

        {/* Right-side Floating Controls */}
        <div className="absolute top-1/2 -translate-y-1/2 right-6 z-10 flex flex-col gap-2">
          <div className="glass-card p-2 rounded-[2rem] border-white/5 flex flex-col gap-2 shadow-2xl">
            <ControlButton active={false} icon={<Eye size={18} />} onClick={setFrontView} title="Front View" vertical />
            <ControlButton active={false} icon={<FlipHorizontal size={18} />} onClick={setBackView} title="Back View" vertical />
            <div className="w-full h-px bg-white/5 my-1" />
            <ControlButton active={false} icon={<ZoomIn size={18} />} onClick={handleZoomIn} title="Zoom In" vertical />
            <ControlButton active={false} icon={<ZoomOut size={18} />} onClick={handleZoomOut} title="Zoom Out" vertical />
            <div className="w-full h-px bg-white/5 my-1" />
            <ControlButton 
              active={autoRotate} 
              icon={<RotateCcw size={18} className={autoRotate ? 'animate-spin-slow text-primary' : ''} />} 
              onClick={() => setAutoRotate(!autoRotate)} 
              title="Auto Rotate" 
              vertical 
            />
          </div>
        </div>

        {/* 3D Canvas */}
        <div className="absolute inset-0 z-0">
          <Canvas
            key={key}
            camera={{ position: [0, 0, 8], fov: 35 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
          >
            <Suspense fallback={<Loader />}>
              <ambientLight intensity={0.4} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
              <pointLight position={[-10, -10, -10]} intensity={0.5} />
              <Environment preset="night" />
              
              <HumanModel
                selectedAreas={selectedAreas}
                toggleArea={toggleArea}
                onHover={setHoveredBodyPart}
              />

              <ContactShadows
                position={[0, -3.5, 0]}
                opacity={0.4}
                scale={10}
                blur={2}
                far={4.5}
              />

              <OrbitControls
                ref={controlsRef}
                makeDefault
                enablePan={false}
                enableDamping
                dampingFactor={0.05}
                maxPolarAngle={Math.PI / 2 + 0.3}
                minPolarAngle={Math.PI / 6}
                minDistance={4}
                maxDistance={12}
                autoRotate={autoRotate}
                autoRotateSpeed={1.5}
              />
            </Suspense>
          </Canvas>
        </div>

        {/* Bottom Legend Overlay */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="glass-card px-6 py-3 rounded-full border-white/5 flex items-center gap-8 shadow-2xl">
            <LegendItem color="bg-primary shadow-[0_0_10px_rgba(139,92,246,0.5)]" label="Selected Area" pulse />
            <div className="w-px h-4 bg-white/10" />
            <LegendItem color="bg-white/20" label="Neutral" />
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <Info size={14} className="text-slate-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Orbit Link Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Areas Pills Section */}
      <div className="glass-card rounded-[2rem] p-6 border-white/5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
              <Crosshair size={18} className="text-red-400" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Identified Regions</h3>
          </div>
          <span className="text-[10px] font-bold bg-white/5 text-slate-400 px-3 py-1 rounded-full">
            {selectedAreas.length} AREAS SELECTED
          </span>
        </div>

        <div className="flex flex-wrap gap-3 min-h-[48px]">
          {selectedAreas.length === 0 ? (
            <div className="w-full flex items-center justify-center py-4 border border-dashed border-white/10 rounded-2xl">
              <p className="text-xs text-slate-500 italic">Target specific body regions on the 3D model</p>
            </div>
          ) : (
            <AnimatePresence>
              {selectedAreas.map((area) => (
                <motion.button
                  key={area}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => toggleArea(area)}
                  className="flex items-center gap-2 pl-4 pr-2 py-2 rounded-xl bg-primary/20 border border-primary/30 text-white group hover:bg-primary/30 transition-all"
                >
                  <span className="text-sm">{getBodyPartIcon(area)}</span>
                  <span className="text-xs font-bold whitespace-nowrap">{getBodyPartLabel(area)}</span>
                  <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-red-500 transition-colors">
                    <X size={12} />
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

function ControlButton({ icon, onClick, active, title, vertical = false }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center",
        active 
          ? "bg-primary/20 text-primary shadow-[0_0_15px_rgba(139,92,246,0.2)]" 
          : "text-slate-400 hover:text-white hover:bg-white/10"
      )}
    >
      {icon}
    </button>
  );
}

function LegendItem({ color, label, pulse = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("w-2.5 h-2.5 rounded-full", color, pulse && "animate-pulse")} />
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
  );
}
