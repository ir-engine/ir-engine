/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Matrix3,
  Matrix4,
  Mesh,
  Object3D,
  Quaternion,
  ShaderMaterial,
  Texture,
  Vector2,
  Vector3,
  Vector4
} from 'three'

import LogarithmicDepthBufferMaterialChunk from '@ir-engine/spatial/src/renderer/constants/LogarithmicDepthBufferMaterialChunk'

/**
 * @author Mark Kellogg - http://www.github.com/mkkellogg
 */

//=======================================
// Trail Renderer
//=======================================

const MaxHeadVertices = 128
const PositionComponentCount = 3
const UVComponentCount = 2
const IndicesPerFace = 3
const FacesPerQuad = 2

const tempPosition = new Vector3()

const tempMatrix4 = new Matrix4()
const LocalOrientationTangent = new Vector3(1, 0, 0)
const LocalHeadOrigin = new Vector3(0, 0, 0)
const tempQuaternion = new Quaternion()
const tempOffset = new Vector3()
const tempLocalHeadGeometry: Vector3[] = []

const tempMatrix3 = new Matrix3()
const worldOrientation = new Vector3()
const tempDirection = new Vector3()

const tempLocalHeadGeometry2: Vector3[] = []
for (let i = 0; i < MaxHeadVertices; i++) {
  const vertex = new Vector3()
  tempLocalHeadGeometry2.push(vertex)
}

function getMatrix3FromMatrix4(matrix3, matrix4) {
  const e = matrix4.elements
  matrix3.set(e[0], e[1], e[2], e[4], e[5], e[6], e[8], e[9], e[10])
}

for (let i = 0; i < MaxHeadVertices; i++) {
  const vertex = new Vector3()
  tempLocalHeadGeometry.push(vertex)
}

const BaseVertexVars = [
  'attribute float nodeID;',
  'attribute float nodeVertexID;',
  'attribute vec3 nodeCenter;',

  'uniform float minID;',
  'uniform float maxID;',
  'uniform float trailLength;',
  'uniform float maxTrailLength;',
  'uniform float verticesPerNode;',
  'uniform vec2 textureTileFactor;',

  'uniform vec4 headColor;',
  'uniform vec4 tailColor;',

  'varying vec4 vColor;',
  '#include <logdepthbuf_pars_vertex>',
  LogarithmicDepthBufferMaterialChunk
].join('\n')

// const TexturedVertexVars = [BaseVertexVars, 'varying vec2 vUV;', 'uniform float dragTexture;'].join('\n')

const BaseFragmentVars = [
  'varying vec4 vColor;',
  'uniform sampler2D texture;',
  '#include <logdepthbuf_pars_fragment>'
].join('\n')

// const TexturedFragmentVars = [BaseFragmentVars, 'varying vec2 vUV;'].join('\n')

const VertexShaderCore = [
  'float fraction = ( maxID - nodeID ) / ( maxID - minID );',
  'vColor = ( 1.0 - fraction ) * headColor + fraction * tailColor;',
  'vec4 realPosition = vec4( ( 1.0 - fraction ) * position.xyz + fraction * nodeCenter.xyz, 1.0 ); '
].join('\n')

const BaseVertexShader = [
  BaseVertexVars,

  'void main() { ',
  VertexShaderCore,
  'gl_Position = projectionMatrix * viewMatrix * realPosition;',
  '#include <logdepthbuf_vertex>',
  '}'
].join('\n')

const BaseFragmentShader = [
  BaseFragmentVars,
  'void main() { ',
  '#include <logdepthbuf_fragment>',
  'gl_FragColor = vColor;',
  '}'
].join('\n')

// const TexturedVertexShader = [
//   TexturedVertexVars,

//   'void main() { ',

//   VertexShaderCore,
//   'float s = 0.0;',
//   'float t = 0.0;',
//   'if ( dragTexture == 1.0 ) { ',
//   '   s = fraction *  textureTileFactor.s; ',
//   ' 	t = ( nodeVertexID / verticesPerNode ) * textureTileFactor.t;',
//   '} else { ',
//   '	s = nodeID / maxTrailLength * textureTileFactor.s;',
//   ' 	t = ( nodeVertexID / verticesPerNode ) * textureTileFactor.t;',
//   '}',
//   'vUV = vec2( s, t ); ',
//   'gl_Position = projectionMatrix * viewMatrix * realPosition;',

//   '}'
// ].join('\n')

// const TexturedFragmentShader = [
//   TexturedFragmentVars,

//   'void main() { ',

//   'vec4 textureColor = texture2D( texture, vUV );',
//   'gl_FragColor = vColor * textureColor;',

//   '}'
// ].join('\n')

type TrailRendererUniforms = {
  trailLength: { value: number }
  verticesPerNode: { value: number }
  minID: { value: number }
  maxID: { value: number }
  headColor: { value: Vector4 }
  tailColor: { value: Vector4 }
  textureTileFactor: { value: Vector2 }
  texture: { value: Texture }
  dragTexture: { value: number }
}

class TrailRenderer extends Mesh<BufferGeometry, ShaderMaterial> {
  orientToMovement = false
  mesh: Mesh
  nodeCenters: Vector3[]
  lastNodeCenter: Vector3
  currentNodeCenter: Vector3
  lastOrientationDir: Vector3
  nodeIDs: number[]
  currentLength = 0
  currentEnd = 0
  currentNodeID = 0

  length = 200
  localHeadGeometry: Vector3[]
  // Test fix
  VerticesPerNode = 10
  vertexCount = 10
  faceCount = 10
  FacesPerNode = 10
  FaceIndicesPerNode = 10

  targetObject: Object3D
  dragTexture = false

  static createMaterial(vertexShader, fragmentShader, customUniforms: any = {}) {
    customUniforms.trailLength = { type: 'f', value: null }
    customUniforms.verticesPerNode = { type: 'f', value: null }
    customUniforms.minID = { type: 'f', value: null }
    customUniforms.maxID = { type: 'f', value: null }
    customUniforms.dragTexture = { type: 'f', value: null }
    customUniforms.maxTrailLength = { type: 'f', value: null }
    customUniforms.textureTileFactor = { type: 'v2', value: null }

    customUniforms.headColor = { type: 'v4', value: new Vector4(1, 0, 0, 1) }
    customUniforms.tailColor = { type: 'v4', value: new Vector4(0, 0, 1, 1) }

    vertexShader = vertexShader || BaseVertexShader
    fragmentShader = fragmentShader || BaseFragmentShader

    return new ShaderMaterial({
      uniforms: customUniforms as TrailRendererUniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,

      transparent: true,
      // alphaTest: 0.5,

      // blending: CustomBlending,
      // blendSrc: SrcAlphaFactor,
      // blendDst: OneMinusSrcAlphaFactor,
      // blendEquation: AddEquation,

      depthTest: true,
      depthWrite: false,

      side: DoubleSide
    })
  }

  static createBaseMaterial(customUniforms: any = {}) {
    return TrailRenderer.createMaterial(BaseVertexShader, BaseFragmentShader, customUniforms)
  }

  // static createTexturedMaterial(customUniforms: any = {}) {
  //   customUniforms.texture = { type: 't', value: null }

  //   return TrailRenderer.createMaterial(TexturedVertexShader, TexturedFragmentShader, customUniforms)
  // }

  constructor(orientToMovement) {
    super()
    this.frustumCulled = false
    if (orientToMovement) this.orientToMovement = true
  }

  initialize(
    material: ShaderMaterial,
    length: number,
    dragTexture: boolean,
    localHeadWidth: number,
    localHeadGeometry: Vector3[] | undefined,
    targetObject: any
  ) {
    this.length = length > 0 ? length + 1 : 0
    this.dragTexture = dragTexture
    this.targetObject = targetObject

    this.initializeLocalHeadGeometry(localHeadWidth, localHeadGeometry)

    this.nodeIDs = []
    this.nodeCenters = []

    for (let i = 0; i < this.length; i++) {
      this.nodeIDs[i] = -1
      this.nodeCenters[i] = new Vector3()
    }

    this.material = material

    this.initializeGeometry()

    material.uniforms.trailLength.value = 0
    material.uniforms.minID.value = 0
    material.uniforms.maxID.value = 0
    material.uniforms.dragTexture.value = this.dragTexture
    material.uniforms.maxTrailLength.value = this.length
    material.uniforms.verticesPerNode.value = this.VerticesPerNode
    material.uniforms.textureTileFactor.value = new Vector2(1.0, 1.0)

    this.reset()
  }

  initializeLocalHeadGeometry(localHeadWidth: number, localHeadGeometry: Vector3[] | undefined) {
    this.localHeadGeometry = []

    if (!localHeadGeometry) {
      const halfWidth = (localHeadWidth || 1.0) / 2.0

      this.localHeadGeometry.push(new Vector3(-halfWidth, 0, 0))
      this.localHeadGeometry.push(new Vector3(halfWidth, 0, 0))

      this.VerticesPerNode = 2
    } else {
      this.VerticesPerNode = 0
      for (let i = 0; i < localHeadGeometry.length && i < MaxHeadVertices; i++) {
        const vertex = localHeadGeometry[i]

        if (vertex && vertex instanceof Vector3) {
          const vertexCopy = new Vector3()

          vertexCopy.copy(vertex)

          this.localHeadGeometry.push(vertexCopy)
          this.VerticesPerNode++
        }
      }
    }

    this.FacesPerNode = (this.VerticesPerNode - 1) * 2
    this.FaceIndicesPerNode = this.FacesPerNode * 3
  }

  initializeGeometry() {
    this.vertexCount = this.length * this.VerticesPerNode
    this.faceCount = this.length * this.FacesPerNode

    const geometry = new BufferGeometry()

    const nodeIDs = new Float32Array(this.vertexCount)
    const nodeVertexIDs = new Float32Array(this.vertexCount * this.VerticesPerNode)
    const positions = new Float32Array(this.vertexCount * PositionComponentCount)
    const nodeCenters = new Float32Array(this.vertexCount * PositionComponentCount)
    const uvs = new Float32Array(this.vertexCount * UVComponentCount)
    const indices = new Uint32Array(this.faceCount * IndicesPerFace)

    const nodeIDAttribute = new BufferAttribute(nodeIDs, 1)
    geometry.setAttribute('nodeID', nodeIDAttribute)

    const nodeVertexIDAttribute = new BufferAttribute(nodeVertexIDs, 1)
    geometry.setAttribute('nodeVertexID', nodeVertexIDAttribute)

    const nodeCenterAttribute = new BufferAttribute(nodeCenters, PositionComponentCount)
    geometry.setAttribute('nodeCenter', nodeCenterAttribute)

    const positionAttribute = new BufferAttribute(positions, PositionComponentCount)
    geometry.setAttribute('position', positionAttribute)

    const uvAttribute = new BufferAttribute(uvs, UVComponentCount)
    geometry.setAttribute('uv', uvAttribute)

    const indexAttribute = new BufferAttribute(indices, 1)
    geometry.setIndex(indexAttribute)

    this.geometry = geometry
  }

  zeroVertices() {
    const positions = this.geometry.getAttribute('position') as BufferAttribute

    for (let i = 0; i < this.vertexCount; i++) {
      const index = i

      positions.setXYZ(index, 0, 0, 0)
    }

    positions.needsUpdate = true
    positions.updateRange.count = -1
  }

  zeroIndices() {
    const indices = this.geometry.getIndex()!

    for (let i = 0; i < this.faceCount; i++) {
      const index = i * 3

      indices.setXYZ(index, 0, 0, 0)
    }

    indices.needsUpdate = true
    indices.updateRange.count = -1
  }

  formInitialFaces() {
    this.zeroIndices()

    const indices = this.geometry.getIndex()!

    for (let i = 0; i < this.length - 1; i++) {
      this.connectNodes(i, i + 1)
    }

    indices.needsUpdate = true
    indices.updateRange.count = -1
  }

  reset() {
    this.currentLength = 0
    this.currentEnd = -1

    this.lastNodeCenter = null!
    this.currentNodeCenter = null!
    this.lastOrientationDir = null!

    this.currentNodeID = 0

    this.formInitialFaces()
    this.zeroVertices()

    this.geometry.setDrawRange(0, 0)
  }

  updateUniforms() {
    const material = this.material as ShaderMaterial
    if (this.currentLength < this.length) {
      material.uniforms.minID.value = 0
    } else {
      material.uniforms.minID.value = this.currentNodeID - this.length
    }
    material.uniforms.maxID.value = this.currentNodeID
    material.uniforms.trailLength.value = this.currentLength
    material.uniforms.maxTrailLength.value = this.length
    material.uniforms.verticesPerNode.value = this.VerticesPerNode
  }

  advance() {
    this.targetObject.updateMatrixWorld()
    tempMatrix4.copy(this.targetObject.matrixWorld)

    this.advanceWithTransform(tempMatrix4)

    this.updateUniforms()
  }

  advanceWithPositionAndOrientation(nextPosition, orientationTangent) {
    this.advanceGeometry({ position: nextPosition, tangent: orientationTangent }, null)
  }

  advanceWithTransform(transformMatrix) {
    this.advanceGeometry(null, transformMatrix)
  }

  advanceGeometry(positionAndOrientation, transformMatrix) {
    const nextIndex = this.currentEnd + 1 >= this.length ? 0 : this.currentEnd + 1

    if (transformMatrix) {
      this.updateNodePositionsFromTransformMatrix(nextIndex, transformMatrix)
    } else if (positionAndOrientation) {
      this.updateNodePositionsFromOrientationTangent(
        nextIndex,
        positionAndOrientation.position,
        positionAndOrientation.tangent
      )
    }

    if (this.currentLength >= 1) {
      this.connectNodes(this.currentEnd, nextIndex)

      if (this.currentLength >= this.length) {
        const disconnectIndex = this.currentEnd + 1 >= this.length ? 0 : this.currentEnd + 1
        this.disconnectNodes(disconnectIndex)
      }
    }

    if (this.currentLength < this.length) {
      this.currentLength++
    }

    this.currentEnd++
    if (this.currentEnd >= this.length) {
      this.currentEnd = 0
    }

    if (this.currentLength >= 1) {
      if (this.currentLength < this.length) {
        this.geometry.setDrawRange(0, (this.currentLength - 1) * this.FaceIndicesPerNode)
      } else {
        this.geometry.setDrawRange(0, this.currentLength * this.FaceIndicesPerNode)
      }
    }

    this.updateNodeID(this.currentEnd, this.currentNodeID)
    this.currentNodeID++
  }

  updateHead() {
    if (this.currentEnd < 0) return

    this.targetObject.updateMatrixWorld()
    tempMatrix4.copy(this.targetObject.matrixWorld)

    this.updateNodePositionsFromTransformMatrix(this.currentEnd, tempMatrix4)
  }

  updateNodeID(nodeIndex, id) {
    this.nodeIDs[nodeIndex] = id

    const nodeIDs = this.geometry.getAttribute('nodeID') as BufferAttribute
    const nodeVertexIDs = this.geometry.getAttribute('nodeVertexID') as BufferAttribute

    // TODO: clean this up, use set properly rather than iterating
    for (let i = 0; i < this.VerticesPerNode; i++) {
      const baseIndex = nodeIndex * this.VerticesPerNode + i
      nodeIDs.set([id], baseIndex)
      nodeVertexIDs.set([i], baseIndex)
    }

    nodeIDs.needsUpdate = true
    nodeVertexIDs.needsUpdate = true

    nodeIDs.updateRange.offset = nodeIndex * this.VerticesPerNode
    nodeIDs.updateRange.count = this.VerticesPerNode

    nodeVertexIDs.updateRange.offset = nodeIndex * this.VerticesPerNode
    nodeVertexIDs.updateRange.count = this.VerticesPerNode
  }

  updateNodeCenter(nodeIndex, nodeCenter) {
    this.lastNodeCenter = this.currentNodeCenter

    this.currentNodeCenter = this.nodeCenters[nodeIndex]
    this.currentNodeCenter.copy(nodeCenter)

    const nodeCenters = this.geometry.getAttribute('nodeCenter') as BufferAttribute

    for (let i = 0; i < this.VerticesPerNode; i++) {
      const baseIndex = nodeIndex * this.VerticesPerNode + i
      nodeCenters.setXYZ(baseIndex, nodeCenter.x, nodeCenter.y, nodeCenter.z)
    }

    nodeCenters.needsUpdate = true
    nodeCenters.updateRange.offset = nodeIndex * this.VerticesPerNode * PositionComponentCount
    nodeCenters.updateRange.count = this.VerticesPerNode * PositionComponentCount
  }

  updateNodePositionsFromOrientationTangent(nodeIndex, nodeCenter, orientationTangent) {
    const positions = this.geometry.getAttribute('position') as BufferAttribute

    this.updateNodeCenter(nodeIndex, nodeCenter)

    tempOffset.copy(nodeCenter)
    tempOffset.sub(LocalHeadOrigin)
    tempQuaternion.setFromUnitVectors(LocalOrientationTangent, orientationTangent)

    for (let i = 0; i < this.localHeadGeometry.length; i++) {
      const vertex = tempLocalHeadGeometry[i]
      vertex.copy(this.localHeadGeometry[i])
      vertex.applyQuaternion(tempQuaternion)
      vertex.add(tempOffset)
    }

    for (let i = 0; i < this.localHeadGeometry.length; i++) {
      const positionIndex = this.VerticesPerNode * nodeIndex + i
      const transformedHeadVertex = tempLocalHeadGeometry[i]

      positions.setXYZ(positionIndex, transformedHeadVertex.x, transformedHeadVertex.y, transformedHeadVertex.z)
    }

    positions.needsUpdate = true
  }

  updateNodePositionsFromTransformMatrix(nodeIndex, transformMatrix) {
    const positions = this.geometry.getAttribute('position') as BufferAttribute

    tempPosition.set(0, 0, 0)
    tempPosition.applyMatrix4(transformMatrix)
    this.updateNodeCenter(nodeIndex, tempPosition)

    for (let i = 0; i < this.localHeadGeometry.length; i++) {
      const vertex2 = tempLocalHeadGeometry2[i]
      vertex2.copy(this.localHeadGeometry[i])
    }

    for (let i = 0; i < this.localHeadGeometry.length; i++) {
      const vertex3 = tempLocalHeadGeometry2[i]
      vertex3.applyMatrix4(transformMatrix)
    }

    if (this.lastNodeCenter && this.orientToMovement) {
      getMatrix3FromMatrix4(tempMatrix3, transformMatrix)
      worldOrientation.set(0, 0, -1)
      worldOrientation.applyMatrix3(tempMatrix3)

      tempDirection.copy(this.currentNodeCenter)
      tempDirection.sub(this.lastNodeCenter)
      tempDirection.normalize()

      if (tempDirection.lengthSq() <= 0.0001 && this.lastOrientationDir) {
        tempDirection.copy(this.lastOrientationDir)
      }

      if (tempDirection.lengthSq() > 0.0001) {
        if (!this.lastOrientationDir) this.lastOrientationDir = new Vector3()

        tempQuaternion.setFromUnitVectors(worldOrientation, tempDirection)

        tempOffset.copy(this.currentNodeCenter)

        for (let i = 0; i < this.localHeadGeometry.length; i++) {
          const vertex4 = tempLocalHeadGeometry2[i]
          vertex4.sub(tempOffset)
          vertex4.applyQuaternion(tempQuaternion)
          vertex4.add(tempOffset)
        }
      }
    }

    for (let i = 0; i < this.localHeadGeometry.length; i++) {
      const positionIndex = this.VerticesPerNode * nodeIndex + i
      const transformedHeadVertex = tempLocalHeadGeometry2[i]

      positions.setXYZ(positionIndex, transformedHeadVertex.x, transformedHeadVertex.y, transformedHeadVertex.z)
    }

    positions.needsUpdate = true

    positions.updateRange.offset = nodeIndex * this.VerticesPerNode * PositionComponentCount
    positions.updateRange.count = this.VerticesPerNode * PositionComponentCount
  }

  connectNodes(srcNodeIndex, destNodeIndex) {
    const indices = this.geometry.getIndex()!

    for (let i = 0; i < this.localHeadGeometry.length - 1; i++) {
      const srcVertexIndex = this.VerticesPerNode * srcNodeIndex + i
      const destVertexIndex = this.VerticesPerNode * destNodeIndex + i

      const faceIndex = (srcNodeIndex * this.FacesPerNode + i * FacesPerQuad) * IndicesPerFace

      indices.set(
        [srcVertexIndex, destVertexIndex, srcVertexIndex + 1, destVertexIndex, destVertexIndex + 1, srcVertexIndex + 1],
        faceIndex
      )
    }

    indices.needsUpdate = true
    indices.updateRange.count = -1

    // returnObj.attribute = indices
    // returnObj.offset = srcNodeIndex * this.FacesPerNode * IndicesPerFace
    // returnObj.count = this.FacesPerNode * IndicesPerFace

    // return returnObj
  }

  disconnectNodes(srcNodeIndex) {
    const indices = this.geometry.getIndex()!

    for (let i = 0; i < this.localHeadGeometry.length - 1; i++) {
      const faceIndex = (srcNodeIndex * this.FacesPerNode + i * FacesPerQuad) * IndicesPerFace

      indices.set([0, 0, 0, 0, 0, 0], faceIndex)
    }

    indices.needsUpdate = true
    indices.updateRange.count = -1

    // returnObj2.attribute = indices
    // returnObj2.offset = srcNodeIndex * this.FacesPerNode * IndicesPerFace
    // returnObj2.count = this.FacesPerNode * IndicesPerFace

    // return returnObj2
  }
}

export default TrailRenderer
