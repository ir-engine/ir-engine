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

  const loader = new THREE.GLTFLoader().setPath( ASSET_BASE_PATH );
  
  // let spotLight1, spotLight2, spotLight3;

  var volPlayerSharkman, volPlayerHula, volPlayerKungfu;

  let hula, kungfu, sharkman;
  let activeCharacter;

  // Populates some object into an XR scene and sets the initial camera position. The scene and
  // camera come from xr3js, and are only available in the camera loop lifecycle onStart() or later.
  const initXrScene = ({ scene, camera }) => {
    console.log('initXrScene')


    showLoadingScreen();

    addVolumetricVideoSharkman({scene});

    addVolumetricVideoHula({scene});

    addVolumetricVideoKungfu({scene});
    
    scene.add(new THREE.AmbientLight( 0xffffff, 0.9 ))  // Add soft white light to the scene.

    addSceneShadow({scene});

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
        scene.add(gltf.scene);
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
        kungfu.visible = false;
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
        hula.visible = false;
        volPlayerHula.isPlaying = false;
      });
    
    });
  }

  const startHula = () => {

    if(activeCharacter) {
      hula.scale.set(activeCharacter.scale.x, activeCharacter.scale.y, activeCharacter.scale.z);
      hula.position.set(activeCharacter.position.x, activeCharacter.position.y, activeCharacter.position.z);
    }
    activeCharacter = hula;
    hula.visible = true;
    kungfu.visible = false;
    sharkman.visible = false;
    volPlayerSharkman.isPlaying = false;
    volPlayerKungfu.isPlaying = false;
    volPlayerHula.isPlaying = true;
      }

  const startKungfu = () => {

    if(activeCharacter) {
      kungfu.scale.set(activeCharacter.scale.x, activeCharacter.scale.y, activeCharacter.scale.z);
      kungfu.position.set(activeCharacter.position.x, activeCharacter.position.y, activeCharacter.position.z);
    }
    activeCharacter = kungfu;
    hula.visible = false;
    kungfu.visible = true;
    sharkman.visible = false;
    volPlayerSharkman.isPlaying = false;
    volPlayerHula.isPlaying = false;
    volPlayerKungfu.isPlaying = true;
  }

  const startSharkman = () => {

    if(activeCharacter) {
      sharkman.scale.set(activeCharacter.scale.x, activeCharacter.scale.y, activeCharacter.scale.z);
      sharkman.position.set(activeCharacter.position.x, activeCharacter.position.y, activeCharacter.position.z);
    }
    activeCharacter = sharkman;
    hula.visible = false;
    kungfu.visible = false;
    sharkman.visible = true;
    volPlayerHula.isPlaying = false;
    volPlayerKungfu.isPlaying = false;
    volPlayerSharkman.isPlaying = true;
    
  }

  const resetHandler = (e) => {
    XR8.XrController.recenter()
    activeCharacter.position.set(0, -0.5, -8);
  }

  const closeHandler = (e) => {
    $('#character-selection-screen').css('display', 'block');
    $('#reset').css('display', 'none');
    $('canvas').css('display', 'none');
    $('#close').css('display', 'none');
  }

  const adjustModelPan = (pos) => {

    activeCharacter.position.x += (pos.x * 0.01);
    activeCharacter.position.y -= (pos.y * 0.01);
  
  }

  const adjustModelZoom = (change) => {

    activeCharacter.scale.x += change*0.01;
    activeCharacter.scale.y += change*0.01;
    activeCharacter.scale.z += change*0.01;
    
   }

  const showCharacter = (character) => {

    $('#character-selection-screen').css('display', 'none');
    $('#reset').css('display', 'block');
    $('canvas').css('display', 'block');
    $('#close').css('display', 'block');

    switch(character) {

      case 'sharkman': startSharkman();
                        break;
      case 'kungfu': startKungfu();
                      break;
      case 'hula': startHula();
                    break;
      
    }
  }

  const addSceneShadow = ({scene}) => {
    this.light = new THREE.DirectionalLight(0xffffff, 1.0);
    this.light.position.set(0, 1, 0);
    this.light.castShadow = true;
    this.light.shadowDarkness = 1.0;
    this.light.shadowCameraVisible = true;
    // this.light.shadow.mapSize.width = 4096;
    // this.light.shadow.mapSize.height = 4096;

    
    scene.add(this.light);
  }

  return {
    // Pipeline modules need a name. It can be whatever you want but must be unique within your app.
    name: 'placeground',

    // onStart is called once when the camera feed begins. In this case, we need to wait for the
    // XR8.Threejs scene to be ready before we can access it to add content. It was created in
    // XR8.Threejs.pipelineModule()'s onStart method.
    onStart: ({canvas, canvasWidth, canvasHeight}) => {
      const {scene, camera, renderer} = XR8.Threejs.xrScene()  // Get the 3js sceen from xr3js.
      renderer.shadowMapEnabled = true;

      initXrScene({ scene, camera }) // Add objects to the scene and set starting camera position.

      document.getElementById('reset').addEventListener('touchstart', resetHandler, true);
      document.getElementById('close').addEventListener('touchstart', closeHandler, true);

      $('.select-character').on('click', function(e) {
        showCharacter($(this).attr('id'));
      });

      var zt = new ZingTouch.Region(document.body);
      var panGesture = new ZingTouch.Pan({ numInputs: 1 });
      var pinchGesture = new ZingTouch.Distance();
      var swipeGesture = new ZingTouch.Swipe({
        numInputs: 1,
        maxRestTime: 100,
        escapeVelocity: 0.25
      });

      zt.bind(canvas, panGesture, function(e){
        adjustModelPan(e.detail.data[0].change)
      }, false);

      zt.bind(canvas, pinchGesture, function(e){
        adjustModelZoom(e.detail.change)
      }, false);

      $('#character-selection-screen').css('display', 'block');

      animate()
      function animate(time) {
        requestAnimationFrame(animate)
        if(volPlayerSharkman && volPlayerSharkman.isPlaying) {
          volPlayerSharkman.update();
        }
        if(volPlayerHula && volPlayerHula.isPlaying) {
          volPlayerHula.update();
        }
        if(volPlayerKungfu && volPlayerKungfu.isPlaying) {
          volPlayerKungfu.update();
        }
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
