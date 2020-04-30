export const seed = {
  disabled: (process.env.FORCE_DB_REFRESH !== 'true'),
  delete: true,
  path: 'entity-type',
  randomize: false,
  templates:
      [
        // Entities that don't have a template don't need a type
        { name: 'default' },
        // Aframe Default Types
        { name: 'box' },
        { name: 'camera' },
        { name: 'circle' },
        { name: 'cone' },
        { name: 'cursor' },
        { name: 'curvedimage' },
        { name: 'dodecahedron' },
        { name: 'gltf-model' },
        { name: 'icosahedron' },
        { name: 'image' },
        { name: 'light' },
        { name: 'link' },
        { name: 'obj-model' },
        { name: 'octahdreon' },
        { name: 'plane' },
        { name: 'ring' },
        { name: 'sky' },
        { name: 'sound' },
        { name: 'sphere' },
        { name: 'tetrahedron' },
        { name: 'text' },
        { name: 'torus-knot' },
        { name: 'torus' },
        { name: 'triangle' },
        { name: 'video' },
        { name: 'videosphere' },
        // Custom Types
        { name: 'grid' }
      ]
}

export default seed
