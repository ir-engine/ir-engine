export type ModelTransformParameters = {
  useDraco: boolean
  useMeshopt: boolean
  useMeshQuantization: boolean
  textureFormat: 'default' | 'jpg' | 'ktx2' | 'png' | 'webp'
  maxTextureSize: number
  modelFormat: 'glb' | 'gltf'
}
