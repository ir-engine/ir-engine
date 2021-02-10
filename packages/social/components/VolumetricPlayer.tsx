import DracosisPlayer from "@xr3ngine/volumetric/src/Player";
import React, { useEffect } from 'react';
import { PerspectiveCamera, Scene, Vector3, WebGLRenderer } from "three";
import { THREETrackballControls } from "@xr3ngine/engine/src/input/classes/THREETrackballControls";

interface VolumetricPlayerProps extends React.HTMLAttributes<any> {
  meshFilePath: string,
  videoFilePath: string
}

export const VolumetricPlayer = (props: VolumetricPlayerProps) => {


  // const mesh: any = useRef();

  useEffect(() => {
    var container = document.querySelector('body'),
      w = container.clientWidth,
      h = container.clientHeight,
      scene = new Scene(),
      camera = new PerspectiveCamera(75, w / h, 0.001, 100),
      controls = new THREETrackballControls(camera, container),
      renderConfig = { antialias: true, alpha: true },
      renderer = new WebGLRenderer(renderConfig);
    controls.target = new Vector3(0, 0, 0.75);
    controls.panSpeed = 0.4;
    camera.position.set(0, 0, -10);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);
    container.appendChild(renderer.domElement);
    window.addEventListener('resize', () => {
      w = container.clientWidth;
      h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });

    function render() {
      requestAnimationFrame(render);
      renderer.render(scene, camera);
      controls.update();
    }

    console.log('create new player');
    const DracosisSequence = new DracosisPlayer({
      scene,
      renderer,
      meshFilePath: props.meshFilePath,
      videoFilePath: props.videoFilePath
    });

    render();
    DracosisSequence.play();

    return () => {
      // clear volumetric player
      // DracosisSequence.dispose();
    };
  }, []);

  // this is play button
  // onClick={(e) => DracosisSequence.play()}
  return null;
};