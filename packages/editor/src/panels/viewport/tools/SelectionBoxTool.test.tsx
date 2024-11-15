import { describe, it } from 'node:test'
import { Box3, Frustum, Matrix4, PerspectiveCamera, Vector3 } from 'three'

//test view frustum  intersection with box
describe('SelectionBoxTool', () => {
  it('should box intersect with view frustum', () => {
    const box = new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1))
    const camera = new PerspectiveCamera(60, 1, 0.1, 10)
    camera.position.set(0, 0, 5)
    camera.lookAt(new Vector3(0, 0, 0))
    camera.updateProjectionMatrix()
    const frustum = new Frustum()
    const projScreenMatrix = new Matrix4()
    projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
    frustum.setFromProjectionMatrix(projScreenMatrix)
    const doesIntersect = frustum.intersectsBox(box)
  })
})
