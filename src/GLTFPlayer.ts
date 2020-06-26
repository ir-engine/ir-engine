import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

export class GLTFPlayer {
  mesh: any;
  model: any;
  gltf: any;

  startFrame = 0;
  currentFrame = 0;
  endFrame = 0;
  isPlaying: boolean = false;
  frameObject: any;

  loader = new GLTFLoader();
  dracoLoader = new DRACOLoader();

  scene: any;
  file: any;
  frameRate: number;
  onLoaded: any;
  loop: boolean = true;

  speedMultiplier: number;

  play() {
    this.isPlaying = true;
    this.update();
  }

  pause() {
    this.isPlaying = false;
  }

  reset() {
    this.currentFrame = this.startFrame;
  }

  goToFrame(frame: number) {
    this.currentFrame = frame;
    this.frameObject = this.getObjectByCurrentFrame(this.currentFrame);
  }

  setSpeed(multiplyScalar: number) {
    this.speedMultiplier = multiplyScalar;
  }

  show() {
    this.frameObject = this.getObjectByCurrentFrame(this.currentFrame);
    this.frameObject.visible = true;
  }

  hide() {
    this.hideAll();
    this.pause();
  }

  fadeIn(stepLength: number = 0.1, fadeTime: number, currentTime: number = 0) {
    this.play();
    const val = this.lerp(0, 1, currentTime / fadeTime);
    this.frameObject.material.opacity = val;
    if (currentTime >= fadeTime) {
      this.frameObject.material.opacity = 1;
      return;
    }

    currentTime = currentTime + stepLength * fadeTime;

    setTimeout(() => {
      this.fadeIn(fadeTime, currentTime);
    }, stepLength * fadeTime);
  }

  fadeOut(stepLength: number = 0.1, fadeTime: number, currentTime: number = 0) {
    const val = this.lerp(1, 0, currentTime / fadeTime);
    this.frameObject.material.opacity = val;

    currentTime = currentTime + stepLength * fadeTime;

    if (currentTime >= fadeTime) {
      this.frameObject.material.opacity = 0;
      this.pause();
      return;
    }

    setTimeout(() => {
      this.fadeOut(fadeTime, currentTime);
    }, stepLength * fadeTime);
  }

  lerp(v0: number, v1: number, t: number) {
    return v0 * (1 - t) + v1 * t;
  }

  hideAll() {
    this.model.traverse((node: any) => {
      if (node.isMesh || node.isLight) {
        node.visible = false;
      }
    });
  }

  enableShadowCasting(enable: boolean) {
    this.model.traverse((node: any) => {
      if (node.isMesh || node.isLight) {
        node.castShadow = enable;
        node.visible = false;
      }
    });
  }

  constructor(
    scene: any,
    file: string,
    onLoaded: any,
    startScale: number = 1,
    startPosition: { x: any; y: any; z: any } = { x: 0, y: 0, z: 0 },
    castShadow: boolean = true,
    playOnStart: boolean = true,
    showFirstFrameOnStart: boolean = true,
    loop: boolean = true,
    startFrame: number = 0,
    endFrame: number = -1,
    frameRate: number = 60,
    speedMultiplier: number = 1
  ) {
    this.scene = scene;
    this.file = file;
    this.onLoaded = onLoaded;
    this.loop = loop;
    this.dracoLoader.setDecoderPath(
      "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/"
    );
    this.loader.setDRACOLoader(this.dracoLoader);
    this.frameRate = frameRate;
    this.speedMultiplier = speedMultiplier;

    // load the model
    this.loader.load(
      file,
      (gltf) => {
        this.model = gltf.scene;

        this.hideAll();
        this.enableShadowCasting(castShadow);

        this.model.scale.multiplyScalar(startScale);
        this.model.position.set(
          startPosition.x,
          startPosition.y,
          startPosition.z
        );

        this.model.children[startFrame].visible = showFirstFrameOnStart;
        this.currentFrame = startFrame;
        this.startFrame = startFrame;

        if (endFrame != -1) this.endFrame = endFrame;
        else this.endFrame = this.model.children.length;

        // Add this model to the threejs scene
        this.scene.add(this.model);

        onLoaded();
        if (playOnStart) this.play();
      },
      undefined,
      (error) => {
        console.error(error);
      }
    );
  }

  getObjectByCurrentFrame(index: number) {
    let name = "Frame_";
    name = name.concat(this.padFrameNumberWithZeros(index, 4));
    return this.scene.getObjectByName(name);
  }

  padFrameNumberWithZeros(n: any, width: number) {
    n = n + "";
    return n.length >= width
      ? n
      : new Array(width - n.length + 1).join("0") + n;
  }

  // Playback animation loop
  update() {
    if (!this.isPlaying) return;
    // If frameobject is not null, dispose of it
    if (!!this.frameObject) {
      this.frameObject.visible = false;
      this.frameObject.geometry.dispose();
      this.frameObject.material.map.dispose();
      this.frameObject.material.dispose();
    }

    // Set to new frameobnject
    this.frameObject = this.getObjectByCurrentFrame(this.currentFrame++);
    this.frameObject.visible = true;

    if (this.currentFrame >= this.endFrame) {
      if (this.loop) this.currentFrame = this.startFrame;
      else this.isPlaying = false;
    }

    setTimeout(() => {
      this.update();
    }, (1 / this.frameRate) * this.speedMultiplier);
  }
}
