import { Engine } from "@xr3ngine/engine/src/ecs/classes/Engine";
import { ArrayCamera, PerspectiveCamera, Vector3, Vector4, XRWebGLLayer } from "three";
import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { getComponent } from '../../ecs/functions/EntityFunctions';
import { WebXRSession } from "../components/WebXRSession";


const cameraLPos = new Vector3();
const cameraRPos = new Vector3();

const cameraL = new PerspectiveCamera();
cameraL.layers.enable( 1 );
// cameraL.viewport = new Vector4();

const cameraR = new PerspectiveCamera();
cameraR.layers.enable( 2 );
// cameraR.viewport = new Vector4();

const cameras = [ cameraL, cameraR ];

const cameraVR = new ArrayCamera();
cameraVR.layers.enable( 1 );
cameraVR.layers.enable( 2 );


function updateCamera( camera, parent ) {
	if ( parent === null ) {
		camera.matrixWorld.copy( camera.matrix );
	} else {
		camera.matrixWorld.multiplyMatrices( parent.matrixWorld, camera.matrix );
	}
	camera.matrixWorldInverse.getInverse( camera.matrixWorld );
}



export function onFrameXR(timestamp, xrFrame, callbacks) {
  const session = xrFrame.session;
  const pose = xrFrame.getViewerPose(Engine.xrReferenceSpace);

  if ( pose !== null ) {
    const views = pose.views;
    const glLayer = session.renderState.baseLayer;
    // Run imaginary 3D engine's simulation to step forward physics, animations, etc.
    //scene.updateScene(timestamp, xrFrame);
  //  Engine.renderer.setFramebuffer( glLayer.framebuffer );
    Engine.context.bindFramebuffer(Engine.context.FRAMEBUFFER, glLayer.framebuffer);
    Engine.context.clear(Engine.context.COLOR_BUFFER_BIT | Engine.context.DEPTH_BUFFER_BIT);

/*
    for (let view of pose.views) {
      let viewport = glLayer.getViewport(view);
      Engine.context.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
    //  Engine.scene.draw(view.projectionMatrix, view.transform);
      if (callbacks.render) callbacks.render();
    }
*/
    let cameraVRNeedsUpdate = false;

    if ( views.length !== cameraVR.cameras.length ) {

      cameraVR.cameras.length = 0;
      cameraVRNeedsUpdate = true;

    }


    for ( let i = 0; i < views.length; i ++ ) {

				const view = views[ i ];
				const viewport = glLayer.getViewport( view );

				const camera = cameras[ i ];
				camera.matrix.fromArray( view.transform.matrix );
				camera.projectionMatrix.fromArray( view.projectionMatrix );
				// camera.viewport.set( viewport.x, viewport.y, viewport.width, viewport.height );

				if ( i === 0 ) {

					cameraVR.matrix.copy( camera.matrix );

				}

				if ( cameraVRNeedsUpdate === true ) {

					cameraVR.cameras.push( camera );

				}

			}

      if (callbacks.render) callbacks.render(Engine.scene, cameraVR);

  }
}


export const initializeSession: Behavior = (entity: Entity) => {

  const { session } = getComponent(entity, WebXRSession);
  const context = null; // createWebGLContext();

   session.requestReferenceSpace("local").then((referenceSpace) => {
     Engine.xrReferenceSpace = referenceSpace
     /*
     referenceSpace = await worldData.session.requestReferenceSpace("unbounded");
  worldData.referenceSpace = referenceSpace.getOffsetReferenceSpace(
        new XRRigidTransform(worldData.playerSpawnPosition, worldData.playerSpawnOrientation));
  worldData.animationFrameRequestID = worldData.session.requestAnimationFrame(onDrawFrame);
*/
   }).then(()=>{
     return context.makeXRCompatible().then(() => {
       /*
       const layerInit = {
				antialias: attributes.antialias,
				alpha: attributes.alpha,
				depth: attributes.depth,
				stencil: attributes.stencil,
				framebufferScaleFactor: framebufferScaleFactor
			};
      session.updateRenderState({ baseLayer: new XRWebGLLayer(session, context, layerInit) });
      */
      session.updateRenderState({ baseLayer: new XRWebGLLayer(session, context) });
    })
   }).then(() => {
    Engine.context = context
    Engine.xrSession = session
  });

};

function setProjectionFromUnion( camera, cameraL, cameraR ) {

		cameraLPos.setFromMatrixPosition( cameraL.matrixWorld );
		cameraRPos.setFromMatrixPosition( cameraR.matrixWorld );

		const ipd = cameraLPos.distanceTo( cameraRPos );

		const projL = cameraL.projectionMatrix.elements;
		const projR = cameraR.projectionMatrix.elements;

		// VR systems will have identical far and near planes, and
		// most likely identical top and bottom frustum extents.
		// Use the left camera for these values.
		const near = projL[ 14 ] / ( projL[ 10 ] - 1 );
		const far = projL[ 14 ] / ( projL[ 10 ] + 1 );
		const topFov = ( projL[ 9 ] + 1 ) / projL[ 5 ];
		const bottomFov = ( projL[ 9 ] - 1 ) / projL[ 5 ];

		const leftFov = ( projL[ 8 ] - 1 ) / projL[ 0 ];
		const rightFov = ( projR[ 8 ] + 1 ) / projR[ 0 ];
		const left = near * leftFov;
		const right = near * rightFov;

		// Calculate the new camera's position offset from the
		// left camera. xOffset should be roughly half `ipd`.
		const zOffset = ipd / ( - leftFov + rightFov );
		const xOffset = zOffset * - leftFov;

		// TODO: Better way to apply this offset?
		cameraL.matrixWorld.decompose( camera.position, camera.quaternion, camera.scale );
		camera.translateX( xOffset );
		camera.translateZ( zOffset );
		camera.matrixWorld.compose( camera.position, camera.quaternion, camera.scale );
		camera.matrixWorldInverse.getInverse( camera.matrixWorld );

		// Find the union of the frustum values of the cameras and scale
		// the values so that the near plane's position does not change in world space,
		// although must now be relative to the new union camera.
		const near2 = near + zOffset;
		const far2 = far + zOffset;
		const left2 = left - xOffset;
		const right2 = right + ( ipd - xOffset );
		const top2 = topFov * far / far2 * near2;
		const bottom2 = bottomFov * far / far2 * near2;

		camera.projectionMatrix.makePerspective( left2, right2, top2, bottom2, near2, far2 );

	}
