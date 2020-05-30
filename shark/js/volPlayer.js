const tmpGeometry = new THREE.BufferGeometry();
const textureLoader = new THREE.TextureLoader();
const gltfLoader = new THREE.GLTFLoader();

class VolPlayer extends THREE.Object3D {

    constructor({frames}, FRAME_RATE, ASSET_TYPE, ASSET_OBJECT_PATH, ASSET_TEXTURE_PATH, AUDIO_PLAYING_FLAG, AUDIO_FILE) {

        super();

        this.frameRate = FRAME_RATE;
        const decodedFrames = frames.reduce((accum, frame) => {
            
            accum.frames.push({
                paths: [frame.mesh],
                texturePaths: [frame.texture],
                geometry: null
            });

            return accum;
        }, { frames: [] });

        this._baseObjectURL = ASSET_OBJECT_PATH;
        this._baseTextureURL = ASSET_TEXTURE_PATH;
        this._assetType = ASSET_TYPE;
        this._frames = decodedFrames.frames;

        this._audioFlag = AUDIO_PLAYING_FLAG;
        this._audioURL = AUDIO_FILE;
        
        this._playing = true;
        this._curFrame = 0;
        this._lastFrame = 0;
        this._framesSufficientForPlaying = false;
        this._framesCount = 0;

        this._audioInitialized = false;

        this._audio = new Audio(this._audioURL);
        this._audio.load();
        this._audio.loop = true;
        this._audioPlaying = false;
        this._audioFrametime = 0;
        
        this._frameTime = 1000 / (this.frameRate || 30);
        this._lastFrameTime = 0;

        const frameCount = this._frames.length;

        this._geometryForwardCount = Math.floor(frameCount * 0.4);
        
        const holder = new THREE.Object3D();
        
        const material = new THREE.MeshStandardMaterial();
        material.side = THREE.DoubleSide;
        material.needsUpdate = true;

        this.add(holder);

        this._frames.forEach((frame) => {
            frame.geometryPending = false;
        });

        const frame = this._frames[0];

        const onReady = loadFirstFrame({ holder, material, frame, baseObjectURL: ASSET_OBJECT_PATH, baseTextureURL: ASSET_TEXTURE_PATH, assetType: ASSET_TYPE });

        this._onReady = onReady;

    };

    get onReady() { return this._onReady; }

    _isAudioValid() {
        return this._audio && this._audio.duration > 0 && isFinite(this._audio.duration);
    }

    _preload() {
        const { onNextFrameLoaded } = loadNextFrame({ baseObjectURL: this._baseObjectURL, baseTextureURL: this._baseTextureURL, 
                        assetType: this._assetType, frames: this._frames, currentFrame: this._curFrame });

        onNextFrameLoaded.then(() => {
            let framesCount = 0;
            let curFrame = this._curFrame;

            for (let i = 0; i < this._frames.length; i++) {
                let frame = this._frames[curFrame];

                if (frame.geometry)
                    framesCount++;
                else
                    break;

                curFrame++;
                if (curFrame >= this._frames.length)
                    curFrame = 0;
            }

            this._framesSufficientForPlaying = (framesCount > this._geometryForwardCount);

        });
    }

    getCurrentFrame() {
        return this._curFrame;
    }

    update() {
        
        const curTime = new Date().getTime();

        this._preload();

        const frameGeometry = this._frames[this._curFrame].geometry;
        const frameCount = this._frames.length - 1;

        if (curTime < this._lastFrameTime + this._frameTime) {
            return;
        }

        if (this._playing && this._framesSufficientForPlaying) {

            if (!this._audioPlaying && this._audio && this._audioFlag) {
                
                this._audioPlaying = true;
                this._audio.play().then(params => {
                     this._audioFrametime = this._audio.duration / frameCount;
                }).catch(() => {
                    this._audioPlaying = false;
                });
            }

            const holder = this.children[0];

            if(frameGeometry != null) {

                for (let i = 0, len = frameGeometry.length; i < len; i++) {
                    holder.children[i].geometry = frameGeometry[i];
                    // holder.children[i].material.map = frameGeometry[i].materialMap;
                    // holder.children[i].material.needsUpdate = true;
                
                    setTexture(holder.children[i]);
                }

            }

            this._lastFrame = this._curFrame;
            this._lastFrameTime = new Date().getTime();
            this._curFrame++;

        } 
        else {
            if (this._isAudioValid() && this._audioPlaying) {
                this._audioPlaying = false;
                this._audio.pause();
            }
        }

        if (this._curFrame >= frameCount) {
            this._curFrame = 0;
        }
    }

    dispose() {

        for (let i = 0; i < this._frames.length; i++) {
            let frame = this._frames[i];
            if (frame.geometry) {
                frame.geometry.forEach(geometry => { 
                    geometry.texture.dispose()
                    geometry.dispose()
                
                });
            }
        }
        this.holder = null;
        this._curFrame = 0;
    
    }

}    

function loadNextFrame({ baseObjectURL, baseTextureURL, assetType, frames, currentFrame }) {
    let resolveNextFrameLoaded;
    const onNextFrameLoaded = new Promise((resolve, reject) => { resolveNextFrameLoaded = resolve; });

    let curFrame = currentFrame;
    for (let i = 0; i < frames.length; i++) {
        let frame = frames[curFrame];

        if (!frame.geometry && !frame.geometryPending) {

            loadSingleFrame({ frame, baseObjectURL, baseTextureURL, assetType }).then(geometries => {
                resolveNextFrameLoaded();
            });

            return { onNextFrameLoaded };
        }

        curFrame++;
        if (curFrame >= frames.length)
            curFrame = 0;
    }

    return { onNextFrameLoaded };
}

function loadFirstFrame({ holder, material, frame, baseObjectURL, baseTextureURL, assetType }) {
    let resolveFirst;

    const onReady = new Promise(resolve => { resolveFirst = resolve; });

    let isReady = false;

    (function loadSelf() {

        loadSingleFrame({ frame, baseObjectURL, baseTextureURL, assetType }).then(geometries => {

            const requiredGeometries = geometries.length - holder.children.length;

            if (requiredGeometries > 0) {
                for (let i = 0; i < requiredGeometries; i++) {
    
                    const mesh = new THREE.Mesh(tmpGeometry, material);
                    mesh.castShadow = true;
                    holder.add(mesh);
    
                }
            }

            geometries.forEach((geometry, i) => {
                holder.children[i].geometry = geometry;
                // holder.children[i].material.map = geometry.materialMap;
                // holder.children[i].material.needsUpdate = true;
                setTexture(holder.children[i]);

            });

            if (!isReady) {
                resolveFirst(this);
                isReady = true;
            }

        });
    })();

    return onReady;
}

function loadSingleFrame({ frame, baseObjectURL, baseTextureURL, assetType }) {
    const path = frame.paths[frame.paths.length - 1];
    const texturePath = frame.texturePaths[frame.texturePaths.length -1];

    if (!path) return new Promise(resolve => resolve(frame.geometry));

    frame.geometryPending = true;

    return loadGeometries({ path, texturePath, baseObjectURL, baseTextureURL, assetType }).then(geometries => {
        if (frame.geometry) {
            frame.geometry.forEach(geometry => { 
                geometry.texture.dispose()
                geometry.dispose()
            
            });
        }
        frame.geometry = geometries;
        frame.geometryPending = false;
        return geometries;
    }).catch(error => {
        frame.geometryPending = false;
    });
}

function loadGeometries({ path, texturePath, baseObjectURL, baseTextureURL, assetType }) {
    
    return new Promise((resolve, reject) => {

        function loadTextures(geometries) {

            const promises = geometries.map(geometry => {
                return new Promise(resolve => {
                    if (geometry.texturePath && geometry.texturePath.length > 0) {
                        textureLoader.load(baseTextureURL + geometry.texturePath, function (tex) {
                            tex.generateMipmaps = false;
                            tex.magFilter = THREE.LinearFilter;
                            tex.minFilter = THREE.LinearFilter;
                            tex.flipY = false;
                            geometry.texture = tex;
                            tex.needsUpdate = true;

                            resolve();
                        });
                    } else resolve();
                });
            })

            Promise.all(promises).finally(function () {
                resolve(geometries);
            })
        }
        
        switch (assetType) {
            case ".gltf":
                // console.log(`${baseObjectURL}${path}`);
                // console.log(texturePath);
                gltfLoader.load(`${baseObjectURL}${path}`, function ( gltf ) {
                    gltf.scene.children[0].geometry.texturePath = texturePath;
                    gltf.scene.children[0].geometry.computeVertexNormals();
                    // var gltfMaterial = gltf.scene.children[0].material; 
                    // gltf.scene.children[0].geometry.materialMap = gltfMaterial.map;
                    loadTextures([gltf.scene.children[0].geometry]);
                }, null, null );
                break;  
            default:
                reject(new Error("Unsupported extension:", ext));
                return;
        }

    })
}

function setTexture(object) {

    const geometry = object.geometry;
    const material = object.material;

    if (geometry.texture) {

        if(material.map) material.map.dispose();
        material.map = geometry.texture;
    
    } else {

        material.vertexColors = THREE.VertexColors;
        material.needsUpdate = true;

    }
}

