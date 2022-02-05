import { Material, Mesh } from 'three'

export function forEachMaterial(mesh: Mesh, fn: (material: Material) => void) {
  if (!mesh.material) return

  if (Array.isArray(mesh.material)) {
    mesh.material.forEach(fn)
  } else {
    fn(mesh.material)
  }
}

export function traverseMaterials(mesh: Mesh, fn: (material: Material) => void) {
  mesh.traverse((m: Mesh) => forEachMaterial(m, fn))
}

export function collectUniqueMaterials(mesh: Mesh) {
  const materials = new Set<Material>()
  traverseMaterials(mesh, (material) => materials.add(material))
  return Array.from(materials)
}
