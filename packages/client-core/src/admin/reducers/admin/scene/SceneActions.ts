export const SceneAction = {
  collectionsFetched: (collections: any[]) => {
    return {
      type: 'ADMIN_SCENES_RETRIEVED',
      collections: collections
    }
  }
}

export type SceneActionType = ReturnType<typeof SceneAction[keyof typeof SceneAction]>
