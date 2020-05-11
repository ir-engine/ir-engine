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

  // Populates some object into an XR scene and sets the initial camera position. The scene and
  // camera come from xr3js, and are only available in the camera loop lifecycle onStart() or later.
  const initXrScene = ({ scene, camera }) => {
    console.log('initXrScene')

    // addLoading({scene});

    // addLounge({scene});

    addVolumetricVideoSharkman({scene});

    addVolumetricVideoHula({scene});

    addVolumetricVideoKungfu({scene});
    
    // var geometry = new THREE.SphereGeometry( 5, 32, 32 );
    // var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    // var sphere = new THREE.Mesh( geometry, material );
    // sphere.position.set(20, 20, -17);
    // sphere.scale.set(0.1, 0.1, 0.1);
    // scene.add( sphere );
    // console.log(sphere);

    var geometry = new THREE.ConeBufferGeometry( 5, 10, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffffff} );
    coneHula = new THREE.Mesh( geometry, material );
    coneHula.position.set(20.5, 14, -17);
    coneHula.rotation.x = Math.PI;
    coneHula.scale.set(0.1, 0.1, 0.1);
    scene.add( coneHula );

    var geometry = new THREE.ConeBufferGeometry( 5, 10, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffffff} );
    coneSharkman = new THREE.Mesh( geometry, material );
    coneSharkman.position.set(-0.5, 16, 10);
    coneSharkman.rotation.x = Math.PI;
    coneSharkman.scale.set(0.1, 0.1, 0.1);
    scene.add( coneSharkman );
    coneSharkman.visible = false;

    var geometry = new THREE.ConeBufferGeometry( 5, 10, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffffff} );
    coneKungfu = new THREE.Mesh( geometry, material );
    coneKungfu.position.set(-20, 14, -17);
    coneKungfu.rotation.x = Math.PI;
    coneKungfu.scale.set(0.1, 0.1, 0.1);
    scene.add( coneKungfu );

    scene.add(new THREE.AmbientLight( 0xffffff, 0.9 ))  // Add soft white light to the scene.

    // var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    // directionalLight.position.set(12, 0.6, 0);
    // scene.add(directionalLight);

    // var directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    // directionalLight2.position.set(0, 0.6, 0);
    // scene.add(directionalLight2);

    // spotLight1 = new THREE.DirectionalLight( 0xff0000 );
    // spotLight1.position.set( -32, 0, -3 );
    // scene.add( spotLight1 );

    // spotLight1 = new THREE.SpotLight( 0xffffff, 2.0 );
    // spotLight1.position.set( -20, 50, -27 );
    // spotLight1.angle = 0.2;
    // spotLight1.penumbra = 0.6;
    // scene.add( spotLight1 );
    // spotLight1.visible = false;

    // spotLight2 = new THREE.SpotLight( 0xffffff, 2.0 );
    // spotLight2.position.set( 0, 50, -27 );
    // spotLight2.angle = 0.2;
    // spotLight2.penumbra = 0.6;
    // scene.add( spotLight2 );

    // spotLight3 = new THREE.SpotLight( 0xffffff, 2.0 );
    // spotLight3.position.set( 20, 50, -27 );
    // spotLight3.angle = 0.2;
    // spotLight3.penumbra = 0.6;
    // scene.add( spotLight3 );
    // spotLight3.visible = false;

    // adjustCamera();


    // var spotLightHelper = new THREE.SpotLightHelper( spotLight1 );
    // scene.add( spotLightHelper );

    // spotLight2 = new THREE.DirectionalLight( 0x00ff00, 0 );
    // spotLight2.position.set( 32, 0, -3 );
    // scene.add( spotLight2 );

    // var pointLight = new THREE.PointLight( 0x0000ff, 1, 100 );
    // pointLight.position.set( 10, 10, 10 );
    // scene.add( pointLight );

    // var sphereSize = 1;
    // var pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize );
    // scene.add( pointLightHelper );

    // setInterval(function() {
    //   // spotLight1.intensity = 1 - spotLight1.intensity;
    //   spotLight2.intensity = 1 - spotLight2.intensity;
    // }, 500);

    // setInterval(function() {
    //   spotLight1.position.y += 0.1;
    //   console.log(spotLight1.position);
    // });

    // Set the initial camera position relative to the scene we just laid out. This must be at a
    // height greater than y=0.
  
    
    // surface = new THREE.Mesh(
    //   new THREE.PlaneGeometry( 100, 100, 1, 1 ),
    //   new THREE.MeshBasicMaterial({
    //     color: 0xffff00,
    //     transparent: true,
    //     opacity: 0.0,
    //     side: THREE.DoubleSide
    //   })
    // )

    // surface.rotateX(-Math.PI / 2)
    // surface.position.set(0, 0, 0)
    // scene.add(surface);

    camera.position.set(0, 10, 20);
    // XR8.XrController.updateCameraProjectionMatrix({
    //   origin: camera.position,
    //   facing: camera.quaternion,
    // })
    
    // adjustCamera();


  }

  const addLoading = ({scene}) => {

    // const textureLoader = new THREE.TextureLoader()

    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
      const boxMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.50,
      });
      box = new THREE.Mesh(boxGeometry, boxMaterial);
      loader.castShadow = true;
      // loader.receiveShadow = false;
      box.scale.set(0.5, 0.5, 0.5);
      box.position.set(6, -1, -12);
      scene.add(box);
  };
  
  const addLounge = ({scene}) => {

    fbxLoader.load( ASSET_LOUNGE, function ( object ) {

      object.scale.set(0.05, 0.05, 0.05);
      // object.position.y = -10;
      object.rotation.y = Math.PI;
      scene.add(object);
      adjustCamera();

    })
  };

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
      // spotLight2.target = gltfScene;

      volPlayerSharkman.onReady.then(() => {
        sharkman = gltfScene.children[0].children[0].children[0].children[0];
        gltfScene.scale.set(2, 2, 2);
        gltfScene.position.set(0, -0.5, -8);
        scene.add(gltfScene);
        volPlayerSharkman.isPlaying = true;
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
      // spotLight3.target = gltfScene;

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

  const adjustCamera = () => {
    const {scene, camera} = XR8.Threejs.xrScene() 
      // camera.position.x += 5;
      // camera.position.z += 10;
      // camera.position.y += 5;

      XR8.XrController.updateCameraProjectionMatrix({
        origin: camera.position,
        facing: camera.quaternion,
      })
  };

  const startHula = ({scene}) => {

    boxVisible = true;
    volPlayerSharkman.isPlaying = false;
    volPlayerKungfu.isPlaying = false;
    volPlayerHula.isPlaying = true;
    // spotLight1.visible = true;
    // spotLight2.visible = false;
    // spotLight3.visible = false;
    coneHula.visible = false;
    coneSharkman.visible = true;
    coneKungfu.visible = true;

  }

  const startKungfu = ({scene}) => {

    boxVisible = true;
    volPlayerSharkman.isPlaying = false;
    volPlayerHula.isPlaying = false;
    volPlayerKungfu.isPlaying = true;
    // spotLight1.visible = false;
    // spotLight2.visible = false;
    // spotLight3.visible = true;
    coneHula.visible = true;
    coneSharkman.visible = true;
    coneKungfu.visible = false;
    
  }

  const startSharkman = ({scene}) => {

    boxVisible = true;
    volPlayerHula.isPlaying = false;
    volPlayerKungfu.isPlaying = false;
    volPlayerSharkman.isPlaying = true;
    // spotLight1.visible = false;
    // spotLight2.visible = true;
    // spotLight3.visible = false;
    coneHula.visible = true;
    coneSharkman.visible = false;
    coneKungfu.visible = true;
  }

  const touchHandler = (e) => {
    // Call XrController.recenter() when the canvas is tapped with two fingers. This resets the
    // AR camera to the position specified by XrController.updateCameraProjectionMatrix() above.

    // adjustCamera();

    if (e.touches.length == 2) {
      XR8.XrController.recenter() 
    }

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
    let intersects = raycaster.intersectObject(hula)
    if (intersects.length > 0 && intersects[0].object == hula) {
      console.log("Start Hula");
      startHula({scene});
    }

    intersects = raycaster.intersectObject(kungfu)
    if (intersects.length > 0 && intersects[0].object == kungfu) {
      console.log("Start Kungfu");
      startKungfu({scene});
    }

    intersects = raycaster.intersectObject(sharkman)
    if (intersects.length > 0 && intersects[0].object == sharkman) {
      console.log("Start Sharkman");
      startSharkman({scene});
    }

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

      stats = new Stats();
      canvas.appendChild( stats.dom );

      animate()
      function animate(time) {
        requestAnimationFrame(animate)
        if(volPlayerSharkman && volPlayerSharkman.isPlaying) {
          volPlayerSharkman.update();
          // if(volPlayer.getCurrentFrame() > 0) {
          //   boxVisible = false;
          // } 
        }
        if(volPlayerHula && volPlayerHula.isPlaying) {
          volPlayerHula.update();
        }
        if(volPlayerKungfu && volPlayerKungfu.isPlaying) {
          volPlayerKungfu.update();
        }

        if(coneHula.visible) {
          coneHula.scale.x += (signHula * 0.001);
          coneHula.scale.y += (signHula * 0.001);
          coneHula.scale.z += (signHula * 0.001);
          if(coneHula.scale.x > 0.12) signHula = -1;
          if(coneHula.scale.x < 0.08) signHula = 1;
        }

        if(coneSharkman.visible) {
          coneSharkman.scale.x += (signSharkman * 0.001);
          coneSharkman.scale.y += (signSharkman * 0.001);
          coneSharkman.scale.z += (signSharkman * 0.001);
          if(coneSharkman.scale.x > 0.12) signSharkman = -1;
          if(coneSharkman.scale.x < 0.08) signSharkman = 1;
        }

        if(coneKungfu.visible) {
          coneKungfu.scale.x += (signKungfu * 0.001);
          coneKungfu.scale.y += (signKungfu * 0.001);
          coneKungfu.scale.z += (signKungfu * 0.001);
          if(coneKungfu.scale.x > 0.12) signKungfu = -1;
          if(coneKungfu.scale.x < 0.08) signKungfu = 1;
        }
        
        // if(box && boxVisible) {
        //   box.rotation.x += 0.03;
        //   box.rotation.y += 0.05;
        // } 

        // if(!boxVisible) {
        //   box.visible = false;
        // } else {
        //   box.visible = true;
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
window.onload = () => { window.XRExtras ? load() : window.addEventListener('xrextrasloaded', load) }
