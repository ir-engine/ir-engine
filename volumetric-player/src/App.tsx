import * as THREE from 'three';
import React, { useEffect, useRef, useState, Suspense } from 'react';

// import { unstable_createResource as createResource } from "../../resources/cache";
// import { Encoder } from "three/examples/jsm/loaders/GLTFLoader";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import {  draco } from 'drei'
import { UnsignedByteType, PMREMGenerator } from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'

import ReactDOM from 'react-dom';
import {
  Canvas,
  useFrame,
  useThree,
  extend,
  ReactThreeFiber,
  useLoader
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
  const { scene, gl } = useThree();

  const mesh: any = useRef();

  const DracosisSequence = new DracosisPlayer({
    scene,
    renderer: gl,
    // filePath: 'https://s3-us-west-1.amazonaws.com/wildcapture.io/files/hula_med_590_1k.drcs',
    filePath: 'http://localhost:8000/dracosis',
    onLoaded: callback,
    playOnStart: true,
    loop: true,
    startFrame: 0,
    endFrame: -1,
    scale: 0.001,
    frameRate: 10,
    speedMultiplier: 1,
    bufferSize: 80,
    serverUrl: 'http://localhost:8000',
    audioUrl:"https://cssing.org.ua/captainmorgan_audio09.mp3"
  });
  // this is play button
  return <mesh
         onClick={(e) => DracosisSequence.play()}
        >
          <boxBufferGeometry attach="geometry" args={[0.2, 0.2, 0.2]} />
          <meshStandardMaterial
            attach="material"
            side={THREE.DoubleSide}
            color={'orange'}
          />
        </mesh>;
}

function Box(props: any) {
  // This reference will give us direct access to the mesh
  const mesh: any = useRef();

  // Set up state for the hovered and active state
  // const [hovered, setHover] = useState(false);
  // const [active, setActive] = useState(false);

  // Rotate mesh every frame, this is outside of React without overhead
  // useFrame(() => (mesh.current.rotation.x = mesh.current.rotation.y += 0.01));

  return (
    <mesh
      {...props}
      ref={mesh}
      scale={[10, 10, 10]}
      // onClick={(e) => setActive(!active)}
      // onPointerOver={(e) => setHover(true)}
      // onPointerOut={(e) => setHover(false)}
    >
      <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
      <meshStandardMaterial
        attach="material"
        side={THREE.DoubleSide}
        color={'hotpink'}
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

function Room(props: any){
  const ref = useRef()
  const hdri = 'wide_street_01_1k.hdr';

  const { gl, scene } = useThree()
  const pmremGenerator = new PMREMGenerator(gl)
  const loader = new RGBELoader()
  loader.setDataType(UnsignedByteType)
  pmremGenerator.compileEquirectangularShader()

  useEffect(() => {
     loader.load(hdri, texture => {
        const envMap = pmremGenerator.fromEquirectangular(texture).texture
        texture.encoding = THREE.sRGBEncoding;
        scene.background = envMap
        // one can also set scene.background/envmap to envMap here

        texture.dispose()
        pmremGenerator.dispose()
     })
  }, [scene, loader, pmremGenerator])

  const gltf = useLoader(GLTFLoader, '/room.glb', draco()) as any;
  return <primitive position={[0,0.45,0]} object={gltf.scene}/>
}

function App(props: any) {
  useEffect(() => {
    ReactDOM.render(
      <Canvas 
      camera={{ position: [0, 0, -5], up: [0, 1, 0] }}
      gl={{
        powerPreference: "high-performance",
        stencil: false,
        antialias: true,
      }}
      onCreated={({ gl, scene }) => {
        // gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.outputEncoding = THREE.sRGBEncoding
        // scene.background = new THREE.Color('#373737')
        //scene.background.convertSRGBToLinear()
      }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[1, 1, 1]} />
        <directionalLight position={[0.5, 0, 0.866]} />
        <LoadPlayer />
        <Suspense fallback={null}>
          <Room />
        </Suspense>
        <Controls />
      </Canvas>,
      document.getElementById('root')
    );
  }, []);

  return <div className="App"></div>;
}

export default App;
