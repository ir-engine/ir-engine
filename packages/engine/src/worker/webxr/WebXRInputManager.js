import { ArrayCamera, EventDispatcher, PerspectiveCamera, Vector3, Vector4 } from 'three';
import { WebGLAnimation } from './WebGLAnimation.js';
import { WebXRController } from './WebXRController.js';

export class WebXRInputManager extends EventDispatcher {
  constructor( renderer, gl ) {
    super()

    this.renderer = renderer;
    this.gl = gl;
    this.session = null;
  
    this.framebufferScaleFactor = 1.0;
  
    this.referenceSpace = null;
    this.referenceSpaceType = 'local-floor';
  
    this.pose = null;
  
    this.controllers = [];
    this.inputSourcesMap = new Map();
  
    //
  
    this.cameraL = new PerspectiveCamera();
    this.cameraL.layers.enable( 1 );
    this.cameraL.viewport = new Vector4();
  
    this.cameraR = new PerspectiveCamera();
    this.cameraR.layers.enable( 2 );
    this.cameraR.viewport = new Vector4();
  
    this.cameras = [ this.cameraL, this.cameraR ];
  
    this.cameraVR = new ArrayCamera();
    this.cameraVR.layers.enable( 1 );
    this.cameraVR.layers.enable( 2 );
  
    this._currentDepthNear = null;
    this._currentDepthFar = null;
  
    //
  
    this.enabled = false;
  
    this.isPresenting = false;

    this.onSessionEvent = this.onSessionEvent.bind(this);
    this.onSessionEnd = this.onSessionEnd.bind(this);
    this.onInputSourcesChange = this.onInputSourcesChange.bind(this);
    this.onAnimationFrame = this.onAnimationFrame.bind(this);

    this.cameraLPos = new Vector3();
    this.cameraRPos = new Vector3();

    this.onAnimationFrameCallback = null;

    this.animation = new WebGLAnimation();
    this.animation.setAnimationLoop( this.onAnimationFrame );
  
  }

	getController ( index ) {

		let controller = this.controllers[ index ];

		if ( controller === undefined ) {

			controller = new WebXRController();
			this.controllers[ index ] = controller;

		}

		return controller.getTargetRaySpace();

	};

	getControllerGrip ( index ) {

		let controller = this.controllers[ index ];

		if ( controller === undefined ) {

			controller = new WebXRController();
			this.controllers[ index ] = controller;

		}

		return controller.getGripSpace();

	};

	getHand ( index ) {

		let controller = this.controllers[ index ];

		if ( controller === undefined ) {

			controller = new WebXRController();
			this.controllers[ index ] = controller;

		}

		return controller.getHandSpace();

	};

	//

	onSessionEvent( event ) {

		const controller = this.inputSourcesMap.get( event.inputSource );

		if ( controller ) {

			controller.dispatchEvent( { type: event.type, data: event.inputSource } );

		}

	}

	onSessionEnd() {

		this.inputSourcesMap.forEach( function ( controller, inputSource ) {

			controller.disconnect( inputSource );

		} );

		this.inputSourcesMap.clear();

		this._currentDepthNear = null;
		this._currentDepthFar = null;

		//

		// this.renderer.setFramebuffer( null );
		// this.renderer.setRenderTarget( this.renderer.getRenderTarget() ); // Hack #15830
		this.animation.stop();

		this.isPresenting = false;

		this.dispatchEvent( { type: 'sessionend' } );

	}

	setFramebufferScaleFactor ( value ) {

		this.framebufferScaleFactor = value;

		if ( this.isPresenting === true ) {

			console.warn( 'THREE.WebXRManager: Cannot change framebuffer scale while presenting.' );

		}

	};

	setReferenceSpaceType ( value ) {

		this.referenceSpaceType = value;

		if ( this.isPresenting === true ) {

			console.warn( 'THREE.WebXRManager: Cannot change reference space type while presenting.' );

		}

	};

	getReferenceSpace () {

		return this.referenceSpace;

	};

	getSession () {

		return this.session;

	};

	async setSession ( value ) {

		this.session = value;

		if ( this.session !== null ) {

			this.session.addEventListener( 'select', this.onSessionEvent );
			this.session.addEventListener( 'selectstart', this.onSessionEvent );
			this.session.addEventListener( 'selectend', this.onSessionEvent );
			this.session.addEventListener( 'squeeze', this.onSessionEvent );
			this.session.addEventListener( 'squeezestart', this.onSessionEvent );
			this.session.addEventListener( 'squeezeend', this.onSessionEvent );
			this.session.addEventListener( 'end', this.onSessionEnd );
			this.session.addEventListener( 'inputsourceschange', this.onInputSourcesChange );

			this.referenceSpace = await this.session.requestReferenceSpace( this.referenceSpaceType );

			this.animation.setContext( this.session );
			this.animation.start();

			this.isPresenting = true;

			this.dispatchEvent( { type: 'sessionstart' } );

		}

	};

	onInputSourcesChange( event ) {

		const inputSources = this.session.inputSources;

		// Assign inputSources to available controllers

		for ( let i = 0; i < this.controllers.length; i ++ ) {

			this.inputSourcesMap.set( inputSources[ i ], this.controllers[ i ] );

		}

		// Notify disconnected

		for ( let i = 0; i < event.removed.length; i ++ ) {

			const inputSource = event.removed[ i ];
			const controller = this.inputSourcesMap.get( inputSource );

			if ( controller ) {

				controller.dispatchEvent( { type: 'disconnected', data: inputSource } );
				this.inputSourcesMap.delete( inputSource );

			}

		}

		// Notify connected

		for ( let i = 0; i < event.added.length; i ++ ) {

			const inputSource = event.added[ i ];
			const controller = this.inputSourcesMap.get( inputSource );

			if ( controller ) {

				controller.dispatchEvent( { type: 'connected', data: inputSource } );

			}

		}

	}

	//
	/**
	 * Assumes 2 cameras that are parallel and share an X-axis, and that
	 * the cameras' projection and world matrices have already been set.
	 * And that near and far planes are identical for both cameras.
	 * Visualization of this technique: https://computergraphics.stackexchange.com/a/4765
	 */
	setProjectionFromUnion( camera, cameraL, cameraR ) {

		this.cameraLPos.setFromMatrixPosition( cameraL.matrixWorld );
		this.cameraRPos.setFromMatrixPosition( cameraR.matrixWorld );

		const ipd = this.cameraLPos.distanceTo( cameraRPos );

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
		camera.matrixWorldInverse.copy( camera.matrixWorld ).invert();

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

	updateCamera( camera, parent ) {

		if ( parent === null ) {

			camera.matrixWorld.copy( camera.matrix );

		} else {

			camera.matrixWorld.multiplyMatrices( parent.matrixWorld, camera.matrix );

		}

		camera.matrixWorldInverse.copy( camera.matrixWorld ).invert();

	}

	getCamera ( camera ) {

		this.cameraVR.near = this.cameraR.near = this.cameraL.near = camera.near;
		this.cameraVR.far = this.cameraR.far = this.cameraL.far = camera.far;

		if ( this._currentDepthNear !== this.cameraVR.near || this._currentDepthFar !== this.cameraVR.far ) {

			// Note that the new renderState won't apply until the next frame. See #18320

			this.session.updateRenderState( {
				depthNear: this.cameraVR.near,
				depthFar: this.cameraVR.far
			} );

			this._currentDepthNear = this.cameraVR.near;
			this._currentDepthFar = this.cameraVR.far;

		}

		const parent = camera.parent;
		const cameras = this.cameraVR.cameras;

		this.updateCamera( this.cameraVR, parent );

		for ( let i = 0; i < cameras.length; i ++ ) {

			this.updateCamera( cameras[ i ], parent );

		}

		// update camera and its children

		camera.matrixWorld.copy( this.cameraVR.matrixWorld );
		camera.matrix.copy( this.cameraVR.matrix );
		camera.matrix.decompose( camera.position, camera.quaternion, camera.scale );

		const children = camera.children;

		for ( let i = 0, l = children.length; i < l; i ++ ) {

			children[ i ].updateMatrixWorld( true );

		}

		// update projection matrix for proper view frustum culling

		if ( cameras.length === 2 ) {

			this.setProjectionFromUnion( this.cameraVR, this.cameraL, this.cameraR );

		} else {

			// assume single camera setup (AR)

			this.cameraVR.projectionMatrix.copy( this.cameraL.projectionMatrix );

		}

		return this.cameraVR;

	};

	// Animation Loop

	

	onAnimationFrame( time, frame ) {

    // console.log('WebXRInputManager', this, time, frame)

		this.pose = frame.getViewerPose( this.referenceSpace );

		if ( this.pose !== null ) {

			const views = this.pose.views;
			const baseLayer = this.session.renderState.baseLayer;

			// this.renderer.setFramebuffer( baseLayer.framebuffer );

			let cameraVRNeedsUpdate = false;

			// check if it's necessary to rebuild cameraVR's camera list

			if ( views.length !== this.cameraVR.cameras.length ) {

				this.cameraVR.cameras.length = 0;
				cameraVRNeedsUpdate = true;

			}

			for ( let i = 0; i < views.length; i ++ ) {

				const view = views[ i ];
				const viewport = baseLayer.getViewport( view );

				const camera = this.cameras[ i ];
				camera.matrix.fromArray( view.transform.matrix );
				camera.projectionMatrix.fromArray( view.projectionMatrix );
				camera.viewport.set( viewport.x, viewport.y, viewport.width, viewport.height );

				if ( i === 0 ) {

					this.cameraVR.matrix.copy( camera.matrix );

				}

				if ( cameraVRNeedsUpdate === true ) {

					this.cameraVR.cameras.push( camera );

				}

			}

		}

		//

		const inputSources = this.session.inputSources;

		for ( let i = 0; i < this.controllers.length; i ++ ) {

			const controller = this.controllers[ i ];
			const inputSource = inputSources[ i ];

			controller.update( inputSource, frame, this.referenceSpace );

		}

		if ( this.onAnimationFrameCallback ) this.onAnimationFrameCallback( time, frame );

	}

	setAnimationLoop ( callback ) {

		this.onAnimationFrameCallback = callback;

	};

	dispose () {};

}