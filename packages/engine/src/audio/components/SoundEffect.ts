import { Component } from "../../ecs/classes/Component";

export class SoundEffect extends Component<SoundEffect> {
    audio: any;
    src: any;
    volume: number;
    constructor() {
        super();
        this.audio = null;
        this.src = null;
        this.volume = 1.0;
    }
}
