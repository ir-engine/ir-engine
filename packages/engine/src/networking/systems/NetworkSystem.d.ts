import { System } from "../../ecs/classes/System";
import { NetworkSchema } from "../interfaces/NetworkSchema";
export declare class NetworkSystem extends System {
    init(schema?: NetworkSchema): void;
    static instance: NetworkSystem;
    static queryResults: any;
    execute(delta: number): void;
}
