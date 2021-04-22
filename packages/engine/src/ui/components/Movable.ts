import { Object3D } from "three";

export class Movable extends Object3D {
    constructor(){
        super();
    }

    setPosition(pos){
        this.position.set(pos[0], pos[1], pos[2]);
    }

    movePosition(pos, state){
        this.position.set(pos);//[0], pos[1], pos[2]);
        // console.log(pos, state);
    }
}