import { Entity } from "../../ecs/classes/Entity";
import { AssetLoader } from "../components/AssetLoader";
/**
 * Process Asset model and map it with given entity.
 * @param entity Entity to which asset will be added.
 * @param component An Asset loader Component holds specifications for the asset.
 * @param asset Loaded asset.
 */
export declare function ProcessModelAsset(entity: Entity, component: AssetLoader, asset: any): void;
