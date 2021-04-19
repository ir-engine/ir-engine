import { Camera, Object3D, Raycaster, Renderer, Vector2 } from "three";

export class RayCast extends Object3D{

    rayCaster : Raycaster;
    // vrControl: VRControl;
    mouse:Vector2;
    selectState:Boolean;
    objsToTest: any[];

    constructor(){
        super();
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

        this.objsToTest = [];
    }

    update(camera){
        // Find closest intersecting object

        let intersect;

        // if ( this.renderer.xr.isPresenting ) {
        //     vrControl.setFromController( 0, this.rayCaster.ray );
        //     intersect = raycast();
        //     // Position the little white dot at the end of the controller pointing ray
        //     if ( intersect ) vrControl.setPointerAt( 0, intersect.point );
        // } else
         if ( this.mouse.x !== null && this.mouse.y !== null ) {
            this.rayCaster.setFromCamera( this.mouse, camera );
            intersect = this.raycast();
        }

        // console.log('intersect', intersect);
        if(intersect && intersect.object && intersect.object.pick)
            intersect.object.pick(this.selectState);

        this.objsToTest.forEach( (obj)=> {
            if ( (!intersect || obj !== intersect.object) && obj.unpick ) {
                obj.unpick();
            }
        });
    }

    raycast() {
        return this.objsToTest.reduce( (closestIntersection, obj)=> {
            if (!obj.visible)
                return closestIntersection;

            const intersection = this.rayCaster.intersectObject( obj, true );
    
            if ( !intersection[0] ) return closestIntersection
    
            if ( !closestIntersection || intersection[0].distance < closestIntersection.distance ) {
    
                intersection[0].object = obj;
    
                return intersection[0]
    
            } else {
    
                return closestIntersection
    
            }
    
        }, null );
    
    }
}