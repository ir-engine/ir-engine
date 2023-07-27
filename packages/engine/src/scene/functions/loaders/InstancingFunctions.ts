/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { max, min } from 'lodash'
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  InstancedMesh,
  InterleavedBufferAttribute,
  Material,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  Quaternion,
  RawShaderMaterial,
  ShaderChunk,
  Texture,
  Vector2,
  Vector3
} from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { State } from '@etherealengine/hyperflux'

import { AssetLoader } from '../../../assets/classes/AssetLoader'
import { CameraComponent } from '../../../camera/components/CameraComponent'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import {
  getComponent,
  getMutableComponent,
  hasComponent,
  setComponent
} from '../../../ecs/functions/ComponentFunctions'
import { formatMaterialArgs } from '../../../renderer/materials/functions/MaterialLibraryFunctions'
import { setCallback } from '../../components/CallbackComponent'
import { addObjectToGroup, removeObjectFromGroup } from '../../components/GroupComponent'
import {
  GrassProperties,
  InstancingComponent,
  MeshProperties,
  SampleMode,
  SampleProperties,
  ScatterMode,
  ScatterProperties,
  ScatterState,
  TextureRef,
  VertexProperties,
  sampleVar
} from '../../components/InstancingComponent'
import { UpdatableCallback, UpdatableComponent } from '../../components/UpdatableComponent'
import getFirstMesh from '../../util/getFirstMesh'
import obj3dFromUuid from '../../util/obj3dFromUuid'
import LogarithmicDepthBufferMaterialChunk from '../LogarithmicDepthBufferMaterialChunk'

export const GRASS_PROPERTIES_DEFAULT_VALUES: GrassProperties = {
  isGrassProperties: true,
  bladeHeight: { mu: 0.3, sigma: 0.05 },
  bladeWidth: { mu: 0.03, sigma: 0.01 },
  joints: 4,
  grassTexture: {
    src: 'https://resources-dev.etherealengine.com/assets/grass/blade_diffuse.jpg',
    texture: null
  },
  alphaMap: {
    src: 'https://resources-dev.etherealengine.com/assets/grass/blade_alpha.jpg',
    texture: null
  },
  ambientStrength: 0.5,
  diffuseStrength: 1,
  shininess: 128,
  sunColor: new Color(0.9, 0.95, 0.4)
}

export const MESH_PROPERTIES_DEFAULT_VALUES: MeshProperties = {
  isMeshProperties: true,
  instancedMesh: '' as EntityUUID
}

export const SCATTER_PROPERTIES_DEFAULT_VALUES: ScatterProperties = {
  isScatterProperties: true,
  densityMap: {
    src: 'https://resources-dev.etherealengine.com/assets/grass/perlinFbm.jpg',
    texture: null
  },
  densityMapStrength: 0.5,
  heightMap: {
    src: 'https://resources-dev.etherealengine.com/assets/grass/perlinFbm.jpg',
    texture: null
  },
  heightMapStrength: 0.5
}

export const VERTEX_PROPERTIES_DEFAULT_VALUES: VertexProperties = {
  isVertexProperties: true,
  vertexColors: false,
  densityMap: {
    src: 'https://resources-dev.etherealengine.com/assets/grass/perlinFbm.jpg',
    texture: null
  },
  densityMapStrength: 0.5,
  heightMap: {
    src: 'https://resources-dev.etherealengine.com/assets/grass/perlinFbm.jpg',
    texture: null
  },
  heightMapStrength: 0.5
}

const grassVertexSource = `
precision mediump float;
attribute vec3 position;
attribute vec3 normal;
attribute vec3 offset;
attribute vec2 uv;
attribute vec4 orient;
attribute vec2 scale;
attribute vec2 surfaceUV;
attribute float index;

uniform float time;
uniform float vHeight;
#ifdef DENSITY_MAPPED
  uniform float densityMapStrength;
  uniform sampler2D densityMap;

  varying float doClip;
#endif
#ifdef HEIGHT_MAPPED
  uniform float heightMapStrength;
  uniform sampler2D heightMap;
#endif
${ShaderChunk.logdepthbuf_pars_vertex}
${LogarithmicDepthBufferMaterialChunk}
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float frc;
varying float idx;

const float PI = 3.1415;
const float TWO_PI = 2.0 * PI;

//https://www.geeks3d.com/20141201/how-to-rotate-a-vertex-by-a-quaternion-in-glsl/
vec3 rotateVectorByQuaternion(vec3 v, vec4 q){
return 2.0 * cross(q.xyz, v * q.w + cross(q.xyz, v)) + v;
}

float rand(float x) {
  return fract(sin(x * 10000.0) * 20000.0);
}


void main() {
#ifdef DENSITY_MAPPED
  //Sample density map
  float density = texture2D(densityMap, surfaceUV).r;
  if (rand(index) > density) {
    doClip = 1.0;
  } else {
    doClip = 0.0;
  }
#endif
//Scale vertices
vec3 vPosition = position;

//Sample height map
float height = 1.0;
#ifdef HEIGHT_MAPPED
  height = texture2D(heightMap, surfaceUV).r;
#endif
vPosition.x *= scale.x * height;
vPosition.y *= scale.y * height;
vPosition.z *= scale.x * height;
//Invert scaling for normals
vNormal = normal;
//vNormal.y /= scale.y;
frc = position.y / vHeight;
//Rotate blade around Y axis
vec4 direction = orient;
vPosition = rotateVectorByQuaternion(vPosition, direction);
vNormal = rotateVectorByQuaternion(vNormal, direction);
//UV for texture
vUv = uv;

//Wind is sine waves in time. 
float noise = 0.5 + 0.5 * sin(vPosition.x + offset.x + time);
float halfAngle = -noise * 0.1;
noise = 0.5 + 0.5 * cos(vPosition.z + offset.z + time);
halfAngle -= noise * 0.05;

direction = normalize(vec4(sin(halfAngle), 0.0, -sin(halfAngle), cos(halfAngle)));

//Rotate blade and normals according to the wind
vPosition = rotateVectorByQuaternion(vPosition, direction);
vNormal = rotateVectorByQuaternion(vNormal, direction);

//Index of instance for varying color in fragment shader
idx = index;

gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition + offset, 1.0);
${ShaderChunk.logdepthbuf_vertex}
}`

const grassFragmentSource = `
precision mediump float;

uniform vec3 cameraPosition;

//Light uniforms
uniform float ambientStrength;
uniform float diffuseStrength;
uniform float specularStrength;
uniform float shininess;
uniform vec3 sunColor;
uniform vec3 sunDirection;

//Surface uniforms
uniform sampler2D map;
uniform sampler2D alphaMap;
uniform vec3 specularColor;

varying float idx;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float frc;

#ifdef DENSITY_MAPPED
  varying float doClip;
#endif

vec3 ACESFilm(vec3 x){
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;
    return clamp((x*(a*x+b))/(x*(c*x+d)+e), 0.0, 1.0);
}

void main() {
//If clipped, don't draw
#ifdef DENSITY_MAPPED
  if(doClip > 0.0) {
    discard;
  }
#endif
//If transparent, don't draw
if(texture2D(alphaMap, vUv).r < 0.15){
    discard;
}
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    vec3 normal = vNormal;

    //Flip normals when viewing reverse of the blade
    //if(dot(vNormal, viewDirection) >= 0.0){
    //    normal = normalize(vNormal);
    //}else{
    //    normal = normalize(-vNormal);
    //}

//Get color data from texture
    vec3 textureColor = pow(texture2D(map, vUv).rgb, vec3(2.2));

//Add different green tones towards root
    vec3 mixColor = idx > 0.75 ? vec3(0.2, 0.8, 0.06) : vec3(0.5, 0.8, 0.08);
textureColor = mix(0.1 * mixColor, textureColor, 0.75);

    vec3 lightTimesTexture = sunColor * textureColor;
vec3 ambient = textureColor;
    
    vec3 lightDir = normalize(sunDirection);

//How much a fragment faces the light
    float dotNormalLight = dot(normal, lightDir);
float diff = max(dotNormalLight, frc);

//Color when lit by light
vec3 diffuse = diff * lightTimesTexture;

float sky = max(dot(normal, vec3(0, 1, 0)), 0.8);
vec3 skyLight = sky * vec3(0.12, 0.29, 0.55);
vec3 col = 0.3 * skyLight * textureColor + diffuse * diffuseStrength + ambient * ambientStrength;
gl_FragColor = vec4(col, 1.0);
}`

//${ShaderChunk.logdepthbuf_fragment}
//}`

const loadTex = async (props: State<TextureRef>) => {
  const texture = (await AssetLoader.loadAsync(props.src.value)) as Texture
  props.texture.set(texture)
}

async function loadSampleTextures(props: State<ScatterProperties | VertexProperties>) {
  await Promise.all([props.densityMap, props.heightMap].map(loadTex))
}

async function loadGrassTextures(props: State<GrassProperties>) {
  await Promise.all([props.alphaMap, props.grassTexture].map(loadTex))
}

export async function stageInstancing(entity: Entity) {
  const scatter = getComponent(entity, InstancingComponent)
  const scatterState = getMutableComponent(entity, InstancingComponent)
  if (scatter.state === ScatterState.STAGING) {
    console.error('scatter component is already staging')
    return
  }
  scatterState.state.set(ScatterState.STAGING)
  const targetGeo = getFirstMesh(obj3dFromUuid(scatter.surface))!.geometry
  const normals = targetGeo.getAttribute('normal') as BufferAttribute | InterleavedBufferAttribute
  const positions = targetGeo.getAttribute('position') as BufferAttribute | InterleavedBufferAttribute
  const uvs = targetGeo.getAttribute('uv') as BufferAttribute | InterleavedBufferAttribute
  const uvBounds: any = { minU: null, maxU: null, minV: null, maxV: null }
  for (let i = 0; i < uvs.count; i += 1) {
    const u = uvs.getX(i)
    const v = uvs.getY(i)
    uvBounds.minU = uvBounds.minU != null ? min([u, uvBounds.minU]) : u
    uvBounds.minV = uvBounds.minV != null ? min([v, uvBounds.minV]) : v
    uvBounds.maxU = uvBounds.maxU != null ? max([u, uvBounds.maxU]) : u
    uvBounds.maxV = uvBounds.maxV != null ? max([v, uvBounds.maxV]) : v
  }
  const nTriangles = Math.floor((targetGeo.index?.count ?? positions.count) / 3)

  function sign(p1: Vector2, p2: Vector2, p3: Vector2) {
    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y)
  }

  function pointInTriangle(point: Vector2, v1: Vector2, v2: Vector2, v3: Vector2) {
    const d1 = sign(point, v1, v2)
    const d2 = sign(point, v2, v3)
    const d3 = sign(point, v3, v1)
    const hasNeg = d1 < 0 || d2 < 0 || d3 < 0
    const hasPos = d1 > 0 || d2 > 0 || d3 > 0

    return !(hasNeg && hasPos)
  }

  function getUV(index) {
    return new Vector2(uvs.getX(index), uvs.getY(index))
  }

  function getPosition(index) {
    return new Vector3(positions.getX(index), positions.getY(index), positions.getZ(index))
  }

  function getNormal(index) {
    return new Vector3(normals.getX(index), normals.getY(index), normals.getZ(index))
  }

  function to3(v2: Vector2) {
    return new Vector3(v2.x, v2.y, 0)
  }

  function positionAt(uv: Vector2) {
    let triIndex = 0
    while (triIndex < nTriangles) {
      const [i1, i2, i3] = [triIndex * 3, triIndex * 3 + 1, triIndex * 3 + 2].map(
        (idx) => targetGeo.index?.getX(idx) ?? idx
      )
      const [v1, v2, v3] = [i1, i2, i3].map(getUV)
      if (pointInTriangle(uv, v1, v2, v3)) {
        //barycentric blending of positions
        const triArea =
          to3(v2.clone().sub(v1))
            .cross(to3(v3.clone().sub(v1)))
            .length() * 0.5

        const w1 =
          (to3(v2.clone().sub(uv))
            .cross(to3(v3.clone().sub(uv)))
            .length() *
            0.5) /
          triArea
        const w2 =
          (to3(v1.clone().sub(uv))
            .cross(to3(v3.clone().sub(uv)))
            .length() *
            0.5) /
          triArea
        const w3 =
          (to3(v1.clone().sub(uv))
            .cross(to3(v2.clone().sub(uv)))
            .length() *
            0.5) /
          triArea

        const [p1, p2, p3] = [i1, i2, i3].map(getPosition)
        const result = p1
          .clone()
          .multiplyScalar(w1)
          .add(p2.clone().multiplyScalar(w2))
          .add(p3.clone().multiplyScalar(w3))
        const [n1, n2, n3] = [i1, i2, i3].map(getNormal)
        const resultNormal = n1
          .clone()
          .multiplyScalar(w1)
          .add(n2.clone().multiplyScalar(w2))
          .add(n3.clone().multiplyScalar(w3))
        return [result, resultNormal]
      }
      triIndex += 1
    }
    return [null, null]
  }

  const instancedGeometry = new InstancedBufferGeometry()

  const indices: number[] = []
  const offsets: number[] = []
  const scales: number[] = []
  const orients: number[] = []
  const transforms: number[] = []
  const surfaceUVs: number[] = []
  if ([SampleMode.SCATTER, SampleMode.VERTICES].includes(scatter.sampling)) {
    await loadSampleTextures(scatterState.sampleProperties as unknown as State<SampleProperties>)
  }

  let props = scatter.sourceProperties
  let grassGeometry: BufferGeometry
  if ((props as GrassProperties).isGrassProperties) {
    props = formatMaterialArgs(props)
    const grassProps = props as GrassProperties
    await loadGrassTextures(scatterState.sourceProperties as State<GrassProperties>)
    //samplers
    grassGeometry = new PlaneGeometry(grassProps.bladeWidth.mu, grassProps.bladeHeight.mu, 1, grassProps.joints)

    grassGeometry.translate(0, grassProps.bladeHeight.mu / 2, 0)

    const vertex = new Vector3()
    const quaternion0 = new Quaternion()
    const quaternion1 = new Quaternion()
    let x, y, z, w, angle, sinAngle

    //Rotate around Y
    angle = 0.15
    sinAngle = Math.sin(angle / 2.0)
    const rotationAxis = new Vector3(0, 1, 0)
    x = rotationAxis.x * sinAngle
    y = rotationAxis.y * sinAngle
    z = rotationAxis.z * sinAngle
    w = Math.cos(angle / 2.0)
    quaternion0.set(x, y, z, w)

    //Rotate around X
    angle = 0.05
    sinAngle = Math.sin(angle / 2.0)
    rotationAxis.set(1, 0, 0)
    x = rotationAxis.x * sinAngle
    y = rotationAxis.y * sinAngle
    z = rotationAxis.z * sinAngle
    w = Math.cos(angle / 2.0)
    quaternion1.set(x, y, z, w)

    //Combine rotations to a single quaternion
    quaternion0.multiply(quaternion1)

    //Rotate around Z
    angle = 0.1
    sinAngle = Math.sin(angle / 2.0)
    rotationAxis.set(0, 0, 1)
    x = rotationAxis.x * sinAngle
    y = rotationAxis.y * sinAngle
    z = rotationAxis.z * sinAngle
    w = Math.cos(angle / 2.0)
    quaternion1.set(x, y, z, w)

    //Combine rotations to a single quaternion
    quaternion0.multiply(quaternion1)

    const quaternion2 = new Quaternion()

    const positionAttr = grassGeometry.attributes.position as BufferAttribute | InterleavedBufferAttribute

    //Bend grass base geometry for more organic look
    for (let v = 0; v < positionAttr.array.length / 3; v += 1) {
      quaternion2.setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2)
      vertex.x = positionAttr.array[v * 3]
      vertex.y = positionAttr.array[v * 3 + 1]
      vertex.z = positionAttr.array[v * 3 + 2]
      const frac = vertex.y / (grassProps.bladeHeight.mu + grassProps.bladeHeight.sigma)
      quaternion2.slerp(quaternion0, frac)
      vertex.applyQuaternion(quaternion2)
      positionAttr.setXYZ(v, vertex.x, vertex.y, vertex.z)
    }

    grassGeometry.computeVertexNormals()

    instancedGeometry.index = grassGeometry.index
    instancedGeometry.attributes.position = grassGeometry.attributes.position
    instancedGeometry.attributes.uv = grassGeometry.attributes.uv
    instancedGeometry.attributes.normal = grassGeometry.attributes.normal
  } else if ((props as MeshProperties).isMeshProperties) {
    const meshProps = props as MeshProperties
    const iGeo = getFirstMesh(obj3dFromUuid(meshProps.instancedMesh))!.geometry
    instancedGeometry.index = iGeo.index
    instancedGeometry.attributes.position = iGeo.attributes.position
    instancedGeometry.attributes.uv = iGeo.attributes.uv
    instancedGeometry.attributes.normal = iGeo.attributes.normal
  }

  function varyGrassScale(scale: Vector2) {
    const grassProps = props as GrassProperties
    scale.x += sampleVar(grassProps.bladeWidth)
    scale.y += sampleVar(grassProps.bladeHeight)
  }

  function stageGrassBuffers(position, orient, scale) {
    offsets.push(position.x, position.y, position.z)
    orients.push(orient.x, orient.y, orient.z, orient.w)
    varyGrassScale(scale as any)
    scales.push(scale.x, scale.y)
  }

  function stageGrassAttributes() {
    const offsetAttribute = new InstancedBufferAttribute(new Float32Array(offsets), 3)
    const scaleAttribute = new InstancedBufferAttribute(new Float32Array(scales), 2)
    const orientAttribute = new InstancedBufferAttribute(new Float32Array(orients), 4)
    const indexAttribute = new InstancedBufferAttribute(new Float32Array(indices), 1)

    instancedGeometry.setAttribute('offset', offsetAttribute)
    instancedGeometry.setAttribute('scale', scaleAttribute)
    instancedGeometry.setAttribute('orient', orientAttribute)
    instancedGeometry.setAttribute('index', indexAttribute)
  }

  function stageMeshBuffers(position, orient, scale) {
    const transform = new Matrix4()
    transform.compose(position, orient, scale)
    transforms.push(...transform.elements)
  }

  let numInstances = -1

  switch (scatter.sampling) {
    case SampleMode.SCATTER:
      numInstances = scatter.count
      for (let i = 0; i < numInstances; i += 1) {
        indices.push(i / numInstances)
        let position: Vector3 | null, normal: Vector3 | null
        let sample: Vector2
        do {
          sample = new Vector2(
            uvBounds.minU + (uvBounds.maxU - uvBounds.minU) * Math.random(),
            uvBounds.minV + (uvBounds.maxV - uvBounds.minV) * Math.random()
          )
          //sample positions from random uvs
          ;[position, normal] = positionAt(sample)
        } while (position === null)
        surfaceUVs.push(sample.x, sample.y)
        const orient = new Quaternion()
        orient.setFromUnitVectors(new Vector3(0, 1, 0), normal!)
        const scale = new Vector3(1, 1, 1)
        if ((props as GrassProperties).isGrassProperties) {
          stageGrassBuffers(position, orient, scale)
        } else if ((props as MeshProperties).isMeshProperties) {
          stageMeshBuffers(position, orient, scale)
        }
      }
      if ((props as GrassProperties).isGrassProperties) {
        stageGrassAttributes()
      }
      break
    case SampleMode.VERTICES:
      numInstances = positions.count
      for (let i = 0; i < numInstances; i += 1) {
        const surfaceUV = getUV(i)
        surfaceUVs.push(surfaceUV.x, surfaceUV.y)

        const position = getPosition(i)

        const normal = getNormal(i)
        const orient = new Quaternion()
        orient.setFromUnitVectors(new Vector3(0, 1, 0), normal)

        const scale = new Vector3(1, 1, 1)
        if ((props as GrassProperties).isGrassProperties) {
          stageGrassBuffers(position, orient, scale)
        } else if ((props as MeshProperties).isMeshProperties) {
          stageMeshBuffers(position, orient, scale)
        }
      }
      if ((props as GrassProperties).isGrassProperties) {
        stageGrassAttributes()
      }
      break
    default:
      numInstances = 0
      break
  }

  const surfaceUVAttribute = new InstancedBufferAttribute(new Float32Array(surfaceUVs), 2)

  instancedGeometry.setAttribute('surfaceUV', surfaceUVAttribute)

  let result: Mesh
  let resultMat: Material
  const sampleProps = formatMaterialArgs(scatter.sampleProperties) as SampleProperties
  const grassProps = props as GrassProperties
  let shaderMat: RawShaderMaterial

  const meshProps = props as MeshProperties
  let iMesh: Mesh
  let iMat: any
  switch (scatter.mode) {
    case ScatterMode.GRASS:
      resultMat = new RawShaderMaterial({
        uniforms: {
          time: { value: 0 },
          map: { value: grassProps.grassTexture.texture },
          vHeight: { value: grassProps.bladeHeight.mu + grassProps.bladeHeight.sigma },
          alphaMap: { value: grassProps.alphaMap.texture },
          sunDirection: { value: new Vector3(-0.35, 0, 0) },
          cameraPosition: { value: getComponent(Engine.instance.cameraEntity, CameraComponent).position },
          ambientStrength: { value: grassProps.ambientStrength },
          diffuseStrength: { value: grassProps.diffuseStrength },
          sunColor: { value: grassProps.sunColor }
        },
        vertexShader: grassVertexSource,
        fragmentShader: grassFragmentSource,
        side: DoubleSide,
        defines: {
          EPSILON: 0.00001,
          USE_LOGDEPTHBUF: ''
          //USE_LOGDEPTHBUF_EXT: ''
        }
      })
      resultMat.onBeforeCompile = (shader, renderer) => {
        console.log('onBeforeCompile', shader, renderer)
      }
      shaderMat = resultMat as RawShaderMaterial
      if (sampleProps.densityMap) {
        shaderMat.defines.DENSITY_MAPPED = ''
        shaderMat.uniforms = {
          ...shaderMat.uniforms,
          heightMap: { value: sampleProps.heightMap.texture },
          heightMapStrength: { value: sampleProps.heightMapStrength }
        }
      }
      if (sampleProps.heightMap) {
        shaderMat.defines.HEIGHT_MAPPED = ''
        shaderMat.uniforms = {
          ...shaderMat.uniforms,
          densityMap: { value: sampleProps.densityMap.texture },
          densityMapStrength: { value: sampleProps.densityMapStrength }
        }
      }
      result = new Mesh(instancedGeometry, resultMat)
      result.name = 'Grass'
      break
    case ScatterMode.MESH:
      iMesh = getFirstMesh(obj3dFromUuid(meshProps.instancedMesh))!
      iMat = iMesh.material as any
      resultMat = new MeshStandardMaterial({
        color: iMat.color,
        map: iMat.map,
        roughness: iMat.roughness,
        roughnessMap: iMat.roughnessMap,
        metalness: iMat.metalness,
        metalnessMap: iMat.metalnessMap,
        normalMap: iMat.normalMap,
        emissiveIntensity: iMat.emissiveIntensity,
        emissiveMap: iMat.emissiveMap
      })
      result = new InstancedMesh(instancedGeometry, resultMat, numInstances)
      ;(result as InstancedMesh).frustumCulled = false
      ;(result as InstancedMesh).instanceMatrix.set(transforms)
      ;(result as InstancedMesh).instanceMatrix.needsUpdate = true
      break
    default:
      resultMat = new Material()
      result = new Mesh()
      break
  }
  addObjectToGroup(entity, result)
  const updates: ((dt: number) => void)[] = []
  switch (scatter.mode) {
    case ScatterMode.GRASS:
      updates.push((dT) => {
        ;(resultMat as RawShaderMaterial).uniforms.time.value += dT
      })
      break
  }
  if (updates.length > 0) {
    if (!hasComponent(entity, UpdatableComponent)) {
      setComponent(entity, UpdatableComponent, true)
    }
    setCallback(entity, UpdatableCallback, (dt) => updates.forEach((update) => update(dt)))
  }
  result.frustumCulled = false
  scatterState.mesh.set(result)
  scatterState.state.set(ScatterState.STAGED)
}

export function unstageInstancing(entity: Entity) {
  const comp = getMutableComponent(entity, InstancingComponent)
  if (!comp.mesh.value) return
  removeObjectFromGroup(entity, comp.mesh.value)
  comp.state.set(ScatterState.UNSTAGED)
}
