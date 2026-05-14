import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, useProgress } from '@react-three/drei';
import HumanModel from './HumanModel';

function Loader() {
  const { progress } = useProgress();
  return <Html center style={{ color: 'white', whiteSpace: 'nowrap' }}>{progress.toFixed(0)} % loaded</Html>;
}

export default function Viewer() {
    useEffect(() => {
        console.log("Viewer component mounted");
    }, []);

    return (
        <div style={{ width: '100%', height: '500px', background: '#111', borderRadius: '12px', overflow: 'hidden', marginBottom: '2rem' }}>
            <Canvas
                camera={{ position: [0, 1.5, 6], fov: 45 }}
            >
                <Suspense fallback={<Loader />}>
                    {/* Proper lighting for the 3D model */}
                    <ambientLight intensity={1.5} />
                    <directionalLight position={[5, 5, 5]} intensity={2} />
                    <directionalLight position={[-5, 5, -5]} intensity={1} />
                    <pointLight position={[0, 2, 4]} intensity={1} />

                    <HumanModel />

                    {/* Temporary Test Cube to verify rendering */}
                    <mesh position={[3, 0, 0]}>
                        <boxGeometry args={[1, 1, 1]} />
                        <meshStandardMaterial color="hotpink" />
                    </mesh>

                    <OrbitControls makeDefault />
                </Suspense>
            </Canvas>
        </div>
    );
}