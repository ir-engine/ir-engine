# three-volumetric
Right now this repo is in a transition state. We have demos and tests running files from several different vendors in AR, VR and mobile, but we are transitioning to an npm-installable package to run volumetric from any vendor where we can mediate an open-source playback solution.


To install with NPM
```
npm install three-volumetric
```

Or reference dist/three-volumetric.js

## MeshTextureSequencePlayer

Play back from DRACO-compressed GLTF (good for short-ish looping sequences, 10-20 seconds)

```
import { MeshTextureSequencePlayer } from 'three-volumetric'
const player = new MeshTextureSequencePlayer(<constructor parameters>);
player.play()

```

Available constructor options for MeshTextureSequencePlayer
```
        scene: any,
        file: string,
        onLoaded: any,
        startScale: number = 1,
        startPosition: { x: any, y: any, z: any } = { x: 0, y: 0, z: 0 },
        castShadow: boolean = true,
        playOnStart: boolean = true,
        showFirstFrameOnStart: boolean = true,
        loop: boolean = true,
        startFrame: number = 0,
        endFrame: number = -1,
        speedMultiplier: number = 1,
```

## DepthVideoPlayer

Play back top-bottom stacked RGB+D video

```
import { DepthVideoPlayer } from 'three-volumetric'
const player = new DepthVideoPlayer ({ <constructor props>});
volplayercap.play()

```

Constructor props:
```
    textureHeight: number;
    textureWidth: number;
    farClip: number;
    nearClip: number;
    defaultMeshScalar: number;
    extrinsics: THREE.Matrix4;
    depthFocalLength: any;
    depthPrincipalPoint: any;
    depthImageSize: any;
    crop: any;
```

(In development)