export const seed = {
  disabled: (process.env.FORCE_DB_REFRESH !== 'true'),
  delete: true,
  path: 'entity-type',
  randomize: false,
  templates:
      [
        // Entities that don't have a template don't need a type
        { type: 'default' },
        // Aframe Default Types
        { type: 'box' },
        { type: 'camera' },
        { type: 'circle' },
        { type: 'cone' },
        { type: 'cursor' },
        { type: 'curvedimage' },
        { type: 'dodecahedron' },
        { type: 'gltf-model' },
        { type: 'icosahedron' },
        { type: 'image' },
        { type: 'light' },
        { type: 'link' },
        { type: 'obj-model' },
        { type: 'octahdreon' },
        { type: 'plane' },
        { type: 'ring' },
        { type: 'sky' },
        { type: 'sound' },
        { type: 'sphere' },
        { type: 'tetrahedron' },
        { type: 'text' },
        { type: 'torus-knot' },
        { type: 'torus' },
        { type: 'triangle' },
        { type: 'video' },
        { type: 'videosphere' },
        // Custom Types
        { type: 'grid' }
      ]
}

export default seed
