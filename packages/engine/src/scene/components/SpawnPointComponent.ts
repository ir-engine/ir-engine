import { Component } from '../../ecs/classes/Component';
import { Entity } from '../../ecs/classes/Entity';

export default class SpawnPointComponent extends Component<any> {
    static spawnPoints: Entity[] = []
    constructor(){
        super();
        SpawnPointComponent.spawnPoints.push(this.entity);
    }
    dispose(){
        SpawnPointComponent.spawnPoints.splice( SpawnPointComponent.spawnPoints.indexOf(this.entity));
    }
}
