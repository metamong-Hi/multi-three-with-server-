/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import React, { useEffect, useMemo, useRef } from 'react'
import { useGLTF, useAnimations, Html } from '@react-three/drei'
import { CapsuleCollider, RigidBody } from '@react-three/rapier';
import { ApplyShadow, RUN_SPEED, WALK_SPEED } from './Character';
import { Skeleton } from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { useFrame, useGraph } from '@react-three/fiber';
import * as THREE from "three"
import { DEG2RAD } from 'three/src/math/MathUtils.js';

const COLLEAGUE_HEIGH = 1.79;
const COLLEAGUE_RADIUS = 0.3;
let bTriggerFocus=false;
window.onfocus=()=>{
    bTriggerFocus=true;
}
function Animation({ actions, refModel, refRigid, animationName, position, rotationY }) {
    useEffect(() => {
        const action = actions[animationName];
        action.reset().fadeIn(0.5).play();
        return () => {
            action?.fadeOut(0.5);
        }
    }, [ animationName ])

    useEffect(() => {
        refRigid.current.setTranslation({ x:position[0], y: position[1], z: position[2] });
    }, []);

    useFrame((state, delta) => {
        // 회전
        if(refModel.current) {
            const rotationQ = new THREE.Quaternion();
            rotationQ.setFromAxisAngle(new THREE.Vector3(0,1,0), rotationY);
            refModel.current.quaternion.rotateTowards(rotationQ, DEG2RAD * 5);
        }

        // 위치
        if(refRigid.current) {
            // const cy = refRigid.current.translation().y;
            // refRigid.current.setTranslation({ x: position[0], y: cy, z: position[2] })
            if(bTriggerFocus) {
                refRigid.current.setTranslation({ x:position[0], y:position[1], z:position[2] });
                setTimeout(() =>{ bTriggerFocus=false; }, 200);
                } else{
            const t = refRigid.current.translation();
            const cp = new THREE.Vector3(t.x, t.y, t.z);
            const tp = new THREE.Vector3(position[0], position[1], position[2]);
            let speed = animationName === "Walk" ? WALK_SPEED : (animationName === "Run" ? RUN_SPEED : 0);
            if(speed === 0 && cp.distanceTo(tp) > 0.1) speed = WALK_SPEED;

            const dir = tp.sub(cp).normalize();
            const sd = speed * delta;
            const dx = dir.x * sd;
            const dy = dir.y * sd;
            const dz = dir.z * sd;

            const cx = t.x + dx;
            const cy = t.y + dy;
            const cz = t.z + dz;

            refRigid.current.setTranslation({ x:cx, y: cy, z: cz });
                }
        }
    });
}

export function Model({ talk="",name = "익명", position, animationName="Idle", rotationY=0 }) {
    const group = useRef()
    const refRigid = useRef();

    // const { nodes, materials, animations } = useGLTF('/Robot.glb')
    const { scene, /*nodes,*/ materials, animations } = useGLTF('/Robot.glb');
    const clone = useMemo(() => { return SkeletonUtils.clone(scene); }, [scene]);
    const { nodes } = useGraph(clone);

    const { actions } = useAnimations(animations, group);

    return (
        <>
            <RigidBody lockRotations ref={refRigid} colliders={false} /*position={position}*/>
                <CapsuleCollider args={[COLLEAGUE_HEIGH / 2 - COLLEAGUE_RADIUS, COLLEAGUE_RADIUS]} />
                <group ref={group} dispose={null} position-y={-COLLEAGUE_HEIGH / 2}>
                    <group name="Scene">
                        <group name="Armature" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
                            <skinnedMesh
                                name="Alpha_Joints"
                                geometry={nodes.Alpha_Joints.geometry}
                                material={materials.Alpha_Joints_MAT}
                                skeleton={nodes.Alpha_Joints.skeleton}>
                                <meshPhysicalMaterial
                                    color="white" metalness={1} roughness={0.2} clearcoat={1} clearcoatRoughness={0.2}/>
                            </skinnedMesh>
                            <skinnedMesh
                                name="Alpha_Surface"
                                geometry={nodes.Alpha_Surface.geometry}
                                material={materials.Alpha_Body_MAT}
                                skeleton={nodes.Alpha_Surface.skeleton}
                                
                            >
    <meshPhysicalMaterial
                                    color="white" side={THREE.DoubleSide} metalness={0} roughness={0} transmission={1} ior={1.7} thickness={4}/>
                            </skinnedMesh>
                            <primitive object={nodes.mixamorigHips} />
                        </group>
                        <Html wrapperClass='character-name'
                            position-y={COLLEAGUE_HEIGH + COLLEAGUE_HEIGH / 13} center>
                            <div className='name'>{name}</div>
                            {talk && <div key={talk} className='talk'>{talk}</div>}
                        </Html>
                    </group>
                </group>
            </RigidBody>
            <ApplyShadow refTarget={group} />
            <Animation actions={actions} refModel={group} refRigid={refRigid}
                animationName={animationName} position={position} rotationY={rotationY} />
        </>
    )
}

useGLTF.preload('/Robot.glb')
