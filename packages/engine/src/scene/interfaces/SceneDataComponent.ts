export interface SceneDataComponent {
    id: string
    entityId: string
    sceneEntityId: string
    name: string
    type: string
    data: Record<string, any>
    props: Record<string, any>
    createdAt: string
    updatedAt: string
}