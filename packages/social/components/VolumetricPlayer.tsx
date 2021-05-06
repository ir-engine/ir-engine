import Player from "volumetric/src/Player";

import React, { useEffect, useRef, useState } from 'react';
import { PerspectiveCamera, Scene, sRGBEncoding, Vector3, WebGLRenderer } from "three";
// import { THREETrackballControls } from "@xrengine/engine/src/input/classes/THREETrackballControls";

interface VolumetricPlayerProps extends React.HTMLAttributes<any> {
  meshFilePath: string,
  videoFilePath: string,
  cameraVerticalOffset?: number
}

export const VolumetricPlayer = (props: VolumetricPlayerProps) => {
  const [ playPressed, setPlayPressed ] = useState(false);
  const containerRef = useRef<HTMLDivElement>();
  const rendererRef = useRef<WebGLRenderer>(null);
  const playerRef = useRef<Player>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferingProgress, setBufferingProgress] = useState(0);
  let animationFrameId:number;
  const cameraVerticalOffset = props.cameraVerticalOffset || 0;
  // const mesh: any = useRef();

  useEffect(() => {
    const container = containerRef.current;
    if (typeof container === "undefined") {
      return;
    }
    let w = container.clientWidth,
      h = container.clientHeight;
    const scene = new Scene(),
      camera = new PerspectiveCamera(35, w / h, 0.001, 100),
      // controls = new THREETrackballControls(camera, container),
      renderConfig = { antialias: true, alpha: true };
    if (!rendererRef.current) {
      rendererRef.current = new WebGLRenderer(renderConfig);
    }
    let renderer = rendererRef.current;
    renderer.outputEncoding = sRGBEncoding;
    // controls.target = new Vector3(0, 1.7, 0.75);
    // controls.panSpeed = 0.4;
    camera.position.set(0, 1.7, 6);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);
    container.appendChild(renderer.domElement);
    const onResize = function () {
      w = container.clientWidth;
      h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      setCameraOffset();
    };
    window.addEventListener('resize',onResize);

    /**
     * shift camera from it's center
     */
    function setCameraOffset() {
      const fullWidth = w;
      const fullHeight = h + h * Math.abs(cameraVerticalOffset);
      const width = w;
      const height = h;
      const x = 0;
      const y = h * cameraVerticalOffset;
      /*
      fullWidth — full width of multiview setup
      fullHeight — full height of multiview setup
      x — horizontal offset of subcamera
      y — vertical offset of subcamera
      width — width of subcamera
      height — height of subcamera
       */
      camera.setViewOffset( fullWidth, fullHeight, x, y, width, height);
    }
    setCameraOffset();

    function render() {
      requestAnimationFrame(render);
      playerRef.current?.handleRender(() => {
        renderer.render(scene, camera);
      });
      // controls.update();
    }

    console.log('create new player');
    if (!playerRef.current) {
      playerRef.current = new Player({
        scene,
        renderer,
        meshFilePath: props.meshFilePath,
        videoFilePath: props.videoFilePath,
        onMeshBuffering: (progress) => {
          console.warn('BUFFERING!!', progress);
          setBufferingProgress(Math.round(progress * 100));
          setIsBuffering(true);
        },
        onFrameShow: () => {
          setIsBuffering(false);
        }
        // video: document.getElementById("video")
      });
    }
    const DracosisSequence = playerRef.current;

    render();
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animationFrameId);
      // controls.dispose();
      // clear volumetric player
      DracosisSequence.dispose();
      playerRef.current = null;
      setIsBuffering(false);
    };
  }, []);

  // this is play button
  const playButton = playPressed? null : <button type="button" style={{ position: "absolute", zIndex: 100000, left: "50%", top: "50%"}} onClick={(e) => { playerRef.current?.play(); setPlayPressed(true); }}>Play</button>;
  const bufferingIndication = isBuffering ? <div style={{ position: "absolute", zIndex: 100000, left: "0", bottom: "0"}}>Buffering: {bufferingProgress}%</div> : null;

  return <div className="volumetric__player" style={{ zIndex: -1, width: '100%', height: '100%'}} ref={containerRef}>
    { playButton }
    { bufferingIndication }
    {/* <video src={props.videoFilePath} playsInline id="video" style={{display: "none"}}></video> */}
  </div>;
};
