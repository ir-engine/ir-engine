enum EditorEvents {
  OBJECTS_CHANGED,

  PROJECT_LOADED,
  RENDERER_INITIALIZED,

  FLY_MODE_CHANGED,
  TRANSFROM_MODE_CHANGED,
  TRANSFORM_PIVOT_CHANGED,
  SNAP_SETTINGS_CHANGED,

  ERROR
}

export default EditorEvents
//dispatchLocal(EditorActions.sceneGraphChanged.action({}) as any)
//EditorActions.selectionChanged.callbackFunctions.add(this.onSelectionChanged)
