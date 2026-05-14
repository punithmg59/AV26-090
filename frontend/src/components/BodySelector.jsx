import React, { Suspense, useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, useProgress, Environment, ContactShadows } from '@react-three/drei';
import HumanModel, { getBodyPartLabel, getBodyPartIcon } from './HumanModel';
import { RotateCcw, Eye, FlipHorizontal, X, Crosshair, ZoomIn, ZoomOut, Scan } from 'lucide-react';

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: '3px solid rgba(79,70,229,0.12)',
          borderTopColor: '#4F46E5',
          animation: 'spin 0.8s linear infinite',
        }} />
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
        }}>
          <span style={{
            color: '#4F46E5',
            fontWeight: 700,
            fontSize: '14px',
            fontFamily: 'Inter, system-ui, sans-serif',
            letterSpacing: '0.5px',
          }}>
            Loading anatomy...
          </span>
          <div style={{
            width: '120px',
            height: '3px',
            borderRadius: '3px',
            background: 'rgba(79,70,229,0.1)',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              borderRadius: '3px',
              background: 'linear-gradient(90deg, #4F46E5, #818CF8)',
              transition: 'width 0.3s ease',
            }} />
          </div>
          <span style={{
            color: '#94A3B8',
            fontSize: '11px',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}>
            {progress.toFixed(0)}%
          </span>
        </div>
      </div>
    </Html>
  );
}

export default function BodySelector({ selectedAreas, toggleArea }) {
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
      controls.object.position.multiplyScalar(1.18);
      controls.update();
    }
  }, []);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* 3D Viewer Container */}
      <div className="rounded-3xl border border-border flex-1 flex flex-col relative overflow-hidden min-h-[650px] shadow-xl body-viewer-container">

        {/* Header */}
        <div className="shrink-0 z-10 relative px-5 pt-5 pb-2">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
                  <Scan size={16} className="text-indigo-300" />
                </div>
                Anatomical Pain Selector
              </h2>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-md">
                Click directly on body regions to mark pain areas. Drag to rotate the model.
              </p>
            </div>
            {/* Selection count badge */}
            {selectedAreas.length > 0 && (
              <div className="flex items-center gap-2 bg-red-500/15 border border-red-400/30 px-3.5 py-2 rounded-xl backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-xs font-bold text-red-300">{selectedAreas.length} area{selectedAreas.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>

        {/* Hover indicator bar */}
        <div className="px-5 pb-1 shrink-0 z-10">
          <div className="h-9 flex items-center">
            {hoveredBodyPart ? (
              <div className="flex items-center gap-2.5 text-sm animate-fade-in bg-white/8 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50 animate-pulse" />
                <span className="text-slate-400 font-medium text-xs">Hovering</span>
                <span className="font-bold text-white">
                  {getBodyPartIcon(hoveredBodyPart)} {getBodyPartLabel(hoveredBodyPart)}
                </span>
              </div>
            ) : (
              <span className="text-[11px] text-slate-500 italic flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                Hover over the body to preview areas
              </span>
            )}
          </div>
        </div>

        {/* Right-side controls panel */}
        <div className="absolute top-[120px] right-4 flex flex-col gap-1.5 z-10">
          <div className="bg-slate-800/80 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-2xl flex flex-col gap-1">
            <ControlButton
              label="Front"
              icon={<Eye size={15} />}
              onClick={setFrontView}
            />
            <ControlButton
              label="Back"
              icon={<FlipHorizontal size={15} />}
              onClick={setBackView}
            />
            <div className="w-full h-px bg-white/8 my-0.5" />
            <ControlButton
              label="Zoom +"
              icon={<ZoomIn size={15} />}
              onClick={handleZoomIn}
            />
            <ControlButton
              label="Zoom −"
              icon={<ZoomOut size={15} />}
              onClick={handleZoomOut}
            />
            <div className="w-full h-px bg-white/8 my-0.5" />
            <ControlButton
              label="Rotate"
              icon={<RotateCcw size={15} className={autoRotate ? 'animate-spin-slow' : ''} />}
              onClick={() => setAutoRotate(!autoRotate)}
              active={autoRotate}
            />
            <ControlButton
              label="Reset"
              icon={<RotateCcw size={15} />}
              onClick={handleReset}
            />
          </div>
        </div>

        {/* 3D Canvas */}
        <div className="flex-1 w-full relative rounded-b-3xl overflow-hidden">
          <Canvas
            key={key}
            camera={{ position: [0, 0.5, 8], fov: 38 }}
            className="w-full h-full"
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
          >
            <Suspense fallback={<Loader />}>
              {/* Premium studio lighting */}
              <ambientLight intensity={0.6} color="#e8e8ff" />
              <directionalLight position={[5, 8, 5]} intensity={1.6} castShadow color="#fff5ee" />
              <directionalLight position={[-4, 4, -4]} intensity={0.5} color="#e0e0ff" />
              <pointLight position={[0, 3, 6]} intensity={0.35} color="#fff" />
              <pointLight position={[0, -2, 4]} intensity={0.2} color="#c7d2fe" />
              {/* Subtle rim light for depth */}
              <pointLight position={[-3, 2, -3]} intensity={0.2} color="#a5b4fc" />

              <Environment preset="studio" />

              <HumanModel
                selectedAreas={selectedAreas}
                toggleArea={toggleArea}
                onHover={setHoveredBodyPart}
              />

              <ContactShadows
                position={[0, -3.8, 0]}
                opacity={0.25}
                scale={14}
                blur={2.5}
                far={7}
                color="#0f172a"
              />

              <OrbitControls
                ref={controlsRef}
                makeDefault
                enablePan={false}
                enableDamping
                dampingFactor={0.06}
                maxPolarAngle={Math.PI / 2 + 0.4}
                minPolarAngle={Math.PI / 5}
                minDistance={3.5}
                maxDistance={14}
                target={[0, 0, 0]}
                autoRotate={autoRotate}
                autoRotateSpeed={1.5}
              />
            </Suspense>
          </Canvas>

          {/* Legend overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-5 bg-slate-800/70 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-white/10 shadow-2xl">
              <LegendItem color="bg-amber-400" glowColor="shadow-amber-400/40" label="Hover" />
              <div className="w-px h-4 bg-white/10" />
              <LegendItem color="bg-red-500" glowColor="shadow-red-500/40" label="Selected" pulse />
              <div className="w-px h-4 bg-white/10" />
              <span className="text-[11px] text-slate-400 italic">Drag to rotate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Areas - Premium pills */}
      <div className="bg-surface rounded-3xl border border-border p-5 shrink-0 shadow-lg"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-textMain flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-gradient-to-br from-red-50 to-rose-100 border border-red-200 flex items-center justify-center text-sm shadow-sm">🎯</span>
            Selected Pain Areas
          </h3>
          {selectedAreas.length > 0 && (
            <span className="text-[11px] text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl font-bold tracking-wide">
              {selectedAreas.length} area{selectedAreas.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2.5 min-h-[44px]">
          {selectedAreas.length === 0 && (
            <div className="flex items-center gap-2.5 py-3 px-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 w-full justify-center">
              <Crosshair size={14} className="text-gray-300" />
              <span className="text-sm text-textMuted italic">Click on the body model above to select pain areas</span>
            </div>
          )}
          {selectedAreas.map((area, index) => (
            <div
              key={area}
              className="body-chip group flex items-center gap-2.5 pl-4 pr-2 py-2 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #FEF2F2 0%, #FFF1F2 50%, #FCE7F3 100%)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                animationDelay: `${index * 0.05}s`,
              }}
            >
              <span className="text-base leading-none">{getBodyPartIcon(area)}</span>
              <span className="text-[13px] font-bold text-red-800 tracking-wide">
                {getBodyPartLabel(area)}
              </span>
              <button
                onClick={() => toggleArea(area)}
                className="ml-0.5 w-6 h-6 rounded-full bg-red-100/80 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-110 hover:rotate-90"
                title={`Remove ${getBodyPartLabel(area)}`}
              >
                <X size={12} className="text-red-600 group-hover:text-red-700" />
              </button>
            </div>
          ))}
        </div>

        {selectedAreas.length > 0 && (
          <p className="text-[11px] text-textMuted mt-3.5 flex items-center gap-2 font-medium bg-slate-50 px-3 py-2 rounded-xl">
            <span className="w-4 h-4 flex items-center justify-center border border-gray-300 rounded-full text-[9px] text-gray-400 shrink-0">i</span>
            Click a selected area again to deselect, or use the × button to remove
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ControlButton({ label, icon, onClick, active = false }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] font-semibold
        transition-all duration-200 w-full
        ${active
          ? 'text-indigo-300 bg-indigo-500/20 border border-indigo-400/30 shadow-sm shadow-indigo-500/10'
          : 'text-slate-400 hover:text-white hover:bg-white/10 border border-transparent'
        }
      `}
      title={label}
    >
      {icon}
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

function LegendItem({ color, glowColor, label, pulse = false }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color} shadow-md ${glowColor} ${pulse ? 'animate-pulse' : ''}`} />
      <span className="text-xs font-semibold text-slate-300">{label}</span>
    </div>
  );
}
