/**
 * @author dmarcos / http://github.com/dmarcos
 *
 * This controls allow to change the orientation of the camera using the mouse
 */

THREE.DragMouseControls = function ( object ) {

    var scope = this;
    var PI_2 = Math.PI / 2;
    var mouseQuat = {
        x: new THREE.Quaternion(),
        y: new THREE.Quaternion()
    };
    var xVector = new THREE.Vector3( 1, 0, 0 );
    var yVector = new THREE.Vector3( 0, 1, 0 );
    var dragging = false;

    this.getObject = function(){
        return this.object;
    }

    var onMouseDown = function ( event ) {
    	if (event.changedTouches) {
    		lastPageX = event.changedTouches[0].pageX;
    		lastPageY = event.changedTouches[0].pageY;
    	} else {
        lastPageX = event.pageX;
        lastPageY = event.pageY;
      }
        dragging = true;
    };

    var onMouseUp = function ( event ) {
        dragging = false;
    };
 
  var lastPageY, lastPageX;

    var onMouseMove = function ( event ) {


        if (!dragging) return;

        if ( scope.enabled === false ) return;

        var orientation = scope.orientation;

        if (event.changedTouches) {
            event = event.changedTouches[0];
        }
        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || event.pageX - lastPageX;
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || event.pageY - lastPageY;
        
        if (lastPageY) {
              orientation.y += movementX * 0.0025;
              orientation.x += movementY * 0.0025;
              orientation.x = Math.max( - PI_2, Math.min( PI_2, orientation.x ) );
        }
        lastPageY = event.pageY;
        lastPageX = event.pageX;

    };

    this.enabled = true;

    this.orientation = {
        x: 0,
        y: 0,
    };

    this.update = function() {

        if ( this.enabled === false ) return;
        
        mouseQuat.x.setFromAxisAngle( xVector, this.orientation.x );
        mouseQuat.y.setFromAxisAngle( yVector, this.orientation.y );
        object.quaternion.copy( mouseQuat.y ).multiply( mouseQuat.x );
        if (this.gyro) {
            object.position.z = Math.sin(object.rotation.y) * 150;
            object.position.y = - Math.cos(object.rotation.y) * 100 + 50;
        }

    };

    this.dispose = function() {
	    document.removeEventListener('touchmove', onMouseMove, false);
	    document.removeEventListener('touchstart', onMouseDown, false);
	    document.removeEventListener('touchend', onMouseUp, false);

	    document.removeEventListener( 'mousemove', onMouseMove, false );
	    document.removeEventListener( 'mousedown', onMouseDown, false );
	    document.removeEventListener( 'mouseup', onMouseUp, false );
    }

    document.addEventListener('touchmove', onMouseMove, false);
    document.addEventListener('touchstart', onMouseDown, false);
    document.addEventListener('touchend', onMouseUp, false);

    document.addEventListener( 'mousemove', onMouseMove, false );
    document.addEventListener( 'mousedown', onMouseDown, false );
    document.addEventListener( 'mouseup', onMouseUp, false );

};
