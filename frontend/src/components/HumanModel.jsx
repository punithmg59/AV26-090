import { useGLTF } from '@react-three/drei';
import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';

// ─── Human-readable body part labels ───────────────────────────────────────────
const BODY_PART_LABELS = {
  head: 'Head', neck: 'Neck',
  chest_center: 'Chest', chest_upper: 'Upper Chest',
  upper_abdomen: 'Upper Abdomen', mid_abdomen: 'Mid Abdomen',
  lower_abdomen: 'Lower Abdomen',
  left_shoulder: 'Left Shoulder', right_shoulder: 'Right Shoulder',
  left_upper_arm: 'Left Upper Arm', left_arm: 'Left Arm',
  left_forearm: 'Left Forearm',
  right_upper_arm: 'Right Upper Arm', right_arm: 'Right Arm',
  right_forearm: 'Right Forearm',
  left_thigh: 'Left Thigh', left_calf: 'Left Calf', left_foot: 'Left Foot',
  right_thigh: 'Right Thigh', right_calf: 'Right Calf', right_foot: 'Right Foot',
  upper_back: 'Upper Back', mid_back: 'Mid Back', lower_back: 'Lower Back',
  left_knee: 'Left Knee', right_knee: 'Right Knee',
  left_wrist: 'Left Wrist', right_wrist: 'Right Wrist',
  pelvis: 'Pelvis', left_hand: 'Left Hand', right_hand: 'Right Hand',
};

export const BODY_PART_ICONS = {
  head: '🧠', neck: '🦴', chest_center: '🫀', chest_upper: '🫀',
  upper_abdomen: '🫁', mid_abdomen: '🫁', lower_abdomen: '🫁',
  left_shoulder: '💪', right_shoulder: '💪',
  left_upper_arm: '💪', left_arm: '💪', left_forearm: '💪',
  right_upper_arm: '💪', right_arm: '💪', right_forearm: '💪',
  left_thigh: '🦵', left_calf: '🦵', left_foot: '🦶',
  right_thigh: '🦵', right_calf: '🦵', right_foot: '🦶',
  upper_back: '🔙', mid_back: '🔙', lower_back: '🔙',
  left_knee: '🦵', right_knee: '🦵',
  left_wrist: '✋', right_wrist: '✋',
  pelvis: '🦴', left_hand: '✋', right_hand: '✋',
};

export function getBodyPartLabel(key) {
  return BODY_PART_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
export function getBodyPartIcon(key) {
  return BODY_PART_ICONS[key] || '📍';
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function HumanModel({ selectedAreas, toggleArea, onHover }) {
  const { scene } = useGLTF('/models/human.glb');
  const groupRef = useRef(null);
  const [hoveredPart, setHoveredPart] = useState(null);
  const [tooltipPos, setTooltipPos] = useState(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const { camera, gl } = useThree();
  const materialMapRef = useRef(new Map());
  const worldBoundsRef = useRef(null);
  // Track which body part each mesh belongs to (by uuid)
  const meshBodyPartMap = useRef(new Map());

  // ── Position-based body part detection ───────────────────────────────────
  // Uses the world-space intersection point to determine the anatomical region.
  // This is reliable regardless of mesh naming conventions in the GLB.
  const getBodyPartFromPosition = useCallback((worldPoint) => {
    const bounds = worldBoundsRef.current;
    if (!bounds) return null;

    const { minY, maxY, minX, maxX, minZ, maxZ } = bounds;
    const height = maxY - minY;
    const width = maxX - minX;

    // Normalize: 0 = bottom/feet, 1 = top/head
    const ny = (worldPoint.y - minY) / height;
    // Normalize X: negative = right side of body, positive = left side
    const cx = (worldPoint.x - (minX + maxX) / 2) / (width / 2); // -1 to +1
    // Front vs back
    const midZ = (minZ + maxZ) / 2;
    const isFront = worldPoint.z > midZ;
    const absX = Math.abs(cx);

    // ── Head ──
    if (ny > 0.88) return 'head';

    // ── Neck ──
    if (ny > 0.82) return 'neck';

    // ── Shoulder region ──
    if (ny > 0.72 && ny <= 0.82) {
      if (absX > 0.35) return cx > 0 ? 'left_shoulder' : 'right_shoulder';
      return isFront ? 'chest_upper' : 'upper_back';
    }

    // ── Upper arm / chest region ──
    if (ny > 0.62 && ny <= 0.72) {
      if (absX > 0.55) return cx > 0 ? 'left_upper_arm' : 'right_upper_arm';
      if (absX > 0.35) return cx > 0 ? 'left_shoulder' : 'right_shoulder';
      return isFront ? 'chest_center' : 'upper_back';
    }

    // ── Mid-arm / abdomen region ──
    if (ny > 0.52 && ny <= 0.62) {
      if (absX > 0.5) return cx > 0 ? 'left_arm' : 'right_arm';
      return isFront ? 'upper_abdomen' : 'mid_back';
    }

    // ── Forearm / lower abdomen ──
    if (ny > 0.42 && ny <= 0.52) {
      if (absX > 0.45) return cx > 0 ? 'left_forearm' : 'right_forearm';
      return isFront ? 'mid_abdomen' : 'lower_back';
    }

    // ── Hands / pelvis ──
    if (ny > 0.36 && ny <= 0.42) {
      if (absX > 0.4) return cx > 0 ? 'left_hand' : 'right_hand';
      return isFront ? 'lower_abdomen' : 'lower_back';
    }

    // ── Upper thigh ──
    if (ny > 0.28 && ny <= 0.36) {
      return cx > 0 ? 'left_thigh' : 'right_thigh';
    }

    // ── Mid thigh ──
    if (ny > 0.22 && ny <= 0.28) {
      return cx > 0 ? 'left_thigh' : 'right_thigh';
    }

    // ── Knee ──
    if (ny > 0.18 && ny <= 0.22) {
      return cx > 0 ? 'left_knee' : 'right_knee';
    }

    // ── Calf / lower leg ──
    if (ny > 0.07 && ny <= 0.18) {
      return cx > 0 ? 'left_calf' : 'right_calf';
    }

    // ── Feet ──
    if (ny <= 0.07) {
      return cx > 0 ? 'left_foot' : 'right_foot';
    }

    return null;
  }, []);

  // ── Compute position, scale, world bounds & clone materials ──────────────
  const { position, scale } = useMemo(() => {
    if (!scene) return { position: [0, 0, 0], scale: 1 };

    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetScale = maxDim > 0 ? 7 / maxDim : 1;

    const finalPosition = [
      -center.x * targetScale,
      -center.y * targetScale,
      -center.z * targetScale,
    ];

    // Compute world-space bounds for position-based detection
    worldBoundsRef.current = {
      minY: (box.min.y - center.y) * targetScale,
      maxY: (box.max.y - center.y) * targetScale,
      minX: (box.min.x - center.x) * targetScale,
      maxX: (box.max.x - center.x) * targetScale,
      minZ: (box.min.z - center.z) * targetScale,
      maxZ: (box.max.z - center.z) * targetScale,
    };

    // Log mesh names for debugging (remove in production)
    console.log('── GLB Mesh names ──');
    scene.traverse((child) => {
      if (child.isMesh) {
        const bb = new THREE.Box3().setFromObject(child);
        console.log(`Mesh: "${child.name}" | y: ${(bb.min.y * targetScale).toFixed(2)} to ${(bb.max.y * targetScale).toFixed(2)}`);
      }
    });

    // Clone materials for each mesh
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        if (!materialMapRef.current.has(child.uuid)) {
          child.material = child.material.clone();
          child.material.transparent = true;
          child.material.opacity = 1;
          child.material.side = THREE.DoubleSide;
          if (child.material.emissive === undefined) {
            child.material.emissive = new THREE.Color(0x000000);
          }
          child.material.emissiveIntensity = 0;
          materialMapRef.current.set(child.uuid, {
            originalColor: child.material.color ? child.material.color.clone() : new THREE.Color(0xcccccc),
            originalRoughness: child.material.roughness ?? 0.6,
          });
        }
      }
    });

    return { position: finalPosition, scale: targetScale };
  }, [scene]);

  // ── Event handlers ───────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = gl.domElement;

    const handleMouseMove = (event) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handleClick = (event) => {
      if (!groupRef.current) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const objectsToTest = [];
      groupRef.current.traverse((child) => {
        if (child.isMesh) objectsToTest.push(child);
      });

      const intersects = raycasterRef.current.intersectObjects(objectsToTest);
      if (intersects.length > 0) {
        const hitPoint = intersects[0].point;
        const bodyPart = getBodyPartFromPosition(hitPoint);
        if (bodyPart) {
          toggleArea(bodyPart);
        }
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [camera, gl, toggleArea, getBodyPartFromPosition]);

  // Emissive colors
  const hoverEmissive = useMemo(() => new THREE.Color(0xffca28), []);
  const selectedEmissive = useMemo(() => new THREE.Color(0xef5350), []);
  const selectedHoverEmissive = useMemo(() => new THREE.Color(0xff7043), []);
  const defaultEmissive = useMemo(() => new THREE.Color(0x000000), []);

  const lerpColor = (current, target, alpha) => {
    current.r += (target.r - current.r) * alpha;
    current.g += (target.g - current.g) * alpha;
    current.b += (target.b - current.b) * alpha;
  };

  // Track last detected part per mesh for material updates
  const lastHitPartRef = useRef(null);

  // ── Animation frame ──────────────────────────────────────────────────────
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Breathing animation
    const breathe = Math.sin(t * 1.0) * 0.01;
    const breatheScale = 1 + Math.sin(t * 1.0) * 0.002;
    const sway = Math.sin(t * 0.55) * 0.002;
    groupRef.current.position.y = position[1] + breathe;
    groupRef.current.position.x = position[0] + sway;
    groupRef.current.scale.setScalar(scale * breatheScale);

    // Raycasting for hover
    raycasterRef.current.setFromCamera(mouseRef.current, camera);
    const objectsToTest = [];
    groupRef.current.traverse((child) => {
      if (child.isMesh) objectsToTest.push(child);
    });

    const intersects = raycasterRef.current.intersectObjects(objectsToTest);
    let hitPart = null;

    if (intersects.length > 0) {
      const hitPoint = intersects[0].point;
      hitPart = getBodyPartFromPosition(hitPoint);
      setTooltipPos(hitPoint.clone());
    } else {
      setTooltipPos(null);
    }

    // Update hover state
    if (hitPart !== hoveredPart) {
      setHoveredPart(hitPart);
      if (onHover) onHover(hitPart);
    }
    lastHitPartRef.current = hitPart;

    // Pulsing for selected parts
    const pulseIntensity = 0.45 + Math.sin(t * 2.5) * 0.15;
    const lerpSpeed = 0.12;

    // For material updates, we need to determine each mesh's body part
    // by checking its center position in world space
    groupRef.current.traverse((child) => {
      if (!child.isMesh || !child.material) return;

      // Determine this mesh's body part from its world-space center
      let meshPart = meshBodyPartMap.current.get(child.uuid);
      if (!meshPart) {
        const meshBox = new THREE.Box3().setFromObject(child);
        const meshCenter = meshBox.getCenter(new THREE.Vector3());
        meshPart = getBodyPartFromPosition(meshCenter);
        if (meshPart) meshBodyPartMap.current.set(child.uuid, meshPart);
      }

      const isSelected = meshPart && selectedAreas?.includes(meshPart);
      const isHovered = meshPart && meshPart === hitPart;

      let targetEmissive, targetIntensity, targetRoughness;

      if (isSelected && isHovered) {
        targetEmissive = selectedHoverEmissive;
        targetIntensity = 0.75;
        targetRoughness = 0.2;
      } else if (isSelected) {
        targetEmissive = selectedEmissive;
        targetIntensity = pulseIntensity;
        targetRoughness = 0.25;
      } else if (isHovered) {
        targetEmissive = hoverEmissive;
        targetIntensity = 0.45;
        targetRoughness = 0.35;
      } else {
        targetEmissive = defaultEmissive;
        targetIntensity = 0;
        targetRoughness = 0.6;
      }

      if (child.material.emissive) {
        lerpColor(child.material.emissive, targetEmissive, lerpSpeed);
      }
      child.material.emissiveIntensity += (targetIntensity - child.material.emissiveIntensity) * lerpSpeed;
      if (child.material.roughness !== undefined) {
        child.material.roughness += (targetRoughness - child.material.roughness) * lerpSpeed;
      }
    });

    document.body.style.cursor = hitPart ? 'pointer' : 'default';
  });

  const hoveredLabel = hoveredPart ? getBodyPartLabel(hoveredPart) : null;

  return (
    <group ref={groupRef} scale={scale} position={position}>
      <primitive object={scene} />

      {tooltipPos && hoveredLabel && (
        <Html
          position={[
            (tooltipPos.x - position[0]) / scale,
            (tooltipPos.y - position[1]) / scale + 0.2,
            (tooltipPos.z - position[2]) / scale,
          ]}
          center
          zIndexRange={[100, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div style={{
            background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.95))',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 700,
            padding: '10px 18px',
            borderRadius: '14px',
            whiteSpace: 'nowrap',
            boxShadow: '0 12px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.1)',
            backdropFilter: 'blur(16px)',
            letterSpacing: '0.4px',
            animation: 'tooltipFadeIn 0.15s ease-out forwards',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transform: 'translateY(-12px)',
            position: 'relative',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}>
            <span style={{ fontSize: '15px' }}>{getBodyPartIcon(hoveredPart)}</span>
            {hoveredLabel}
            <div style={{
              position: 'absolute', bottom: '-6px', left: '50%',
              transform: 'translateX(-50%)',
              width: 0, height: 0,
              borderLeft: '7px solid transparent',
              borderRight: '7px solid transparent',
              borderTop: '7px solid rgba(22,33,50,0.95)',
            }} />
          </div>
        </Html>
      )}
    </group>
  );
}

useGLTF.preload('/models/human.glb');
