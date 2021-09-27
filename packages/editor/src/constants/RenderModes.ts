export const RenderModes = {
  UNLIT: 'Unlit' as const,
  LIT: 'Lit' as const,
  SHADOW: 'Shadows' as const,
  WIREFRAME: 'Wireframe' as const,
  NORMALS: 'Normals' as const
}

export type RenderModesType =
  | typeof RenderModes.UNLIT
  | typeof RenderModes.LIT
  | typeof RenderModes.SHADOW
  | typeof RenderModes.WIREFRAME
  | typeof RenderModes.NORMALS
