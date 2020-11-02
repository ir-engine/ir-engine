import { Engine } from "@xr3ngine/engine/src/ecs/classes/Engine";
import { Entity } from '../../ecs/classes/Entity';
import { createEntity, addComponent } from '../../ecs/functions/EntityFunctions';
import { WebXRSession } from '../components/WebXRSession';
import { WebXRSpace } from '../components/WebXRSpace';
import { XRSession, XRFrame, XRReferenceSpace, XRInputSource } from '../types/WebXR';


export function initVR () {
  const button = document.createElement( 'button' );
	button.id = 'VRButton';
	button.style.display = 'none';

	stylizeElement( button );

  document.body.appendChild( button );
	Engine.renderer.xr.enabled = true;
	Engine.renderer.xr.setReferenceSpaceType( 'local-floor' );
	navigator.xr.isSessionSupported( 'immersive-vr' ).then( function ( supported ) {
		supported ? showEnterVR(button) : showWebXRNotFound(button);
	});
};


function showEnterVR( button ) {

	function onSessionStarted( session ) {
		Engine.renderer.xr.setSession( session );
		button.textContent = 'EXIT VR'
	}

	function onSessionEnded() {
		button.textContent = 'ENTER VR'
	}

	button.onclick = function () {
		if ( Engine.xrSession === null ) {

			const sessionInit = { optionalFeatures: [ 'local-floor', 'bounded-floor' ] };
		//	var sessionInit = { optionalFeatures: [ "unbounded" ] };
		//	var sessionInit = { optionalFeatures:  [ "local" ] };
			navigator.xr.requestSession( "immersive-vr", sessionInit ).then((session) => {
        addComponent(createEntity(), WebXRSession, { session });
				Engine.xrSession = session;
        onSessionStarted(session)
      });

		} else {
      Engine.xrSession.end();
			Engine.xrSession = null;
			onSessionEnded();
		}
	};
};
/*
export function createWebGLContext() {
  let webglCanvas = document.querySelector("canvas");
  let contextTypes =  ['webgl2','webgl', 'experimental-webgl'];
  let context = null;
  for (let contextType of contextTypes) {
    context = webglCanvas.getContext(contextType, { xrCompatible: true });
    if (context) {
      break;
    }
  }
  if (!context) {
    console.error('This browser does not support WebGL');
    return null;
  }
  return context;
}
*/
function disableButton() {
	button.style.display = '';
	button.style.cursor = 'auto';
	button.style.left = 'calc(50% - 75px)';
	button.style.width = '150px';
	button.onmouseenter = null;
	button.onmouseleave = null;
	button.onclick = null;
}

function showWebXRNotFound(button) {
	disableButton();
	button.textContent = 'VR NOT SUPPORTED';
}

function stylizeElement( element ) {
	element.style.position = 'absolute';
	element.style.bottom = '20px';
	element.style.padding = '12px 6px';
	element.style.border = '1px solid #fff';
	element.style.borderRadius = '4px';
	element.style.background = 'rgba(0,0,0,0.1)';
	element.style.color = '#fff';
	element.style.font = 'normal 13px sans-serif';
	element.style.textAlign = 'center';
	element.style.opacity = '0.5';
	element.style.outline = 'none';
	element.style.zIndex = '999';
	element.style.display = '';
	element.style.cursor = 'pointer';
	element.style.left = 'calc(50% - 50px)';
	element.style.width = '100px';
	element.textContent = 'ENTER VR';
	element.onmouseenter = function () {
		element.style.opacity = '1.0';
	}
	element.onmouseleave = function () {
		element.style.opacity = '0.5';
	}
};
