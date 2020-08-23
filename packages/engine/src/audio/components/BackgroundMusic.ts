import { Component } from "../../ecs/classes/Component";

export class BackgroundMusic extends Component<BackgroundMusic> {
    audio: any;
    src: any;
    volume: number;
    constructor() {
        super();
        this.audio = null;
        this.src = null;
        this.volume = 0.5;
    }
}
