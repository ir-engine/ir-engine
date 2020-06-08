import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

export default class VolumetricPlayer {
    mesh: any;
    model: any;
    gltf: any;

    startFrame = 0;
    currentFrame = 0;
    endFrame = 0;
    isPlaying: boolean = false;

    loader = new GLTFLoader();
    dracoLoader = new DRACOLoader();

    scene: any;
    file: any;
    onLoaded: any;
    loop: boolean = true

    constructor(
        scene: any,
        file: string,
        onLoaded: any,
        startScale: number = 1,
        startPosition: { x: any, y: any, z: any } = { x: 0, y: 0, z: 0 },
        castShadow: boolean = true,
        showFirstFrameOnStart: boolean = true,
        loop: boolean = true,
        startFrame: number = 0,
        endFrame: number = -1
    ) {
        this.scene = scene;
        this.file = file;
        this.onLoaded = onLoaded;
        this.loop = loop;
        this.loader.setDRACOLoader(this.dracoLoader);

        // load the model
        this.loader.load(file, (data) => {
            this.model = data.scene;

            this.model.traverse((node: any) => {
                if (node.isMesh || node.isLight) {
                    node.castShadow = castShadow;
                    node.visible = false;
                }
            });

            this.model.scale.multiplyScalar(startScale);
            this.model.position = startPosition;
            
            this.model.children[startFrame].visible = showFirstFrameOnStart; 
            this.currentFrame = startFrame;
            this.startFrame = startFrame; 

            if(endFrame != -1) this.endFrame = endFrame;
            else this.endFrame = this.model.children.length;

            // Add this model to the threejs scene
            this.scene.add(this.model);

            onLoaded();

        }, undefined, (error) => {
            console.error(error);
        });
    }

    getName(index: any) {
        let name = "Frame_0";
        if (index < 10) name += "00" + index;
        else if (index < 100) name += "0" + index;
        else name += index;
        return name;
    }

    update() {
        if(!this.isPlaying) return;
        this.scene.getObjectByName(this.getName(this.currentFrame)).visible = false;
        this.scene.getObjectByName(this.getName(this.currentFrame)).geometry.dispose()
        this.scene.getObjectByName(this.getName(this.currentFrame)).material.map.dispose()
        this.scene.getObjectByName(this.getName(this.currentFrame)).material.dispose()

        this.currentFrame++;
        if (this.currentFrame >= this.endFrame) {
            if (this.loop) this.currentFrame = this.startFrame;
            else this.isPlaying = false;
        }
        this.scene.getObjectByName(this.getName(this.currentFrame)).visible = true;
    }
}
