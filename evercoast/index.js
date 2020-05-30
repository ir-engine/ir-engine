// Copyright (c) 2018 8th Wall, Inc.

// Returns a pipeline module that initializes the threejs scene when the camera feed starts, and
// handles subsequent spawning of a glb model whenever the scene is tapped.
const placegroundScenePipelineModule = () => {
  // const modelFile = 'assets/evercoast/evercoast.0001.gltf'  // 3D model to spawn at tap

  const ASSET_BASE_PATH = "assets/";
  const ASSET_LOUNGE = 'dnalounge_main_v3.gltf';
  const ASSET_TRACKER = "evercoast.gltf";
  const ASSET_OBJECT_PATH = ASSET_BASE_PATH + "assets_vol2/";
  const ASSET_TEXTURE_PATH = ASSET_BASE_PATH + "assets_vol2/";
  const ASSET_TYPE = ".gltf";
  const FRAME_RATE = 30;
  const AUDIO_PLAYING_FLAG = false;
  const AUDIO_FILE = ASSET_BASE_PATH + "/audio/muqabla.mp3";

  const loader = new THREE.GLTFLoader().setPath( ASSET_BASE_PATH );

  let cameraMain;
  let spotLight1, spotLight2;

  var volPlayer;

  const floorImage = "./img/sofa1.png"

  // Populates some object into an XR scene and sets the initial camera position. The scene and
  // camera come from xr3js, and are only available in the camera loop lifecycle onStart() or later.
  const initXrScene = ({ scene, camera }) => {
    console.log('initXrScene')

    cameraMain = camera;

    addLounge({scene});

    addVolumetricVideo({scene});
    
    var geometry = new THREE.SphereGeometry( 5, 32, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    var sphere = new THREE.Mesh( geometry, material );
    sphere.position.set(6, 1, 0);
    sphere.scale.set(0.1, 0.1, 0.1);
    scene.add( sphere );
    console.log(sphere);

    scene.add(new THREE.AmbientLight( 0x404040, 5 ))  // Add soft white light to the scene.

    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(12, 0.6, 0);
    scene.add(directionalLight);

    var directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(0, 0.6, 0);
    scene.add(directionalLight2);

    spotLight1 = new THREE.DirectionalLight( 0xff0000 );
    spotLight1.position.set( -32, 0, -3 );
    scene.add( spotLight1 );

    spotLight2 = new THREE.DirectionalLight( 0x00ff00, 0 );
    spotLight2.position.set( 32, 0, -3 );
    scene.add( spotLight2 );

    setInterval(function() {
      spotLight1.intensity = 1 - spotLight1.intensity;
      spotLight2.intensity = 1 - spotLight2.intensity;
    }, 500);

    // setInterval(function() {
    //   spotLight1.position.y += 0.1;
    //   console.log(spotLight1.position);
    // });

    // Set the initial camera position relative to the scene we just laid out. This must be at a
    // height greater than y=0.
    camera.position.set(5, 0, -5);
  
  }

  const addLounge = ({scene}) => {

    loader.load( ASSET_LOUNGE, function ( gltf ) {
				
      const box = new THREE.Box3().setFromObject( gltf.scene );
      const center = box.getCenter( new THREE.Vector3() );

      gltf.scene.position.x += ( gltf.scene.position.x - center.x );
      gltf.scene.position.y += ( gltf.scene.position.y - center.y );
      gltf.scene.position.z += ( gltf.scene.position.z - center.z );
      
      gltf.scene.scale.set(3, 3, 3);

      scene.add(gltf.scene);
      adjustCamera();

    })
  };

  const addVolumetricVideo = ({scene}) => {
    loader.load( ASSET_TRACKER, function ( gltf ) {
      const userData = gltf.scene.children[0].userData;
      const frameData = userData.Flipbook;
      loadFlipbook(frameData, gltf.scene, {scene});
    });
  }

  const loadFlipbook = (frameData, gltfScene, {scene} ) => {

    volPlayer = new VolPlayer(frameData, FRAME_RATE, ASSET_TYPE, ASSET_OBJECT_PATH, ASSET_TEXTURE_PATH, AUDIO_PLAYING_FLAG, AUDIO_FILE); 
    gltfScene.children[0].add(volPlayer);

    volPlayer.onReady.then(() => {
     	gltfScene.scale.set(2, 2, 2);
    	gltfScene.position.set(6, 0, -15);
      scene.add(gltfScene);
      volPlayer.isPlaying = true;
    });
  
  }

  const adjustCamera = () => {
    const {scene, camera} = XR8.Threejs.xrScene() 
      camera.position.x += 5;
      camera.position.z -= 5;

      XR8.XrController.updateCameraProjectionMatrix({
        origin: camera.position,
        facing: camera.quaternion,
      })
  };


  const touchHandler = (e) => {
    // Call XrController.recenter() when the canvas is tapped with two fingers. This resets the
    // AR camera to the position specified by XrController.updateCameraProjectionMatrix() above.
    if (e.touches.length == 2) {
      console.log("81 recenter");
      XR8.XrController.recenter()
    }
    // else {
    //   const {scene, camera} = XR8.Threejs.xrScene() 
    //   camera.position.x += 5;
    //   camera.position.z -= 5;
    //   // camera.updateCameraProjectionMatrix();
    //   console.log(camera);
    //   console.log(camera.position)

    //   XR8.XrController.updateCameraProjectionMatrix({
    //     origin: camera.position,
    //     facing: camera.quaternion,
    //   })
    // }
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

      animate()
      function animate(time) {
        requestAnimationFrame(animate)
        if(volPlayer && volPlayer.isPlaying) {
					volPlayer.update();
				}
      }

      // Sync the xr controller's 6DoF position and camera paremeters with our scene.
      XR8.XrController.updateCameraProjectionMatrix({
        origin: camera.position,
        facing: camera.quaternion,
      })
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
window.onload = () => { window.XRExtras ? load() : window.addEventListener('xrextrasloaded', load) }
