import * as THREE from 'three';
import React, { useEffect, useRef, useState } from 'react';

// import { unstable_createResource as createResource } from "../../resources/cache";
// import { Encoder } from "three/examples/jsm/loaders/GLTFLoader";
import ReactDOM from 'react-dom';
import {
  Canvas,
  useFrame,
  useThree,
  extend,
  ReactThreeFiber,
} from 'react-three-fiber';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { DracosisPlayer } from 'three-volumetric/dist/three-volumetric';

extend({ OrbitControls });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      orbitControls: ReactThreeFiber.Object3DNode<
        OrbitControls,
        typeof OrbitControls
      >;
    }
  }
  var loaded: boolean;
  var model: any;
}

function LoadPlayer() {
  var callback = function () {
    console.log('drc');
  };
  const { scene } = useThree();

  // var renderer = new THREE.WebGLRenderer();
  // var scene = new THREE.Scene();
  new DracosisPlayer(
    scene,
    '../public/assets/new_sample.drcs',
    callback,
    true,
    true,
    0,
    -1,
    1,
    100
  );

  const mesh: any = useRef();
  return <mesh></mesh>;
}

function Box(props: any) {
  // This reference will give us direct access to the mesh
  const mesh: any = useRef();

  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);

  // Rotate mesh every frame, this is outside of React without overhead
  useFrame(() => (mesh.current.rotation.x = mesh.current.rotation.y += 0.01));

  return (
    <mesh
      {...props}
      ref={mesh}
      scale={active ? [1.5, 1.5, 1.5] : [1, 1, 1]}
      onClick={(e) => setActive(!active)}
      onPointerOver={(e) => setHover(true)}
      onPointerOut={(e) => setHover(false)}
    >
      <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
      <meshStandardMaterial
        attach="material"
        color={hovered ? 'hotpink' : 'orange'}
      />
    </mesh>
  );
}

export function Controls() {
  const ref: any = useRef();
  const { camera, gl } = useThree();
  useFrame(() => ref.current.update());
  return (
    <orbitControls
      ref={ref}
      args={[camera, gl.domElement]}
      enableDamping
      dampingFactor={0.1}
      rotateSpeed={0.8}
    />
  );
}

function App(props: any) {
  useEffect(() => {
    ReactDOM.render(
      <Canvas camera={{ position: [0, 0, -5], up: [0, 1, 0] }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[1, 1, 1]} />
        {/* <Box position={[0, 0, 0]} /> */}
        <LoadPlayer />
        <Controls />
      </Canvas>,
      document.getElementById('root')
    );
  }, []);

  return <div className="App"></div>;
}

export default App;
