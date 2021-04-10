import { GameObject } from "../components/GameObject";

export interface GameObjectPrefab {
    create: () => GameObject
    destroy: () => void
}