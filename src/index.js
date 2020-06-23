export { initialize } from "./initialize.js";
export * from "./components/index.js";
export * from "./systems/index.js";

const DEFAULT_OPTIONS = {
  vr: true,
  ar: false,
  mouse: true,
  keyboard: true,
  touchscreen: true,
  gamepad: true
};

export default function initializeInputSystems(world, options = DEFAULT_OPTIONS) {

// If document window exists...
// if mouse is true...
world.registerSystem(MouseInputSystem)


// If passed with VR true...
// Check if WebXR is available
// if it is, register VR system

  world.registerSystem(VRControllerInputSystem)

  if(options.vr) world.registerSystem(VRControllerSystem)

  let animationLoop = options.animationLoop;
  if (!animationLoop) {
    const clock = new THREE.Clock();
    animationLoop = () => {
      world.execute(clock.getDelta(), clock.elapsedTime);
    };
  }

  let scene = world
    .createEntity()
    .addComponent(Scene)
    .addObject3DComponent(new THREE.Scene());

  let renderer = world.createEntity().addComponent(WebGLRenderer, {
    ar: options.ar,
    vr: options.vr,
    animationLoop: animationLoop
  });

  // camera rig & controllers
  var camera = null,
    cameraRig = null;
  if (options.ar || options.vr) {
    cameraRig = world
      .createEntity()
      .addComponent(CameraRig)
      .addComponent(Parent, { value: scene })
      .addComponent(Active);
  } else {
    camera = world
      .createEntity()
      .addComponent(Camera)
      .addComponent(UpdateAspectOnResizeTag)
      .addObject3DComponent(
        new THREE.PerspectiveCamera(
          90,
          window.innerWidth / window.innerHeight,
          0.1,
          100
        ),
        scene
      )
      .addComponent(Active);
  }

  let renderPass = world.createEntity().addComponent(RenderPass, {
    scene: scene,
    camera: camera
  });

  return {
    world,
    entities: {
      scene,
      camera,
      cameraRig,
      renderer,
      renderPass
    }
  };
}
