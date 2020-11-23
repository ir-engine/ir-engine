// // WIP
// // Props to Depthkit and Depthkit.js -- will make attribution better when this is fleshed out
// import glsl from 'glslify';
// import * as THREE from 'three';
// interface Props {
//     textureHeight: number;
//     textureWidth: number;
//     farClip: number;
//     nearClip: number;
//     defaultMeshScalar: number;
//     extrinsics: THREE.Matrix4;
//     depthFocalLength: any;
//     depthPrincipalPoint: any;
//     depthImageSize: any;
//     crop: any;
// }
// export class DepthVideoPlayer extends THREE.Object3D {
//     video: any;
//     manager: any;
//     meshScalar: number;
//     _instanceMesh: any | null = null;
//     _geometryLookup: any | null = null;
//     props: Props;
//     _material: any;
//     videoTexture: any;
//     mesh: any
//     constructor(props: Props) {
//         super();
//         this.props = props;
//         this.manager = new THREE.LoadingManager();
//         //video object created in the constructor so user may attach events
//         this.video = document.createElement('video');
//         this.video.id = 'depth-video';
//         this.video.crossOrigin = 'anonymous';
//         this.video.setAttribute('crossorigin', 'anonymous');
//         this.video.setAttribute('webkit-playsinline', 'webkit-playsinline');
//         this.video.setAttribute('playsinline', 'playsinline');
//         this.video.autoplay = false;
//         this.video.loop = false;
//         ///default value
//         this.meshScalar =  this.props.defaultMeshScalar
//         if (this._geometryLookup == null) {
//             this._geometryLookup = {};
//         }
//     }
//     setMeshScalar(_scalar: number) {
//         //
//         // _scalar - valid values 0, 1, 2, 3 
//         // 
//         if( _scalar > 3 )
//             _scalar = 3;
//         if( _scalar < 0 )
//             _scalar = 0;
//         // meshScalar values are 1, 2 ,4, 8 
//         // This ensures that meshScalar is never set to 0 
//         // and that vertex steps (computed in buildGeometry) are always pixel aligned.
//         var newScalar = Math.pow(2, Math.floor(_scalar));
//         if( this.meshScalar != newScalar )
//         {
//             this.meshScalar = newScalar;
//             this.buildGeometry();
//         }
//     }
//     buildGeometry() {
//         const vertsWide = (this.props.textureWidth / this.meshScalar) + 1;
//         const vertsTall = (this.props.textureHeight / this.meshScalar) + 1;
//         let instanceGeometry;
//         if (this.geometryBufferExistsInLookup(vertsWide * vertsTall)) {
//             instanceGeometry = this._geometryLookup[vertsWide * vertsTall];
//         } else {
//             instanceGeometry = this.createGeometryBuffer(vertsWide, vertsTall);
//             this._geometryLookup[vertsWide * vertsTall] = instanceGeometry;
//         }
//         if( this._instanceMesh == null)
//         {
//             this._instanceMesh = new THREE.Mesh(instanceGeometry, this._material);
//             this._instanceMesh.frustumCulled = false
//             // create pivot and parent the mesh to the pivot
//             //
//             //pivot creation 
//             //
//             var pivot = new THREE.Object3D();
//             pivot.frustumCulled = false;
//             pivot.position.z = -((this.props.farClip - this.props.nearClip)/2.0) - this.props.nearClip;
//             this.add(pivot);
//             pivot.add(this._instanceMesh);
//         }
//         else
//         {
//             this._instanceMesh.geometry = instanceGeometry;
//         }
//     }
//     createGeometryBuffer(_vertsWide: number, _vertsTall: number) {
//         const vertexStep = new THREE.Vector2(this.meshScalar / this.props.textureWidth, this.meshScalar / this.props.textureHeight)
//         let _geometry = new THREE.Geometry();
//         for (let y = 0; y < _vertsTall; y++) {
//             for (let x = 0; x < _vertsWide; x++) {
//                 _geometry.vertices.push(new THREE.Vector3(x * vertexStep.x, y * vertexStep.y, 0));
//             }
//         }
//         for (let y = 0; y < _vertsTall - 1; y++) {
//             for (let x = 0; x < _vertsWide - 1; x++) {
//                 _geometry.faces.push(
//                     new THREE.Face3(
//                         x + y * _vertsWide,
//                         x + (y + 1) * _vertsWide,
//                         (x + 1) + y * _vertsWide
//                     ));
//                 _geometry.faces.push(
//                     new THREE.Face3(
//                         x + 1 + y * _vertsWide,
//                         x + (y + 1) * _vertsWide,
//                         (x + 1) + (y + 1) * _vertsWide
//                     ));
//             }
//         }
//         return _geometry;
//     }
//     geometryBufferExistsInLookup(meshWxH: any) {
//         for (let lookupKey in Object.keys(this._geometryLookup)) {
//             if (meshWxH === lookupKey) {
//                 return true;
//             }
//         }
//         return false;
//     }
//     buildMaterial() {
//         //Load the shaders
//         let rgbdFrag = glsl.file('./shaders/rgbd.frag');
//         let rgbdVert = glsl.file('./shaders/rgbd.vert');
//         const extrinsics = new THREE.Matrix4();
//         const ex = this.props.extrinsics.elements;
//         extrinsics.set(
//             ex[0], ex[4], ex[8], ex[12],
//             ex[1], ex[5], ex[9], ex[13],
//             ex[2], ex[6], ex[10], ex[14],
//             ex[3], ex[7], ex[11], ex[15]
//         );
//         const extrinsicsInv = new THREE.Matrix4();
//         extrinsicsInv.getInverse(extrinsics);
//         //Material
//         this._material = new THREE.ShaderMaterial({
//             uniforms: {
//                 "map": {
//                     value: this.videoTexture
//                 },
//                 "time": {
//                     value: 0.0
//                 },
//                 "nearClip": {
//                     value: this.props.nearClip
//                 },
//                 "farClip": {
//                     value: this.props.farClip
//                 },
//                 "meshScalar": {
//                     value: this.meshScalar
//                 },
//                 "focalLength": {
//                     value: this.props.depthFocalLength
//                 },
//                 "principalPoint": {
//                     value: this.props.depthPrincipalPoint
//                 },
//                 "imageDimensions": {
//                     value: this.props.depthImageSize
//                 },
//                 "extrinsics": {
//                     value: extrinsics
//                 },
//                 "extrinsicsInv": {
//                     value: extrinsicsInv
//                 },
//                 "crop": {
//                     value: this.props.crop
//                 },
//                 "width": {
//                     value: this.props.textureWidth
//                 },
//                 "height": {
//                     value: this.props.textureHeight
//                 },
//                 "opacity": {
//                     value: 1.0
//                 }
//             },
//             vertexShader: rgbdVert,
//             fragmentShader: rgbdFrag,
//             transparent: true
//         });
//         //Make the shader material double sided
//         this._material.side = THREE.DoubleSide;
//     }
//     loadVideo(_src: string) {
//         this.video.src = _src;
//         this.video.load();
//     }
//     createVideoTexture() {
//         const videoTex = new THREE.VideoTexture(this.video);
//         videoTex.minFilter = THREE.NearestFilter;
//         videoTex.magFilter = THREE.LinearFilter;
//         videoTex.format = THREE.RGBFormat;
//         videoTex.generateMipmaps = false;
//         return videoTex;
//     }
//     load(_props: any, _movieUrl: string, _onComplete: any, _onError: any) {
//         this.loadVideo(_movieUrl);
//         this.videoTexture = this.createVideoTexture();
//         if (this.isJson(_props)) {
//             const jsonProps = JSON.parse(_props);
//             this.setProps(jsonProps);
//             this.createMesh();
//             if (_onComplete) {
//                 _onComplete(this);
//             }
//         } else {
//             this.loadPropsFromFile(_props).then(props => {
//                 this.setProps(props);
//                 this.createMesh();
//                 if (_onComplete) {
//                     _onComplete(this);
//                 }
//             }).catch(err => {
//                 if (_onError) {
//                     _onError(err);
//                 } else {
//                     console.error(err);
//                 }
//             })
//         }
//     }
//     createMesh() {
//         this.buildMaterial();
//         this.buildGeometry();
//         this.children[0].frustumCulled = false;
//         this.children[0].name = 'depthvideo';
//     }
//     loadPropsFromFile(filePath: string) {
//         return new Promise((resolve, reject) => {
//             const jsonLoader = new THREE.FileLoader(this.manager);
//             jsonLoader.setResponseType('json');
//             jsonLoader.load(filePath, data => {
//                 resolve(data);
//             }, null, err => {
//                 reject(err);
//             });
//         });
//     }
//     isJson(item: any) {
//         item = typeof item !== "string"
//             ? JSON.stringify(item)
//             : item;
//         try {
//             item = JSON.parse(item);
//         } catch (e) {
//             return false;
//         }
//         if (typeof item === "object" && item !== null) {
//             return true;
//         }
//         return false;
//     }
//     setProps(_props: any) {
//         this.props = _props;
//         if (this.props.textureWidth == undefined || this.props.textureHeight == undefined) {
//             this.props.textureWidth = this.props.depthImageSize.x;
//             this.props.textureHeight = this.props.depthImageSize.y * 2;
//         }
//         if (this.props.extrinsics == undefined) {
//             this.props.extrinsics = new THREE.Matrix4();
//         }
//         if (this.props.crop == undefined) {
//             this.props.crop = { x: 0, y: 0, z: 1, w: 1 };
//         }
//     }
//     setOpacity(opacity: number) {
//         this._material.uniforms.opacity.value = opacity;
//     }
//     /*
//     * Video Player methods
//     */
//     play() {
//         if (!this.video.isPlaying) {
//             this.video.play();
//         } else {
//             console.warn('Can not play because the character is already playing');
//         }
//     }
//     stop() {
//         this.video.currentTime = 0.0;
//         this.video.pause();
//     }
//     pause() {
//         this.video.pause();
//     }
//     setLoop(isLooping: boolean) {
//         this.video.loop = isLooping;
//     }
//     setVolume(volume: number) {
//         this.video.volume = volume;
//     }
//     update(time: number) {
//         this._material.uniforms.time.value = time;
//     }
//     dispose() {
//         //Remove the mesh from the scene
//         try {
//             this.mesh.parent.remove(this.mesh);
//         } catch (e) {
//             console.warn(e);
//         } finally {
//             this.mesh.traverse((child: { geometry: { dispose: () => void; }; material: { dispose: () => void; }; }) => {
//                 if (child.geometry !== undefined) {
//                     child.geometry.dispose();
//                     child.material.dispose();
//                 }
//             });
//         }
//     }
// }
