import { Entity } from "../../ecs/classes/Entity";
import { SceneData } from "../interfaces/SceneData";
import { SceneDataComponent } from "../interfaces/SceneDataComponent";
export declare function loadScene(scene: SceneData): void;
export declare function loadComponent(entity: Entity, component: SceneDataComponent): void;
