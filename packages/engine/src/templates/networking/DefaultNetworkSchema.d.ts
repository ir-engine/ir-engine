import { NetworkSchema } from '../../networking/interfaces/NetworkSchema';
export declare const PrefabType: {
    Player: number;
    worldObject: number;
    Vehicle: number;
};
export declare const DefaultPrefabs: {
    [x: number]: import("@xr3ngine/engine/src/networking/interfaces/NetworkPrefab").NetworkPrefab;
};
export declare const DefaultNetworkSchema: NetworkSchema;
