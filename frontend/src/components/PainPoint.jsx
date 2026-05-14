import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export default function PainPoint({ position, label, selected, onSelect }) {
    const [hovered, setHovered] = useState(false);

    const displayLabel = label
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    const dotColor = selected ? '#EF4444' : '#3B82F6';
    const ringColor = '#FFFFFF';

    return (
        <group position={position}>
            {/* 3D dot with a subtle white ring (matches “pin” look) */}
            <group
                onPointerEnter={(e) => {
                    e.stopPropagation();
                    setHovered(true);
                    document.body.style.cursor = 'pointer';
                }}
                onPointerLeave={(e) => {
                    e.stopPropagation();
                    setHovered(false);
                    document.body.style.cursor = 'default';
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect(label);
                }}
            >
                {/* Outer ring */}
                <mesh>
                    <sphereGeometry args={[0.055, 24, 24]} />
                    <meshStandardMaterial
                        color={ringColor}
                        roughness={0.35}
                        metalness={0.05}
                        emissive={new THREE.Color('#000000')}
                    />
                </mesh>

                {/* Inner core */}
                <mesh position={[0, 0, 0.012]}>
                    <sphereGeometry args={[selected ? 0.042 : 0.038, 24, 24]} />
                    <meshStandardMaterial
                        color={dotColor}
                        roughness={0.25}
                        metalness={0.15}
                        emissive={new THREE.Color(dotColor)}
                        emissiveIntensity={hovered ? 0.25 : selected ? 0.18 : 0.12}
                    />
                </mesh>
            </group>

            {/* Tooltip (screen-space) */}
            {hovered && (
                <Html center zIndexRange={[100, 0]} distanceFactor={10}>
                    <div className="bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg pointer-events-none animate-fade-in">
                        {displayLabel}
                    </div>
                </Html>
            )}
        </group>
    );
}