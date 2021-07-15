import { Component } from '@xrengine/engine/src/ecs/classes/Component'
import { System } from '@xrengine/engine/src/ecs/classes/System'
import { execute } from '@xrengine/engine/src/ecs/functions/EngineFunctions'
import { addComponent, createEntity, removeComponent } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { registerSystem } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import { Types } from '@xrengine/engine/src/ecs/types/Types'
import { OrbitControls } from "@xrengine/engine/src/input/functions/OrbitControls"

import React from 'react'

import { GLTFLoader } from '@xrengine/engine/src/assets/loaders/gltf/GLTFLoader';

import { NavMeshLoader, EntityManager, Time, FollowPathBehavior, CellSpacePartitioning } from 'yuka';
import { Scene, PerspectiveCamera, LineBasicMaterial, ConeBufferGeometry, MeshBasicMaterial, HemisphereLight, WebGLRenderer, DirectionalLight, LoadingManager, InstancedMesh, Line, BufferGeometry
  }  from 'three';
import * as DAT from 'dat';

import { createConvexRegionHelper } from '@xrengine/engine/src/navigation/NavMeshHelper';
import { createCellSpaceHelper } from '@xrengine/engine/src/navigation/CellSpacePartitioningHelper';
import { CustomVehicle } from '@xrengine/engine/src/navigation/CustomVehicle';
import { PathPlanner } from '@xrengine/engine/src/navigation/PathPlanner';

// This is a component. Components are added to entities. Components hold state, but not logic -- this one holds a name
class NameComponent extends Component<NameComponent> {
  name: string
}

// Components need to have a schema so that they can construct efficiently
NameComponent._schema = {
  name: { type: Types.String, default: 'HelloWorld' }
}

// This is a system. Systems are usually stateless and logical, and perform operations on components.
// Systems can also have non-simulation side effects (input/output).
class NameSystem extends System {
  updateType = SystemUpdateType.Fixed
  /**
   * Execute the camera system for different events of queries.\
   * Called each frame by default.
   *
   * @param delta time since last frame.
   */
  execute(delta: number): void {
    this.queryResults.names?.added.forEach((entity) => {
      console.log('Added component to entity', entity.id)
      removeComponent(entity, NameComponent)
    })

    this.queryResults.names?.removed.forEach((entity) => {
      console.log('Removed component on entity', entity.id)
      setTimeout(() => {
        addComponent(entity, NameComponent)
      }, 100)
    })
  }
}

// If all of the components (or Not() components) match, this system will see that entity in their query
// Queries fire special listener events (added, removed, changed) *if* they are listened for
NameSystem.queries = {
  names: {
    components: [NameComponent],
    listen: {
      added: true,
      removed: true,
      changed: true
    }
  }
}

let renderer, scene, camera;

let entityManager, time, pathPlanner, vehicleMesh;

const vehicleCount = 100;
const vehicles = [];
const pathHelpers = [];

const params = {
  showNavigationPaths: false,
  showRegions: false,
  showSpatialIndex: false,
};

let spatialIndexHelper;
let regionHelper;

init();

function init() {
  scene = new Scene();

  camera = new PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.position.set( 60, 40, 60 );
  camera.lookAt( scene.position );

  //

  const pathMaterial = new LineBasicMaterial( { color: 0xff0000 } );

  //

  const vehicleGeometry = new ConeBufferGeometry( 0.1, 0.5, 16 );
  vehicleGeometry.rotateX( Math.PI * 0.5 );
  vehicleGeometry.translate( 0, 0.1, 0 );
  const vehicleMaterial = new MeshBasicMaterial( { color: 0xff0000 } );

  const hemiLight = new HemisphereLight( 0xffffff, 0x444444, 0.6 );
  hemiLight.position.set( 0, 100, 0 );
  scene.add( hemiLight );

  const dirLight = new DirectionalLight( 0xffffff, 0.8 );
  dirLight.position.set( 0, 200, 100 );
  scene.add( dirLight );

  // renderer

  renderer = new WebGLRenderer( { antialias: true } );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.gammaOutput = true;
  document.body.appendChild( renderer.domElement );

  // dat.gui

  const gui = new DAT.GUI( { width: 400 } );

  gui.add( params, 'showNavigationPaths', 1, 30 ).name( 'show navigation paths' ).onChange( ( value ) => {

    for ( let i = 0, l = pathHelpers.length; i < l; i ++ ) {

      pathHelpers[ i ].visible = value;

    }

  } );

  gui.add( params, 'showRegions', 1, 30 ).name( 'show regions' ).onChange( ( value ) => {

    regionHelper.visible = value;

  } );

  gui.add( params, 'showSpatialIndex', 1, 30 ).name( 'show spatial index' ).onChange( ( value ) => {

    spatialIndexHelper.visible = value;

  } );

  gui.open();

  const controls = new OrbitControls( camera, renderer.domElement );
  controls.minDistance = 10;
  controls.maxDistance = 200;

  //

  window.addEventListener( 'resize', onWindowResize, false );
  const loadingManager = new LoadingManager( () => {

    // 3D assets are loaded, now load nav mesh

    const loader = new NavMeshLoader();
    loader.load( '../common/navmeshes/complex/navmesh.glb' ).then( ( navigationMesh ) => {

      // visualize convex regions

      regionHelper = createConvexRegionHelper( navigationMesh );
      regionHelper.visible = false;
      scene.add( regionHelper );

      entityManager = new EntityManager();
      time = new Time();

      pathPlanner = new PathPlanner( navigationMesh );

      // setup spatial index

      const width = 100, height = 40, depth = 75;
      const cellsX = 20, cellsY = 5, cellsZ = 20;

      navigationMesh.spatialIndex = new CellSpacePartitioning( width, height, depth, cellsX, cellsY, cellsZ );
      navigationMesh.updateSpatialIndex();

      spatialIndexHelper = createCellSpaceHelper( navigationMesh.spatialIndex );
      scene.add( spatialIndexHelper );
      spatialIndexHelper.visible = false;

      // create vehicles

      vehicleMesh = new InstancedMesh( vehicleGeometry, vehicleMaterial, vehicleCount );
      vehicleMesh.frustumCulled = false;
      scene.add( vehicleMesh );

      for ( let i = 0; i < vehicleCount; i ++ ) {

        // path helper

        const pathHelper = new Line( new BufferGeometry(), pathMaterial );
        pathHelper.visible = false;
        scene.add( pathHelper );
        pathHelpers.push( pathHelper );

        // vehicle

        const vehicle = new CustomVehicle();
        vehicle.navMesh = navigationMesh;
        vehicle.maxSpeed = 1.5;
        vehicle.maxForce = 10;

        const toRegion = vehicle.navMesh.getRandomRegion();
        vehicle.position.copy( toRegion.centroid );
        vehicle.toRegion = toRegion;

        const followPathBehavior = new FollowPathBehavior();
        followPathBehavior.nextWaypointDistance = 0.5;
        followPathBehavior.active = false;
        vehicle.steering.add( followPathBehavior );

        entityManager.add( vehicle );
        vehicles.push( vehicle );

      }

      // update UI

      const entityCount = document.getElementById( 'entityCount' );
      entityCount.textContent = vehicleCount.toString();

      const regionCount = document.getElementById( 'regionCount' );
      regionCount.textContent = navigationMesh.regions.length;

      const partitionCount = document.getElementById( 'partitionCount' );
      partitionCount.textContent = navigationMesh.spatialIndex.cells.length;

      const loadingScreen = document.getElementById( 'loading-screen' );

      loadingScreen.classList.add( 'fade-out' );
      loadingScreen.addEventListener( 'transitionend', onTransitionEnd );

      //

      animate();

    } );

  } );

  //

  const glTFLoader = new GLTFLoader( loadingManager );
  glTFLoader.load( 'model/level.glb', ( gltf ) => {

    // add object to scene

    scene.add( gltf.scene );
    gltf.scene.rotation.y = Math.PI;

  } );

}

function onPathFound( vehicle, path ) {

  // update path helper

  const index = vehicles.indexOf( vehicle );
  const pathHelper = pathHelpers[ index ];

  pathHelper.geometry.dispose();
  pathHelper.geometry = new BufferGeometry().setFromPoints( path );

  // update path and steering

  const followPathBehavior = vehicle.steering.behaviors[ 0 ];
  followPathBehavior.active = true;
  followPathBehavior.path.clear();

  for ( const point of path ) {

    followPathBehavior.path.add( point );

  }

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

  requestAnimationFrame( animate );

  updatePathfinding();

  const delta = time.update().getDelta();

  entityManager.update( delta );

  pathPlanner.update();

  updateInstancing();

  renderer.render( scene, camera );

}

function updatePathfinding() {

  for ( let i = 0, l = vehicles.length; i < l; i ++ ) {

    const vehicle = vehicles[ i ];

    if ( vehicle.currentRegion === vehicle.toRegion ) {

      vehicle.fromRegion = vehicle.toRegion;
      vehicle.toRegion = vehicle.navMesh.getRandomRegion();

      const from = vehicle.position;
      const to = vehicle.toRegion.centroid;

      pathPlanner.findPath( vehicle, from, to, onPathFound );

    }

  }

}

function updateInstancing() {

  for ( let i = 0, l = vehicles.length; i < l; i ++ ) {

    const vehicle = vehicles[ i ];

    vehicleMesh.setMatrixAt( i, vehicle.worldMatrix );

  }

  vehicleMesh.instanceMatrix.needsUpdate = true;

}

function onTransitionEnd( event ) {

  event.target.remove();

}


// This is a functional React component
const HelloWorld = () => {









  
  // Register our system with the engine
  registerSystem(NameSystem)
  // Create a new entity
  const myEntity = createEntity()
  // Add a name component to it
  addComponent(myEntity, NameComponent)
  // Create a simple timer
  setInterval(() => {
    // We're only executing fixed update systems, but there are other update types
    execute(0.1, 0, SystemUpdateType.Fixed)
  }, 100)
  // Some JSX to keep the compiler from complaining
  return (
      <section id="loading-screen">
      <div className="spinner">
        <div className="rect1"></div>
        <div className="rect2"></div>
        <div className="rect3"></div>
        <div className="rect4"></div>
        <div className="rect5"></div>
      </div>
    </section>
  )
}

export default HelloWorld
