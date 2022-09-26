import { max, min } from 'lodash'
import {
  BufferGeometry,
  Color,
  ColorRepresentation,
  DoubleSide,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  InstancedMesh,
  Material,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  Quaternion,
  RawShaderMaterial,
  Texture,
  Vector2,
  Vector3
} from 'three'
import matches from 'ts-matches'

import { defineAction, dispatchAction } from '@xrengine/hyperflux'

import { AssetLoader } from '../../../assets/classes/AssetLoader'
import { DependencyTree } from '../../../assets/classes/DependencyTree'
import { AssetClass } from '../../../assets/enum/AssetClass'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { EngineActions, getEngineState } from '../../../ecs/classes/EngineState'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../../ecs/functions/ComponentFunctions'
import { iterateEntityNode } from '../../../ecs/functions/EntityTree'
import { matchActionOnce } from '../../../networking/functions/matchActionOnce'
import { formatMaterialArgs } from '../../../renderer/materials/functions/Utilities'
import UpdateableObject3D from '../../classes/UpdateableObject3D'
import { setCallback } from '../../components/CallbackComponent'
import { addObjectToGroup, GroupComponent } from '../../components/GroupComponent'
import {
  GrassProperties,
  InstancingComponent,
  InstancingComponentType,
  InstancingStagingComponent,
  MeshProperties,
  NodeProperties,
  SampleMode,
  SampleProperties,
  sampleVar,
  ScatterMode,
  ScatterProperties,
  ScatterState,
  VertexProperties
} from '../../components/InstancingComponent'
import { Object3DComponent, Object3DWithEntity } from '../../components/Object3DComponent'
import { UpdatableCallback, UpdatableComponent } from '../../components/UpdatableComponent'
import getFirstMesh from '../../util/getFirstMesh'
import obj3dFromUuid from '../../util/obj3dFromUuid'

export const GRASS_PROPERTIES_DEFAULT_VALUES: GrassProperties = {
  isGrassProperties: true,
  bladeHeight: { mu: 0.3, sigma: 0.05 },
  bladeWidth: { mu: 0.03, sigma: 0.01 },
  joints: 4,
  grassTexture: 'https://resources-dev.theoverlay.io/assets/grass/blade_diffuse.jpg',
  alphaMap: 'https://resources-dev.theoverlay.io/assets/grass/blade_alpha.jpg',
  ambientStrength: 0.5,
  diffuseStrength: 1,
  shininess: 128,
  sunColor: new Color(0.9, 0.95, 0.4)
}

export const MESH_PROPERTIES_DEFAULT_VALUES: MeshProperties = {
  isMeshProperties: true,
  instancedMesh: ''
}

export const SCATTER_PROPERTIES_DEFAULT_VALUES: ScatterProperties = {
  isScatterProperties: true,
  densityMap: 'https://resources-dev.theoverlay.io/assets/grass/perlinFbm.jpg',
  densityMapStrength: 0.5,
  heightMap: 'https://resources-dev.theoverlay.io/assets/grass/perlinFbm.jpg',
  heightMapStrength: 0.5
}

export const VERTEX_PROPERTIES_DEFAULT_VALUES: VertexProperties = {
  isVertexProperties: true,
  vertexColors: false,
  densityMap: 'https://resources-dev.theoverlay.io/assets/grass/perlinFbm.jpg',
  densityMapStrength: 0.5,
  heightMap: 'https://resources-dev.theoverlay.io/assets/grass/perlinFbm.jpg',
  heightMapStrength: 0.5
}

export const NODE_PROPERTIES_DEFAULT_VALUES: NodeProperties = {
  isNodeProperties: true,
  root: ''
}

export const SCENE_COMPONENT_INSTANCING = 'instancing'
export const SCENE_COMPONENT_INSTANCING_DEFAULT_VALUES: InstancingComponentType = {
  count: 5000,
  surface: '',
  sampling: SampleMode.SCATTER,
  mode: ScatterMode.GRASS,
  state: ScatterState.UNSTAGED,
  sampleProperties: SCATTER_PROPERTIES_DEFAULT_VALUES,
  sourceProperties: GRASS_PROPERTIES_DEFAULT_VALUES
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
    return;
}`

export class InstancingActions {
  static instancingStaged = defineAction({
    type: 'xre.scene.Instancing.INSTANCING_STAGED' as const,
    uuid: matches.string
  })
}

export const deserializeInstancing: ComponentDeserializeFunction = (entity: Entity, data: InstancingComponentType) => {
  const scatterProps = parseInstancingProperties(data)
  if (scatterProps.state === ScatterState.STAGING) {
    scatterProps.state = ScatterState.UNSTAGED
  }
  addComponent(entity, InstancingComponent, scatterProps)
}

export const updateInstancing: ComponentUpdateFunction = (entity: Entity) => {
  if (!getComponent(entity, GroupComponent)?.[0]) {
    addObjectToGroup(entity, new Object3D())
  }
  const scatterProps = getComponent(entity, InstancingComponent)
  if (scatterProps.surface) {
    const eNode = Engine.instance.currentWorld.entityTree.entityNodeMap.get(entity)!
    DependencyTree.add(
      scatterProps.surface,
      new Promise<void>((resolve) => {
        matchActionOnce(
          InstancingActions.instancingStaged.matches.validate((action) => action.uuid === eNode.uuid, ''),
          () => resolve()
        )
      })
    )
  }

  if (scatterProps.state === ScatterState.STAGED) {
    const executeStaging = () => {
      addComponent(entity, InstancingStagingComponent, {})
    }
    if (!getEngineState().sceneLoaded.value) matchActionOnce(EngineActions.sceneLoaded.matches, executeStaging)
    else executeStaging()
  }
}

function parseInstancingProperties(props): InstancingComponentType {
  let result: InstancingComponentType = {
    ...SCENE_COMPONENT_INSTANCING_DEFAULT_VALUES,
    ...props
  }
  const processProps = (props, defaults) => {
    return Object.fromEntries(
      Object.entries(props)
        .filter(([k, _]) => defaults[k] !== undefined)
        .map(([k, v]) => {
          if ((defaults[k] as Color).isColor && !(v as Color).isColor) {
            return [k, new Color(v as ColorRepresentation)]
          } else {
            return [k, v]
          }
        })
    )
  }
  result = processProps(result, SCENE_COMPONENT_INSTANCING_DEFAULT_VALUES) as InstancingComponentType
  switch (result.mode) {
    case ScatterMode.GRASS:
      result.sourceProperties = processProps(
        result.sourceProperties,
        GRASS_PROPERTIES_DEFAULT_VALUES
      ) as GrassProperties
      break
    case ScatterMode.MESH:
      result.sourceProperties = processProps(result.sourceProperties, MESH_PROPERTIES_DEFAULT_VALUES) as MeshProperties
      break
  }
  switch (result.sampling) {
    case SampleMode.SCATTER:
      result.sampleProperties = processProps(
        result.sampleProperties,
        SCATTER_PROPERTIES_DEFAULT_VALUES
      ) as ScatterProperties
      break
    case SampleMode.VERTICES:
      result.sampleProperties = processProps(
        result.sampleProperties,
        VERTEX_PROPERTIES_DEFAULT_VALUES
      ) as VertexProperties
      break
    case SampleMode.NODES:
      result.sampleProperties = processProps(result.sampleProperties, NODE_PROPERTIES_DEFAULT_VALUES) as NodeProperties
      break
  }
  return result
}

export const serializeInstancing: ComponentSerializeFunction = (entity) => {
  const comp = getComponent(entity, InstancingComponent) as InstancingComponentType
  if (!comp) return
  const toSave = { ...comp }
  if (comp.state === ScatterState.STAGING) toSave.state = ScatterState.UNSTAGED
  const formatData = (props) => {
    for (const [k, v] of Object.entries(props)) {
      if ((v as Texture)?.isTexture) {
        props[k] = (v as Texture).source.data?.src ?? ''
      } else if ((v as Color)?.isColor) {
        props[k] = (v as Color).getHex()
      } else {
        props[k] = v
      }
    }
  }
  const srcProps = comp.sourceProperties
  const _srcProps: GrassProperties | MeshProperties | any = { ...srcProps }
  const sampleProps = comp.sampleProperties
  const _sampleProps = { ...sampleProps }
  formatData(toSave)
  formatData(_srcProps)
  formatData(_sampleProps)
  toSave.sourceProperties = _srcProps
  toSave.sampleProperties = _sampleProps
  return toSave
}

const loadTex = async <T>(props: T, prop: keyof T) => {
  let path = props[prop] as any
  if (typeof path !== 'string' || ![AssetClass.Image, AssetClass.Video].includes(AssetLoader.getAssetClass(path))) {
    console.error('invalid texture path', path)
  }
  props[prop] = await AssetLoader.loadAsync(path)
}

async function loadSampleTextures(props: ScatterProperties & VertexProperties) {
  if (typeof props.densityMap === 'string' && props.densityMap !== '') {
    await loadTex(props, 'densityMap')
  }
  if (typeof props.heightMap === 'string' && props.heightMap !== '') {
    await loadTex(props, 'heightMap')
  }
}

async function loadGrassTextures(props: GrassProperties) {
  if (typeof props.alphaMap === 'string' && props.alphaMap !== '') {
    await loadTex(props, 'alphaMap')
  }
  if (typeof props.grassTexture === 'string' && props.grassTexture !== '') {
    await loadTex(props, 'grassTexture')
  }
}

export async function stageInstancing(entity: Entity, world = Engine.instance.currentWorld) {
  const scatter = getComponent(entity, InstancingComponent)
  if (scatter.state === ScatterState.STAGING) {
    console.error('scatter component is already staging')
    return
  }
  scatter.state = ScatterState.STAGING
  const targetGeo = getFirstMesh(obj3dFromUuid(scatter.surface, world))!.geometry
  const normals = targetGeo.getAttribute('normal')
  const positions = targetGeo.getAttribute('position')
  const uvs = targetGeo.getAttribute('uv')
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
    let d1: number, d2: number, d3: number
    let hasNeg: boolean, hasPos: boolean

    d1 = sign(point, v1, v2)
    d2 = sign(point, v2, v3)
    d3 = sign(point, v3, v1)
    hasNeg = d1 < 0 || d2 < 0 || d3 < 0
    hasPos = d1 > 0 || d2 > 0 || d3 > 0

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
      let [i1, i2, i3] = [triIndex * 3, triIndex * 3 + 1, triIndex * 3 + 2].map(
        (idx) => targetGeo.index?.getX(idx) ?? idx
      )
      let [v1, v2, v3] = [i1, i2, i3].map(getUV)
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
    await loadSampleTextures(scatter.sampleProperties as any)
  }

  let props = scatter.sourceProperties
  let grassGeometry: BufferGeometry
  if ((props as GrassProperties).isGrassProperties) {
    props = formatMaterialArgs(props)
    const grassProps = props as GrassProperties
    await loadGrassTextures(grassProps)
    //samplers
    grassGeometry = new PlaneGeometry(grassProps.bladeWidth.mu, grassProps.bladeHeight.mu, 1, grassProps.joints)

    grassGeometry.translate(0, grassProps.bladeHeight.mu / 2, 0)

    let vertex = new Vector3()
    let quaternion0 = new Quaternion()
    let quaternion1 = new Quaternion()
    let x, y, z, w, angle, sinAngle, rotationAxis

    //Rotate around Y
    angle = 0.15
    sinAngle = Math.sin(angle / 2.0)
    rotationAxis = new Vector3(0, 1, 0)
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

    let quaternion2 = new Quaternion()

    //Bend grass base geometry for more organic look
    for (let v = 0; v < grassGeometry.attributes.position.array.length / 3; v += 1) {
      quaternion2.setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2)
      vertex.x = grassGeometry.attributes.position.array[v * 3]
      vertex.y = grassGeometry.attributes.position.array[v * 3 + 1]
      vertex.z = grassGeometry.attributes.position.array[v * 3 + 2]
      let frac = vertex.y / (grassProps.bladeHeight.mu + grassProps.bladeHeight.sigma)
      quaternion2.slerp(quaternion0, frac)
      vertex.applyQuaternion(quaternion2)
      grassGeometry.attributes.position.setXYZ(v, vertex.x, vertex.y, vertex.z)
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
        let orient = new Quaternion()
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
    case SampleMode.NODES:
      const root = world.entityTree.uuidNodeMap.get((scatter.sampleProperties as NodeProperties).root)
      numInstances = 0
      if (root === undefined) {
        console.error('could not find root node with uuid', (scatter.sampleProperties as NodeProperties).root)
      } else {
        iterateEntityNode(
          root,
          (node) => {
            numInstances += 1
            const obj3d = obj3dFromUuid(node.uuid, world)
            if ((props as GrassProperties).isGrassProperties) {
              stageGrassBuffers(obj3d.position, obj3d.quaternion, obj3d.scale)
            } else if ((props as MeshProperties).isMeshProperties) {
              stageMeshBuffers(obj3d.position, obj3d.quaternion, obj3d.scale)
            }
          },
          (node) => node !== root && hasComponent(node.entity, Object3DComponent),
          world.entityTree
        )
        if ((props as GrassProperties).isGrassProperties) stageGrassAttributes()
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
  switch (scatter.mode) {
    case ScatterMode.GRASS:
      const grassProps = props as GrassProperties
      resultMat = new RawShaderMaterial({
        uniforms: {
          time: { value: 0 },
          map: { value: grassProps.grassTexture },
          vHeight: { value: grassProps.bladeHeight.mu + grassProps.bladeHeight.sigma },
          alphaMap: { value: grassProps.alphaMap },
          sunDirection: { value: new Vector3(-0.35, 0, 0) },
          cameraPosition: { value: Engine.instance.currentWorld.camera.position },
          ambientStrength: { value: grassProps.ambientStrength },
          diffuseStrength: { value: grassProps.diffuseStrength },
          sunColor: { value: grassProps.sunColor }
        },
        vertexShader: grassVertexSource,
        fragmentShader: grassFragmentSource,
        side: DoubleSide
      })
      const shaderMat = resultMat as RawShaderMaterial
      if (sampleProps.densityMap) {
        shaderMat.defines.DENSITY_MAPPED = ''
        shaderMat.uniforms = {
          ...shaderMat.uniforms,
          heightMap: { value: sampleProps.heightMap },
          heightMapStrength: { value: sampleProps.heightMapStrength }
        }
      }
      if (sampleProps.heightMap) {
        shaderMat.defines.HEIGHT_MAPPED = ''
        shaderMat.uniforms = {
          ...shaderMat.uniforms,
          densityMap: { value: sampleProps.densityMap },
          densityMapStrength: { value: sampleProps.densityMapStrength }
        }
      }
      result = new Mesh(instancedGeometry, resultMat)
      result.name = 'Grass'
      break
    case ScatterMode.MESH:
      const meshProps = props as MeshProperties
      const iMesh = getFirstMesh(obj3dFromUuid(meshProps.instancedMesh))!
      const iMat = iMesh.material as any
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
      ;(result as InstancedMesh).instanceMatrix.set(transforms)
      ;(result as InstancedMesh).instanceMatrix.needsUpdate = true
      break
    default:
      resultMat = new Material()
      result = new Mesh()
      break
  }
  if (!getComponent(entity, GroupComponent)?.[0]) addObjectToGroup(entity, new Object3D())
  const obj3d = getComponent(entity, GroupComponent)[0]
  obj3d.name = `${result.name} Base`
  const updates: ((dt: number) => void)[] = []
  switch (scatter.mode) {
    case ScatterMode.GRASS:
      function move(dT: number) {
        ;(resultMat as RawShaderMaterial).uniforms.time.value += dT
      }
      updates.push(move)
      break
  }
  switch (scatter.sampling) {
    case SampleMode.NODES:
      const rootNode = world.entityTree.uuidNodeMap.get(sampleProps.root)
      function update(dt: number) {
        if (rootNode === undefined) {
          console.error('could not find root node with uuid', sampleProps.root)
        } else {
          let instanceIdx = 0
          iterateEntityNode(
            rootNode,
            (node) => {
              const obj3d = getComponent(node.entity, GroupComponent)[0]
              ;(result as InstancedMesh).setMatrixAt(instanceIdx, obj3d.matrix)
              instanceIdx += 1
            },
            (node) => node !== rootNode && hasComponent(node.entity, GroupComponent, world)
          )
          ;(result as InstancedMesh).instanceMatrix.needsUpdate = true
        }
      }
      updates.push(update)
      break
  }
  if (updates.length > 0) {
    if (!hasComponent(entity, UpdatableComponent)) {
      addComponent(entity, UpdatableComponent, true)
    }
    setCallback(entity, UpdatableCallback, (dt) => updates.forEach((update) => update(dt)))
  }
  result.frustumCulled = false
  obj3d.add(result)
  scatter.state = ScatterState.STAGED
  const eNode = world.entityTree.entityNodeMap.get(entity)!
  dispatchAction(InstancingActions.instancingStaged({ uuid: eNode.uuid }))
}

export function unstageInstancing(entity: Entity, world = Engine.instance.currentWorld) {
  const comp = getComponent(entity, InstancingComponent) as InstancingComponentType
  const group = getComponent(entity, GroupComponent)
  const obj3d = group.pop()
  obj3d?.removeFromParent()
  if (group.length === 0) removeComponent(entity, GroupComponent, world)
  comp.state = ScatterState.UNSTAGED
}
