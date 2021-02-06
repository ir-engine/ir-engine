import { SceneDataEntity } from "./SceneDataEntity";
export interface SceneData {
    id: string;
    isPublic: boolean;
    locationId: string;
    name: string;
    metadata: Record<string, any>;
    description: string;
    entities: Array<SceneDataEntity>;
    root: string;
    sid: string;
    thumbnailOwnedFileId: string;
    type: string;
    url: string;
    userId: string;
    version: number;
    createdAt: string;
    updatedAt: string;
}
