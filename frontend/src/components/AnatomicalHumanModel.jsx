import { useMemo } from 'react';
import * as THREE from 'three';
import PainPoint from './PainPoint';

export default function AnatomicalHumanModel({ selectedAreas, toggleArea }) {
    const isSelected = (part) => selectedAreas?.includes(part);

    const bodyMesh = useMemo(() => {
        const meshes = [];

        // Helper function to create a capsule (used for arms, legs, etc.)
        const createCapsule = (radiusTop, radiusBottom, height, segmentsHeight = 8, segmentsRadius = 8) => {
            return new THREE.CapsuleGeometry(
                (radiusTop + radiusBottom) / 2,
                height,
                segmentsRadius,
                segmentsHeight
            );
        };

        // HEAD - Sphere
        const headGeom = new THREE.IcosahedronGeometry(0.28, 4);
        const headMesh = new THREE.Mesh(headGeom, new THREE.MeshPhongMaterial({ color: 0xD4A574 }));
        headMesh.position.y = 1.85;
        meshes.push(headMesh);

        // NECK - Cylinder
        const neckGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.35, 16);
        const neckMesh = new THREE.Mesh(neckGeom, new THREE.MeshPhongMaterial({ color: 0xE8B8A0 }));
        neckMesh.position.y = 1.4;
        meshes.push(neckMesh);

        // TORSO - Box for chest and upper body
        const torsoGeom = new THREE.BoxGeometry(0.5, 0.75, 0.28);
        const torsoMesh = new THREE.Mesh(torsoGeom, new THREE.MeshPhongMaterial({ color: 0xF5F5F5 }));
        torsoMesh.position.y = 0.85;
        torsoMesh.castShadow = true;
        meshes.push(torsoMesh);

        // ABDOMEN - Slightly smaller box
        const abdomenGeom = new THREE.BoxGeometry(0.48, 0.5, 0.27);
        const abdomenMesh = new THREE.Mesh(abdomenGeom, new THREE.MeshPhongMaterial({ color: 0xF8F8F8 }));
        abdomenMesh.position.y = 0.2;
        meshes.push(abdomenMesh);

        // PELVIS - Box
        const pelvisGeom = new THREE.BoxGeometry(0.45, 0.3, 0.26);
        const pelvisMesh = new THREE.Mesh(pelvisGeom, new THREE.MeshPhongMaterial({ color: 0xF0F0F0 }));
        pelvisMesh.position.y = -0.35;
        meshes.push(pelvisMesh);

        // SHOULDERS - Spheres
        const shoulderGeom = new THREE.IcosahedronGeometry(0.15, 3);
        
        const leftShoulderMesh = new THREE.Mesh(shoulderGeom, new THREE.MeshPhongMaterial({ color: 0xE8B8A0 }));
        leftShoulderMesh.position.set(-0.4, 1.1, 0);
        meshes.push(leftShoulderMesh);

        const rightShoulderMesh = new THREE.Mesh(shoulderGeom, new THREE.MeshPhongMaterial({ color: 0xE8B8A0 }));
        rightShoulderMesh.position.set(0.4, 1.1, 0);
        meshes.push(rightShoulderMesh);

        // LEFT ARM
        const leftUpperArmGeom = createCapsule(0.1, 0.08, 0.45);
        const leftUpperArmMesh = new THREE.Mesh(leftUpperArmGeom, new THREE.MeshPhongMaterial({ color: 0xE8B8A0 }));
        leftUpperArmMesh.position.set(-0.5, 0.7, 0);
        leftUpperArmMesh.rotation.z = Math.PI / 2.5;
        meshes.push(leftUpperArmMesh);

        const leftForearmGeom = createCapsule(0.075, 0.065, 0.4);
        const leftForearmMesh = new THREE.Mesh(leftForearmGeom, new THREE.MeshPhongMaterial({ color: 0xE8B8A0 }));
        leftForearmMesh.position.set(-0.95, 0.25, 0);
        leftForearmMesh.rotation.z = Math.PI / 3;
        meshes.push(leftForearmMesh);

        const leftHandGeom = new THREE.IcosahedronGeometry(0.08, 3);
        const leftHandMesh = new THREE.Mesh(leftHandGeom, new THREE.MeshPhongMaterial({ color: 0xD4A574 }));
        leftHandMesh.position.set(-1.15, -0.25, 0.05);
        meshes.push(leftHandMesh);

        // RIGHT ARM (mirror of left)
        const rightUpperArmGeom = createCapsule(0.1, 0.08, 0.45);
        const rightUpperArmMesh = new THREE.Mesh(rightUpperArmGeom, new THREE.MeshPhongMaterial({ color: 0xE8B8A0 }));
        rightUpperArmMesh.position.set(0.5, 0.7, 0);
        rightUpperArmMesh.rotation.z = -Math.PI / 2.5;
        meshes.push(rightUpperArmMesh);

        const rightForearmGeom = createCapsule(0.075, 0.065, 0.4);
        const rightForearmMesh = new THREE.Mesh(rightForearmGeom, new THREE.MeshPhongMaterial({ color: 0xE8B8A0 }));
        rightForearmMesh.position.set(0.95, 0.25, 0);
        rightForearmMesh.rotation.z = -Math.PI / 3;
        meshes.push(rightForearmMesh);

        const rightHandGeom = new THREE.IcosahedronGeometry(0.08, 3);
        const rightHandMesh = new THREE.Mesh(rightHandGeom, new THREE.MeshPhongMaterial({ color: 0xD4A574 }));
        rightHandMesh.position.set(1.15, -0.25, 0.05);
        meshes.push(rightHandMesh);

        // LEFT LEG
        const leftThighGeom = createCapsule(0.12, 0.11, 0.6);
        const leftThighMesh = new THREE.Mesh(leftThighGeom, new THREE.MeshPhongMaterial({ color: 0xE8B8A0 }));
        leftThighMesh.position.set(-0.2, -0.8, 0);
        meshes.push(leftThighMesh);

        const leftCalfGeom = createCapsule(0.1, 0.09, 0.55);
        const leftCalfMesh = new THREE.Mesh(leftCalfGeom, new THREE.MeshPhongMaterial({ color: 0xE8B8A0 }));
        leftCalfMesh.position.set(-0.2, -1.55, 0.05);
        meshes.push(leftCalfMesh);

        const leftFootGeom = new THREE.BoxGeometry(0.15, 0.12, 0.25);
        const leftFootMesh = new THREE.Mesh(leftFootGeom, new THREE.MeshPhongMaterial({ color: 0xD4A574 }));
        leftFootMesh.position.set(-0.2, -2.1, 0.08);
        meshes.push(leftFootMesh);

        // RIGHT LEG (mirror of left)
        const rightThighGeom = createCapsule(0.12, 0.11, 0.6);
        const rightThighMesh = new THREE.Mesh(rightThighGeom, new THREE.MeshPhongMaterial({ color: 0xE8B8A0 }));
        rightThighMesh.position.set(0.2, -0.8, 0);
        meshes.push(rightThighMesh);

        const rightCalfGeom = createCapsule(0.1, 0.09, 0.55);
        const rightCalfMesh = new THREE.Mesh(rightCalfGeom, new THREE.MeshPhongMaterial({ color: 0xE8B8A0 }));
        rightCalfMesh.position.set(0.2, -1.55, 0.05);
        meshes.push(rightCalfMesh);

        const rightFootGeom = new THREE.BoxGeometry(0.15, 0.12, 0.25);
        const rightFootMesh = new THREE.Mesh(rightFootGeom, new THREE.MeshPhongMaterial({ color: 0xD4A574 }));
        rightFootMesh.position.set(0.2, -2.1, 0.08);
        meshes.push(rightFootMesh);

        // BACK - Box behind torso for definition
        const backGeom = new THREE.BoxGeometry(0.5, 0.75, 0.15);
        const backMesh = new THREE.Mesh(backGeom, new THREE.MeshPhongMaterial({ color: 0xEEEEEE }));
        backMesh.position.set(0, 0.85, -0.2);
        meshes.push(backMesh);

        return meshes;
    }, []);

    // Enhanced anatomical pain points aligned to body geometry
    const points = [
        // HEAD & NECK
        { id: 'head', pos: [0, 1.85, 0.2] },
        { id: 'neck', pos: [0, 1.4, 0.25] },

        // CHEST - Enhanced mapping
        { id: 'chest_center', pos: [0, 0.95, 0.45] },
        { id: 'chest_upper', pos: [0, 1.15, 0.45] },
        { id: 'chest_lower', pos: [0, 0.75, 0.45] },
        
        { id: 'chest_left_center', pos: [-0.2, 0.95, 0.45] },
        { id: 'chest_left_upper', pos: [-0.25, 1.1, 0.45] },
        { id: 'chest_left_lower', pos: [-0.2, 0.65, 0.45] },
        { id: 'chest_left_side', pos: [-0.4, 0.95, 0.3] },
        
        { id: 'chest_right_center', pos: [0.2, 0.95, 0.45] },
        { id: 'chest_right_upper', pos: [0.25, 1.1, 0.45] },
        { id: 'chest_right_lower', pos: [0.2, 0.65, 0.45] },
        { id: 'chest_right_side', pos: [0.4, 0.95, 0.3] },

        { id: 'left_rib_upper', pos: [-0.3, 1.0, 0.35] },
        { id: 'left_rib_mid', pos: [-0.35, 0.75, 0.3] },
        { id: 'right_rib_upper', pos: [0.3, 1.0, 0.35] },
        { id: 'right_rib_mid', pos: [0.35, 0.75, 0.3] },

        // SHOULDERS
        { id: 'left_shoulder', pos: [-0.4, 1.1, 0] },
        { id: 'right_shoulder', pos: [0.4, 1.1, 0] },

        // ARMS
        { id: 'left_upper_arm', pos: [-0.5, 0.7, 0] },
        { id: 'left_arm', pos: [-0.8, 0.4, 0] },
        { id: 'left_elbow', pos: [-0.95, 0.15, 0] },
        { id: 'left_forearm', pos: [-1.0, -0.1, 0] },
        { id: 'left_wrist', pos: [-1.1, -0.3, 0] },
        
        { id: 'right_upper_arm', pos: [0.5, 0.7, 0] },
        { id: 'right_arm', pos: [0.8, 0.4, 0] },
        { id: 'right_elbow', pos: [0.95, 0.15, 0] },
        { id: 'right_forearm', pos: [1.0, -0.1, 0] },
        { id: 'right_wrist', pos: [1.1, -0.3, 0] },

        // ABDOMEN
        { id: 'upper_abdomen', pos: [0, 0.4, 0.45] },
        { id: 'mid_abdomen', pos: [0, 0.15, 0.45] },
        { id: 'lower_abdomen', pos: [0, -0.15, 0.42] },

        // BACK
        { id: 'upper_back', pos: [0, 1.0, -0.35] },
        { id: 'mid_back', pos: [0, 0.6, -0.35] },
        { id: 'lower_back', pos: [0, 0.15, -0.35] },
        { id: 'left_back', pos: [-0.2, 0.6, -0.3] },
        { id: 'right_back', pos: [0.2, 0.6, -0.3] },

        // LEGS
        { id: 'left_thigh_upper', pos: [-0.2, -0.4, 0] },
        { id: 'left_thigh_mid', pos: [-0.2, -0.8, 0] },
        { id: 'right_thigh_upper', pos: [0.2, -0.4, 0] },
        { id: 'right_thigh_mid', pos: [0.2, -0.8, 0] },
        
        { id: 'left_knee', pos: [-0.2, -1.15, 0] },
        { id: 'right_knee', pos: [0.2, -1.15, 0] },
        
        { id: 'left_calf', pos: [-0.2, -1.6, 0.1] },
        { id: 'right_calf', pos: [0.2, -1.6, 0.1] },
        
        { id: 'left_ankle', pos: [-0.2, -1.95, 0.1] },
        { id: 'right_ankle', pos: [0.2, -1.95, 0.1] },
        
        { id: 'left_foot', pos: [-0.2, -2.1, 0.15] },
        { id: 'right_foot', pos: [0.2, -2.1, 0.15] },

        // GROIN
        { id: 'groin', pos: [0, -0.35, 0.35] },
    ];

    return (
        <group>
            {/* Render all body mesh parts */}
            {bodyMesh.map((mesh, idx) => (
                <primitive key={`mesh-${idx}`} object={mesh} />
            ))}

            {/* Render pain points */}
            {points.map(pt => (
                <PainPoint
                    key={pt.id}
                    position={pt.pos}
                    label={pt.id}
                    selected={isSelected(pt.id)}
                    onSelect={toggleArea}
                />
            ))}
        </group>
    );
}
