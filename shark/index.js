// Copyright (c) 2018 8th Wall, Inc.

// Returns a pipeline module that initializes the threejs scene when the camera feed starts, and
// handles subsequent spawning of a glb model whenever the scene is tapped.
const placegroundScenePipelineModule = () => {
  // const modelFile = 'assets/evercoast/evercoast.0001.gltf'  // 3D model to spawn at tap

  const ASSET_BASE_PATH = "assets/";
  const ASSET_LOUNGE = 'dnalounge_main_v3.gltf';
  let ASSET_TRACKER = "shark.gltf";
  let ASSET_OBJECT_PATH = ASSET_BASE_PATH + "gltf/";
  let ASSET_TEXTURE_PATH = ASSET_BASE_PATH + "tex/";
  const ASSET_TYPE = ".gltf";
  const FRAME_RATE = 30;
  const AUDIO_PLAYING_FLAG = false;
  const AUDIO_FILE = ASSET_BASE_PATH + "/audio/muqabla.mp3";

  const loader = new THREE.GLTFLoader().setPath( ASSET_BASE_PATH );
  const raycaster = new THREE.Raycaster()
  const tapPosition = new THREE.Vector2()
  
  let cameraMain;
  let spotLight1, spotLight2;

  var volPlayer, stats;

  let hula, kungfu;
  let box;

  let isVolPlayerPlaying = true;
  let activeScene;
  let sceneToBeRemoved = null;
  let boxVisible = true;

  // Populates some object into an XR scene and sets the initial camera position. The scene and
  // camera come from xr3js, and are only available in the camera loop lifecycle onStart() or later.
  const initXrScene = ({ scene, camera }) => {
    console.log('initXrScene')

    cameraMain = camera;

    addLoading({scene});

    addLounge({scene});

    // addNavigation({scene});

    addStaticModel({scene});

    addVolumetricVideo({scene});
    
    // var geometry = new THREE.SphereGeometry( 5, 32, 32 );
    // var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    // var sphere = new THREE.Mesh( geometry, material );
    // sphere.position.set(6, 1, 0);
    // sphere.scale.set(0.1, 0.1, 0.1);
    // scene.add( sphere );
    // console.log(sphere);


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

    var pointLight = new THREE.PointLight( 0x0000ff, 1, 100 );
    pointLight.position.set( 10, 10, 10 );
    scene.add( pointLight );

    var sphereSize = 1;
    var pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize );
    scene.add( pointLightHelper );

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
    // textureLoader.load(floorImage, function(texture) {
    //   texture.minFilter = THREE.NearestFilter
    //   texture.magFilter = THREE.NearestFilter

    //   const material = new THREE.MeshBasicMaterial({
    //     map: texture,
    //     transparent: true
    //   })
    //   const plane = new THREE.PlaneBufferGeometry(1, 1)
    //   const floor = new THREE.Mesh(plane, material)
    //   // floor.rotation.x = Math.PI * 1.5
    //   floor.position.set(6, 0, -15);
    //   // floor.scale.set(10, 10, 10)
    //   scene.add(floor)
    //   setInterval(function() {
    //     floor.rotation.z -= 0.1;
    //   }, 100);
    // })

    // const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    // const boxMaterial = new THREE.MeshStandardMaterial({
    //   color: 0xffffff,
    //   // transparent: true,
    //   // opacity: 0.99
    // });
    // box = new THREE.Mesh(boxGeometry, boxMaterial);
    // // loader.castShadow = true;
    // // loader.receiveShadow = false;
    // box.scale.set(0.5, 0.5, 0.5);
    // box.position.set(6, -1, -12);
    // scene.add(box);
    
  };
  
  // const addNavigation = ({scene}) => {

  //   const leftNavImage = "./img/loading3.gif"
  //   const textureLoader = new THREE.TextureLoader()

  //   textureLoader.load(leftNavImage, function(texture) {
  //     texture.minFilter = THREE.NearestFilter
  //     texture.magFilter = THREE.NearestFilter

  //     const material = new THREE.MeshBasicMaterial({
  //       map: texture,
  //       transparent: true
  //     })
  //     const plane = new THREE.PlaneBufferGeometry(1, 1)
  //     const leftNav = new THREE.Mesh(plane, material)
  //     // floor.rotation.x = Math.PI * 1.5
  //     leftNav.position.set(6, 0, -5);
  //     leftNav.scale.set(1, 1, 1)
  //     scene.add(leftNav)
      
  //   })

  // };

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

  const addStaticModel = ({scene}) => {

    var loader2 = new THREE.GLTFLoader();

    loader2.load( 'assets/hula/gltf/mesh.00001.gltf', function ( gltf ) {
    
      const geometry = gltf.scene.children[0].geometry;
      const material = new THREE.MeshStandardMaterial();
      material.side = THREE.DoubleSide;
      material.needsUpdate = true;

      const textureLoader = new THREE.TextureLoader();
      textureLoader.load('assets/hula/tex/tex.00001.jpg', function (tex) {
        tex.generateMipmaps = false;
        tex.magFilter = THREE.LinearFilter;
        tex.minFilter = THREE.LinearFilter;
        // geometry.texture = tex;
        tex.flipY = false;
        tex.needsUpdate = true;
        geometry.computeVertexNormals();

        material.map = tex;
        material.needsUpdate = true;
        hula = new THREE.Mesh(geometry, material);
        hula.scale.set(1.5, 1.5, 1.5);
        hula.position.set(10, -0.5, -17);
        scene.add(hula);
      });
        
    });

    loader2.load( 'assets/kungfu/gltf/mesh_kungfu.00001.gltf', function ( gltf ) {
    
      const geometry = gltf.scene.children[0].geometry;
      const material = new THREE.MeshStandardMaterial();
      material.side = THREE.DoubleSide;
      material.needsUpdate = true;

      const textureLoader = new THREE.TextureLoader();
      textureLoader.load('assets/kungfu/tex/tex.00001.jpg', function (tex) {
        tex.generateMipmaps = false;
        tex.magFilter = THREE.LinearFilter;
        tex.minFilter = THREE.LinearFilter;
        // geometry.texture = tex;
        tex.flipY = false;
        tex.needsUpdate = true;
        geometry.computeVertexNormals();

        material.map = tex;
        material.needsUpdate = true;
        kungfu = new THREE.Mesh(geometry, material);
        kungfu.scale.set(1.5, 1.5, 1.5);
        kungfu.position.set(2.5, -0.5, -17);
        scene.add(kungfu);
      });
        
    });

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
    activeScene = gltfScene;

    volPlayer.onReady.then(() => {
      if(sceneToBeRemoved != null) {
        scene.remove(sceneToBeRemoved);
        sceneToBeRemoved = null;
      }
     	gltfScene.scale.set(2, 2, 2);
    	gltfScene.position.set(6, 0, -15);
      scene.add(gltfScene);
      volPlayer.isPlaying = isVolPlayerPlaying;
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

  const startHula = ({scene}) => {

    ASSET_TRACKER = "hula.gltf";
    ASSET_OBJECT_PATH = ASSET_BASE_PATH + "hula/gltf/";
    ASSET_TEXTURE_PATH = ASSET_BASE_PATH + "hula/tex/";
    scene.remove(activeScene);
    boxVisible = true;
    dispose(activeScene);
    volPlayer.dispose();
    sceneToBeRemoved = hula;
    isVolPlayerPlaying = true;
    addVolumetricVideo({scene});

  }

  const dispose = (activeScene) => {

    // activeScene.geometry.dispose();
    // activeScene.material.map.dispose();
	  // activeScene.material.dispose();
	  activeScene = null;	

  }

  const startKungfu = ({scene}) => {

    ASSET_TRACKER = "kungfu.gltf";
    ASSET_OBJECT_PATH = ASSET_BASE_PATH + "kungfu/gltf/";
    ASSET_TEXTURE_PATH = ASSET_BASE_PATH + "kungfu/tex/";
    scene.remove(activeScene);
    boxVisible = true;
    dispose(activeScene);
    volPlayer.dispose();
    sceneToBeRemoved = kungfu;
    isVolPlayerPlaying = true;
    addVolumetricVideo({scene});

  }

  const touchHandler = (e) => {
    // Call XrController.recenter() when the canvas is tapped with two fingers. This resets the
    // AR camera to the position specified by XrController.updateCameraProjectionMatrix() above.
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
    
    console.log(tapPosition);

    // Raycast against the "hula" object.
    let intersects = raycaster.intersectObject(hula)

    if (intersects.length > 0 && intersects[0].object == hula) {
      // placeObject(intersects[0].point.x, intersects[0].point.z)
      console.log("Start Hula");
      volPlayer.isPlaying = false;
      startHula({scene});
    }

    intersects = raycaster.intersectObject(kungfu)

    if (intersects.length > 0 && intersects[0].object == kungfu) {
      // placeObject(intersects[0].point.x, intersects[0].point.z)
      console.log("Start Kungfu");
      volPlayer.isPlaying = false;
      startKungfu({scene});
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
      // console.log("218");
      // console.log(canvas);
      

      animate()
      function animate(time) {
        requestAnimationFrame(animate)
        if(volPlayer && volPlayer.isPlaying) {
          volPlayer.update();
          console.log(volPlayer.getCurrentFrame())
          if(volPlayer.getCurrentFrame() > 0) {
            boxVisible = false;
          } 
        }
        // stats.update();
        if(box && boxVisible) {
          box.rotation.x += 0.03;
          box.rotation.y += 0.05;
        } 

        if(!boxVisible) {
          box.visible = false;
        } else {
          box.visible = true;
        }
        
        // box.scale.multiplyScalar(0.99);
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
