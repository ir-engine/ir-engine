import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
export default class VolumetricPlayer {
    constructor(scene, file, audioFile, onLoaded, startScale = 1, startPosition = { x: 0, y: 0, z: 0 }, startRotation = { x: 0, y: 0, z: 0 }, castShadow = true, playOnStart = true, showFirstFrameOnStart = true, loop = true, startFrame = 0, endFrame = -1, frameRate = 60, speedMultiplier = 1) {
        this.startFrame = 0;
        this.currentFrame = 0;
        this.endFrame = 0;
        this.isPlaying = false;
        this.loader = new GLTFLoader();
        this.dracoLoader = new DRACOLoader();
        this.loop = true;
        this.audioMode = false;
        this.scene = scene;
        this.file = file;
        this.onLoaded = onLoaded;
        this.loop = loop;
        this.dracoLoader.setDecoderPath("https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/");
        this.loader.setDRACOLoader(this.dracoLoader);
        this.frameRate = frameRate;
        this.speedMultiplier = speedMultiplier;
        // load the model
        this.loader.load(file, (gltf) => {
            this.model = gltf.scene;
            this.hideAll();
            this.enableShadowCasting(castShadow);
            this.model.scale.multiplyScalar(startScale);
            this.model.position.set(startPosition.x, startPosition.y, startPosition.z);
            this.model.rotation.set(startRotation.x, startRotation.y, startRotation.z);
            this.model.children[startFrame].visible = showFirstFrameOnStart;
            this.currentFrame = startFrame;
            this.startFrame = startFrame;
            if (endFrame != -1)
                this.endFrame = endFrame;
            else
                this.endFrame = this.model.children.length;
            this.frameCount = this.endFrame - this.startFrame;
            // Add this model to the threejs scene
            this.scene.add(this.model);
            onLoaded();
            if (playOnStart)
                this.play();
        }, undefined, (error) => {
            console.error(error);
        });
        if (audioFile != null && audioFile.length > 0) {
            this.audio = document.createElement("audio");
            this.audio.addEventListener("loadedmetadata", function () { });
            this.audio.src = audioFile;
            this.audio.loop = this.loop;
            this.audioMode = true;
        }
    }
    play() {
        this.isPlaying = true;
        if (this.audioMode)
            this.audio.play();
        this.update();
    }
    pause() {
        this.isPlaying = false;
    }
    reset() {
        this.currentFrame = this.startFrame;
    }
    goToFrame(frame) {
        this.currentFrame = frame;
        this.frameObject = this.getObjectByCurrentFrame(this.currentFrame);
    }
    setSpeed(multiplyScalar) {
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
    fadeIn(stepLength = 0.1, fadeTime, currentTime = 0) {
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
    fadeOut(stepLength = 0.1, fadeTime, currentTime = 0) {
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
    lerp(v0, v1, t) {
        return v0 * (1 - t) + v1 * t;
    }
    hideAll() {
        this.model.traverse((node) => {
            if (node.isMesh || node.isLight) {
                node.visible = false;
            }
        });
    }
    enableShadowCasting(enable) {
        this.model.traverse((node) => {
            if (node.isMesh || node.isLight) {
                node.castShadow = enable;
                node.visible = false;
            }
        });
    }
    getObjectByCurrentFrame(index) {
        let name = "Frame_";
        name = name.concat(this.padFrameNumberWithZeros(index, 5));
        return this.scene.getObjectByName(name);
    }
    padFrameNumberWithZeros(n, width) {
        n = n + "";
        return n.length >= width
            ? n
            : new Array(width - n.length + 1).join("0") + n;
    }
    // Playback animation loop
    update() {
        if (!this.isPlaying)
            return;
        // If frameobject is not null, dispose of it
        if (!!this.frameObject) {
            this.frameObject.visible = false;
            this.frameObject.geometry.dispose();
            this.frameObject.material.map.dispose();
            this.frameObject.material.dispose();
        }
        if (this.audioMode) {
            this.currentFrame =
                Math.floor((this.audio.currentTime / this.audio.duration) * this.frameCount) + this.startFrame;
            this.frameObject = this.getObjectByCurrentFrame(this.currentFrame);
            this.frameObject.visible = true;
        }
        else {
            // Set to new frameobnject
            this.frameObject = this.getObjectByCurrentFrame(this.currentFrame++);
            this.frameObject.visible = true;
            if (this.currentFrame >= this.endFrame) {
                if (this.loop)
                    this.currentFrame = this.startFrame;
                else
                    this.isPlaying = false;
            }
        }
        setTimeout(() => {
            this.update();
        }, (1000 / this.frameRate) * this.speedMultiplier);
    }
}
