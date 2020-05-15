// Copyright (c) 2018 8th Wall, Inc.

// Returns a pipeline module that initializes the threejs scene when the camera feed starts, and
// handles subsequent spawning of a glb model whenever the scene is tapped.
const placegroundScenePipelineModule = () => {
  // const modelFile = 'assets/evercoast/evercoast.0001.gltf'  // 3D model to spawn at tap

  const ASSET_BASE_PATH = "./assets/";
  const ASSET_LOUNGE = 'dolby_textured_v02.fbx';
  let ASSET_TRACKER = "shark.gltf";
  let ASSET_OBJECT_PATH = ASSET_BASE_PATH + "gltf/";
  let ASSET_TEXTURE_PATH = ASSET_BASE_PATH + "tex/";
  const ASSET_TYPE = ".gltf";
  const FRAME_RATE = 30;
  const AUDIO_PLAYING_FLAG = false;
  const AUDIO_FILE = ASSET_BASE_PATH + "./audio/muqabla.mp3";

  const fbxLoader = new THREE.FBXLoader().setPath( ASSET_BASE_PATH );
  const loader = new THREE.GLTFLoader().setPath( ASSET_BASE_PATH );
  const raycaster = new THREE.Raycaster()
  const tapPosition = new THREE.Vector2()
  
  // let spotLight1, spotLight2, spotLight3;

  var volPlayer, stats;
  var volPlayerSharkman, volPlayerHula, volPlayerKungfu;

  let hula, kungfu, sharkman;
  let box;

  let boxVisible = true;

  let coneHula, coneKungfu, coneSharkman;
  let signHula = 1, signKungfu = 1, signSharkman = 1;

  let surface 
  const sofaImage = "./img/shoes2.png"
  let sofa


  // Populates some object into an XR scene and sets the initial camera position. The scene and
  // camera come from xr3js, and are only available in the camera loop lifecycle onStart() or later.
  const initXrScene = ({ scene, camera }) => {
    console.log('initXrScene')

    // addLoading({scene});

    // addLounge({scene});
    showLoadingScreen();

    const textureLoader = new THREE.TextureLoader()
    textureLoader.load(sofaImage, function(texture) {
      texture.minFilter = THREE.NearestFilter
      texture.magFilter = THREE.NearestFilter

      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true
      })
      const plane = new THREE.PlaneBufferGeometry(1, 1)
      sofa = new THREE.Mesh(plane, material)
      // sofa.rotation.x = Math.PI * 1.5
      sofa.position.set(0, -0.5, -8);
      sofa.scale.set(3, 3, 3)
      scene.add(sofa)
    })

    addVolumetricVideoSharkman({scene});

    // addVolumetricVideoHula({scene});

    // addVolumetricVideoKungfu({scene});
    
    scene.add(new THREE.AmbientLight( 0xffffff, 0.9 ))  // Add soft white light to the scene.

    // var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    // directionalLight.position.set(12, 0.6, 0);
    // scene.add(directionalLight);

    camera.position.set(0, 10, 20);

  }

  const showLoadingScreen = () => {
    document.getElementById('loading').style.visibility = "visible";
  }

  const hideLoadingScreen = () => {
    document.getElementById('loading').remove();
  }
  
  const addVolumetricVideoSharkman = ({scene}) => {

    const ASSET_TRACKER_SHARK = "shark.gltf";
    
    loader.load( ASSET_TRACKER_SHARK, function ( gltf ) {
    
      const ASSET_OBJECT_PATH_SHARK = ASSET_BASE_PATH + "shark/gltf/";
      const ASSET_TEXTURE_PATH_SHARK = ASSET_BASE_PATH + "shark/tex/";
      const userData = gltf.scene.children[0].userData;
      const frameData = userData.Flipbook;
      const gltfScene = gltf.scene;
      volPlayerSharkman = new VolPlayer(frameData, FRAME_RATE, ASSET_TYPE, ASSET_OBJECT_PATH_SHARK, ASSET_TEXTURE_PATH_SHARK, AUDIO_PLAYING_FLAG, AUDIO_FILE); 
      gltfScene.children[0].add(volPlayerSharkman);

      volPlayerSharkman.onReady.then(() => {
        sharkman = gltfScene.children[0].children[0].children[0].children[0];
        sharkman.scale.set(2, 2, 2);
        sharkman.position.set(0, -0.5, -8);
        scene.add(sharkman);
        sharkman.visible = false;
        hideLoadingScreen();
        volPlayerSharkman.isPlaying = false;
      });
    
    });
  }

  const addVolumetricVideoKungfu = ({scene}) => {

    const ASSET_TRACKER_KUNGFU = "kungfu.gltf";
    
    loader.load( ASSET_TRACKER_KUNGFU, function ( gltf ) {
    
      const ASSET_OBJECT_PATH_KUNGFU = ASSET_BASE_PATH + "kungfu/gltf/";
      const ASSET_TEXTURE_PATH_KUNGFU = ASSET_BASE_PATH + "kungfu/tex/";
      const userData = gltf.scene.children[0].userData;
      const frameData = userData.Flipbook;
      const gltfScene = gltf.scene;
      volPlayerKungfu = new VolPlayer(frameData, FRAME_RATE, ASSET_TYPE, ASSET_OBJECT_PATH_KUNGFU, ASSET_TEXTURE_PATH_KUNGFU, AUDIO_PLAYING_FLAG, AUDIO_FILE); 
      gltfScene.children[0].add(volPlayerKungfu);

      volPlayerKungfu.onReady.then(() => {
        kungfu = gltfScene.children[0].children[0].children[0].children[0];
        gltfScene.scale.set(2, 2, 2);
        gltfScene.position.set(3, -0.5, -8);
        scene.add(gltfScene);
        volPlayerKungfu.isPlaying = false;
      });
    
    });
  }

  const addVolumetricVideoHula = ({scene}) => {

    const ASSET_TRACKER_HULA = "hula.gltf";
    
    loader.load( ASSET_TRACKER_HULA, function ( gltf ) {
    
      const ASSET_OBJECT_PATH_HULA = ASSET_BASE_PATH + "hula/gltf/";
      const ASSET_TEXTURE_PATH_HULA = ASSET_BASE_PATH + "hula/tex/";
      const userData = gltf.scene.children[0].userData;
      const frameData = userData.Flipbook;
      const gltfScene = gltf.scene;
      volPlayerHula = new VolPlayer(frameData, FRAME_RATE, ASSET_TYPE, ASSET_OBJECT_PATH_HULA, ASSET_TEXTURE_PATH_HULA, AUDIO_PLAYING_FLAG, AUDIO_FILE); 
      gltfScene.children[0].add(volPlayerHula);
      // spotLight1.target = gltfScene;
      volPlayerHula.onReady.then(() => {
        hula = gltfScene.children[0].children[0].children[0].children[0];
        gltfScene.scale.set(2, 2, 2);
        gltfScene.position.set(-3, -0.5, -8);
        scene.add(gltfScene);
        volPlayerHula.isPlaying = false;
      });
    
    });
  }

  // const addVolumetricVideo = ({scene}) => {
  //   loader.load( ASSET_TRACKER, function ( gltf ) {
  //     const userData = gltf.scene.children[0].userData;
  //     const frameData = userData.Flipbook;
  //     loadFlipbook(frameData, gltf.scene, {scene});
  //   });
  // }

  // const loadFlipbook = (frameData, gltfScene, {scene} ) => {

  //   volPlayer = new VolPlayer(frameData, FRAME_RATE, ASSET_TYPE, ASSET_OBJECT_PATH, ASSET_TEXTURE_PATH, AUDIO_PLAYING_FLAG, AUDIO_FILE); 
  //   gltfScene.children[0].add(volPlayer);
  //   // activeScene = gltfScene;

  //   volPlayer.onReady.then(() => {
  //   //   spotLight2.target = gltfScene;
  //   //   // if(sceneToBeRemoved != null) {
  //   //   //   scene.remove(sceneToBeRemoved);
  //   //   //   sceneToBeRemoved = null;
  //   //   // }
  //    	gltfScene.scale.set(7, 7, 7);
  //   	gltfScene.position.set(0, 0, 10);
  //     scene.add(gltfScene);
  //     volPlayer.isPlaying = false;
  //   //   volPlayer.isPlaying = isVolPlayerPlaying;
  //   });
  
  // }

  // const adjustCamera = () => {
  //   const {scene, camera} = XR8.Threejs.xrScene() 
  //     // camera.position.x += 5;
  //     // camera.position.z += 10;
  //     // camera.position.y += 5;

  //     XR8.XrController.updateCameraProjectionMatrix({
  //       origin: camera.position,
  //       facing: camera.quaternion,
  //     })
  // };

  const startHula = ({scene}) => {

    volPlayerSharkman.isPlaying = false;
    volPlayerKungfu.isPlaying = false;
    volPlayerHula.isPlaying = true;
  }

  const startKungfu = ({scene}) => {

    volPlayerSharkman.isPlaying = false;
    volPlayerHula.isPlaying = false;
    volPlayerKungfu.isPlaying = true;
  }

  const startSharkman = ({scene}) => {

    volPlayerHula.isPlaying = false;
    volPlayerKungfu.isPlaying = false;
    volPlayerSharkman.isPlaying = true;
    
  }

  const resetHandler = (e) => {
    XR8.XrController.recenter()
    sharkman.position.set(0, -0.5, -8);
  }

  const touchHandler = (e) => {
    // Call XrController.recenter() when the canvas is tapped with two fingers. This resets the
    // AR camera to the position specified by XrController.updateCameraProjectionMatrix() above.

    // adjustCamera();

    // if (e.touches.length == 2) {
    //   XR8.XrController.recenter() 
    // }

    if (e.touches.length > 2) {
      return
    }

    const {scene, camera} = XR8.Threejs.xrScene()

    // calculate tap position in normalized device coordinates (-1 to +1) for both components.
    tapPosition.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1
    tapPosition.y = - (e.touches[0].clientY / window.innerHeight) * 2 + 1

    // Update the picking ray with the camera and tap position.
    raycaster.setFromCamera(tapPosition, camera)

    // Raycast against the "hula" object.
    // let intersects = raycaster.intersectObject(hula)
    // if (intersects.length > 0 && intersects[0].object == hula) {
    //   console.log("Start Hula");
    //   startHula({scene});
    // }

    // intersects = raycaster.intersectObject(kungfu)
    // if (intersects.length > 0 && intersects[0].object == kungfu) {
    //   console.log("Start Kungfu");
    //   startKungfu({scene});
    // }

    let intersects = raycaster.intersectObject(sharkman)
    if (intersects.length > 0 && intersects[0].object == sharkman) {
      console.log("Start Sharkman");
      // startSharkman({scene});
    }

  }

  const adjustModelPan = (pos) => {

    sharkman.position.x += (pos.x * 0.01);
    sharkman.position.y -= (pos.y * 0.01);
    // console.log(sharkman.position.x);
    sofa.position.x += (pos.x * 0.01);
    sofa.position.y -= (pos.y * 0.01);
    

  }

  const adjustModelZoom = (change) => {

    sharkman.scale.x += change*0.01;
    sharkman.scale.y += change*0.01;
    sharkman.scale.z += change*0.01;
    
    sofa.scale.x += change*0.01;
    sofa.scale.y += change*0.01;
    sofa.scale.z += change*0.01;
    // sharkman.scale.multiplyScalar(change*0.01);

  }

  return {
    // Pipeline modules need a name. It can be whatever you want but must be unique within your app.
    name: 'placeground',

    // onStart is called once when the camera feed begins. In this case, we need to wait for the
    // XR8.Threejs scene to be ready before we can access it to add content. It was created in
    // XR8.Threejs.pipelineModule()'s onStart method.
    onStart: ({canvas, canvasWidth, canvasHeight}) => {
      const {scene, camera} = XR8.Threejs.xrScene()  // Get the 3js sceen from xr3js.

      initXrScene({ scene, camera }) // Add objects to the scene and set starting camera position.

      canvas.addEventListener('touchstart', touchHandler, true)  // Add touch listener.
      document.getElementById('reset').addEventListener('touchstart', resetHandler, true);

      var zt = new ZingTouch.Region(document.body);
      var panGesture = new ZingTouch.Pan({ numInputs: 1 });
      var pinchGesture = new ZingTouch.Distance();
      var swipeGesture = new ZingTouch.Swipe({
        numInputs: 1,
        maxRestTime: 100,
        escapeVelocity: 0.25
      });

      zt.bind(canvas, swipeGesture, function(e){
        console.log("swipe");
        // adjustModelZoom(e.detail.change)
      }, true);

      zt.bind(canvas, panGesture, function(e){
        console.log("pan");
        adjustModelPan(e.detail.data[0].change)
      }, false);

      zt.bind(canvas, pinchGesture, function(e){
        adjustModelZoom(e.detail.change)
      }, false);

      

      animate()
      function animate(time) {
        requestAnimationFrame(animate)
        if(volPlayerSharkman && volPlayerSharkman.isPlaying) {
          volPlayerSharkman.update();
          // if(volPlayer.getCurrentFrame() > 0) {
          //   boxVisible = false;
          // } 
        }
        // if(volPlayerHula && volPlayerHula.isPlaying) {
        //   volPlayerHula.update();
        // }
        // if(volPlayerKungfu && volPlayerKungfu.isPlaying) {
        //   volPlayerKungfu.update();
        // }

      }

      // Sync the xr controller's 6DoF position and camera paremeters with our scene.
      // XR8.XrController.updateCameraProjectionMatrix({
      //   origin: camera.position,
      //   facing: camera.quaternion,
      // })
    },
  }
}

const onxrloaded = () => {
  XR8.addCameraPipelineModules([  // Add camera pipeline modules.
    // Existing pipeline modules.
    XR8.GlTextureRenderer.pipelineModule(),      // Draws the camera feed.
    XR8.Threejs.pipelineModule(),                // Creates a ThreeJS AR Scene.
    XR8.XrController.pipelineModule(),           // Enables SLAM tracking.
    XRExtras.AlmostThere.pipelineModule(),       // Detects unsupported browsers and gives hints.
    XRExtras.FullWindowCanvas.pipelineModule(),  // Modifies the canvas to fill the window.
    XRExtras.Loading.pipelineModule(),           // Manages the loading screen on startup.
    XRExtras.RuntimeError.pipelineModule(),      // Shows an error image on runtime error.
    // Custom pipeline modules.
    placegroundScenePipelineModule(),
  ])

  // Open the camera and start running the camera run loop.
  XR8.run({canvas: document.getElementById('camerafeed')})
}

// Show loading screen before the full XR library has been loaded.
const load = () => { XRExtras.Loading.showLoading({onxrloaded}) }
// window.onload = () => { window.XRExtras ? load() : window.addEventListener('xrextrasloaded', load) }
