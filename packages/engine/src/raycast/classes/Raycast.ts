import { Camera, Object3D, Raycaster, Renderer, Vector2 } from "three";

class RayCast extends Object3D{

    renderer : Renderer;
    rayCaster : Raycaster;
    // vrControl: VRControl;
    mouse:Vector2;
    camera:Camera;
    selectState:Boolean;
    objsToTest: [];

    constructor(renderer, camera){
        super();

        this.renderer = renderer;
        this.camera = camera;
        this.init();
    }

    addObject(object){
        this.objsToTest.push(object);
    }

    init(){
        this.rayCaster = new Raycaster();
        this.selectState = false;

        this.mouse = new Vector2();
        this.mouse.x = this.mouse.y = null;

        window.addEventListener( 'pointermove', ( event )=>{
            this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        });

        window.addEventListener( 'pointerdown', ()=> { this.selectState = true });

        window.addEventListener( 'pointerup', ()=> { this.selectState = false });

        window.addEventListener( 'touchstart', ( event )=> {
            this.selectState = true;
            this.mouse.x = ( event.touches[0].clientX / window.innerWidth ) * 2 - 1;
            this.mouse.y = - ( event.touches[0].clientY / window.innerHeight ) * 2 + 1;
        });

        window.addEventListener( 'touchend', ()=> {
            this.selectState = false;
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    update(){
        // Find closest intersecting object

        let intersect;

        // if ( this.renderer.xr.isPresenting ) {
        //     vrControl.setFromController( 0, this.rayCaster.ray );
        //     intersect = raycast();
        //     // Position the little white dot at the end of the controller pointing ray
        //     if ( intersect ) vrControl.setPointerAt( 0, intersect.point );
        // } else
         if ( this.mouse.x !== null && this.mouse.y !== null ) {

            this.rayCaster.setFromCamera( this.mouse, this.camera );

            intersect = this.raycast();
        };

        // Update targeted button state (if any)

        if ( intersect && intersect.object.isUI ) {
            if ( this.selectState ) {
                // Component.setState internally call component.set with the options you defined in component.setupState
                intersect.object.setState( 'selected' );
            } else {
                // Component.setState internally call component.set with the options you defined in component.setupState
                intersect.object.setState( 'hovered' );
            };
        };

        // Update non-targeted buttons state

        this.objsToTest.forEach( (obj)=> {

            if ( (!intersect || obj !== intersect.object) && obj.isUI ) {

                // Component.setState internally call component.set with the options you defined in component.setupState
                obj.setState( 'idle' );
            };
        });
    }

    raycast() {
        return this.objsToTest.reduce( (closestIntersection, obj)=> {
    
            const intersection = this.rayCaster.intersectObject( obj, true );
    
            if ( !intersection[0] ) return closestIntersection
    
            if ( !closestIntersection || intersection[0].distance < closestIntersection.distance ) {
    
                intersection[0].object = obj;
    
                return intersection[0]
    
            } else {
    
                return closestIntersection
    
            };
    
        }, null );
    
    };
}