import { max, min } from 'lodash'
import {
  BufferGeometry,
  Color,
  ColorRepresentation,
  DoubleSide,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  MathUtils,
  Mesh,
  MeshNormalMaterial,
  Object3D,
  PlaneBufferGeometry,
  Quaternion,
  RawShaderMaterial,
  Texture,
  Vector2,
  Vector3
} from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { AssetLoader } from '../../../assets/classes/AssetLoader'
import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { randomQuat } from '../../../common/functions/MathRandomFunctions'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../../ecs/functions/ComponentFunctions'
import { EngineRenderer } from '../../../renderer/WebGLRendererSystem'
import UpdateableObject3D from '../../classes/UpdateableObject3D'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent, Object3DWithEntity } from '../../components/Object3DComponent'
import {
  GrassProperties,
  MeshProperties,
  sample,
  sampleVar,
  ScatterComponent,
  ScatterComponentType,
  ScatterMode,
  ScatterStagingComponent,
  ScatterState
} from '../../components/ScatterComponent'
import { UpdatableComponent } from '../../components/UpdatableComponent'

export const GRASS_PROPERTIES_DEFAULT_VALUES: GrassProperties = {
  isGrassProperties: true,
  bladeHeight: { mu: 0.1, sigma: 0.05 },
  bladeWidth: { mu: 0.03, sigma: 0.01 },
  joints: 4,
  grassTexture: new Texture(),
  alphaMap: new Texture(),
  heightMap: new Texture(),
  heightMapStrength: 0.05,
  densityMap: new Texture(),
  densityMapStrength: 0.5,
  ambientStrength: 0.5,
  diffuseStrength: 0,
  shininess: 0,
  sunColour: new Color(0.7, 0.65, 0.4)
}

export const MESH_PROPERTIES_DEFAULT_VALUES: MeshProperties = {
  isMeshProperties: true,
  instancedMesh: ''
}

export const SCENE_COMPONENT_SCATTER = 'scatter'
export const SCENE_COMPONENT_SCATTER_DEFAULT_VALUES = {
  count: 1000,
  surface: '',
  densityMap: '',
  mode: ScatterMode.GRASS,
  state: ScatterState.UNSTAGED,
  properties: GRASS_PROPERTIES_DEFAULT_VALUES
}

const grassVertexSource = `
precision mediump float;
attribute vec3 position;
attribute vec3 normal;
attribute vec3 offset;
attribute vec2 uv;
attribute vec4 orient;
attribute vec3 scale;
attribute float index;
uniform float time;
uniform float vHeight;
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

void main() {
    //Scale vertices
vec3 vPosition = position;
    vPosition.x *= scale.x;
    vPosition.y *= scale.y;
    vPosition.z *= scale.z;
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
float noise = 0.5 + 0.5 * sin(vPosition.x + time);
float halfAngle = -noise * 0.1;
noise = 0.5 + 0.5 * cos(vPosition.y + time);
halfAngle -= noise * 0.05;

    direction = normalize(vec4(sin(halfAngle), 0.0, -sin(halfAngle), cos(halfAngle)));

    //Rotate blade and normals according to the wind
    vPosition = rotateVectorByQuaternion(vPosition, direction);
    vNormal = rotateVectorByQuaternion(vNormal, direction);


    //Index of instance for varying colour in fragment shader
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
uniform vec3 sunColour;
uniform vec3 sunDirection;


//Surface uniforms
uniform sampler2D map;
uniform sampler2D alphaMap;
uniform vec3 specularColour;

varying float idx;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float frc;
vec3 ACESFilm(vec3 x){
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;
    return clamp((x*(a*x+b))/(x*(c*x+d)+e), 0.0, 1.0);
}

void main() {

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

//Get colour data from texture
    vec3 textureColour = pow(texture2D(map, vUv).rgb, vec3(2.2));

//Add different green tones towards root
    vec3 mixColour = idx > 0.75 ? vec3(0.2, 0.8, 0.06) : vec3(0.5, 0.8, 0.08);
textureColour = mix(0.1 * mixColour, textureColour, 0.75);

    vec3 lightTimesTexture = sunColour * textureColour;
vec3 ambient = textureColour;
    
    vec3 lightDir = normalize(sunDirection);

//How much a fragment faces the light
    float dotNormalLight = dot(normal, lightDir);
float diff = max(dotNormalLight, frc);

//Colour when lit by light
vec3 diffuse = diff * lightTimesTexture;

float sky = max(dot(normal, vec3(0, 1, 0)), 0.8);
    vec3 skyLight = sky * vec3(0.12, 0.29, 0.55);
    vec3 col = 0.3 * skyLight * textureColour + diffuse * diffuseStrength + ambient * ambientStrength;
    gl_FragColor = vec4(col, 1.0);
    return;
}`

export const deserializeScatter: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<ScatterComponentType>
) => {
  const scatterProps = parseScatterProperties(json.props)
  addComponent(entity, ScatterComponent, scatterProps)
  if (scatterProps.state === ScatterState.STAGED) addComponent(entity, ScatterStagingComponent, {})
  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_SCATTER)
}

function parseScatterProperties(props): ScatterComponentType {
  const result: ScatterComponentType = {
    ...SCENE_COMPONENT_SCATTER_DEFAULT_VALUES,
    ...props
  }
  switch (result.mode) {
    case ScatterMode.GRASS:
      const defaults = GRASS_PROPERTIES_DEFAULT_VALUES
      result.properties = Object.fromEntries(
        Object.entries(result.properties).map(([k, v]) => {
          if ((defaults[k] as Color).isColor && !(v as Color).isColor) {
            return [k, new Color(v as ColorRepresentation)]
          } else {
            return [k, v]
          }
        })
      ) as GrassProperties
      break
  }
  return result
}

export const serializeScatter: ComponentSerializeFunction = (entity) => {
  const comp = getComponent(entity, ScatterComponent) as ScatterComponentType
  if (!comp) return
  const toSave = { ...comp }
  const scatterProps = comp.properties
  const serializedProps: GrassProperties | MeshProperties | any = {}
  if ((scatterProps as GrassProperties).isGrassProperties) {
    for (const [k, v] of Object.entries(scatterProps)) {
      if ((v as Texture)?.isTexture) {
        serializedProps[k] = (v as Texture).source.data?.src ?? ''
      } else if ((v as Color)?.isColor) {
        serializedProps[k] = (v as Color).getHex()
      } else {
        serializedProps[k] = v
      }
    }
  }
  toSave.properties = serializedProps
  return {
    name: SCENE_COMPONENT_SCATTER,
    props: toSave
  }
}

async function loadGrassTextures(props: GrassProperties) {
  const loadTex = async (prop) => {
    props[prop] = await AssetLoader.loadAsync(props[prop])
  }
  if (typeof props.alphaMap === 'string') {
    await loadTex('alphaMap')
  }
  if (typeof props.grassTexture === 'string') {
    await loadTex('grassTexture')
  }
}

export async function stageScatter(entity: Entity, world = Engine.instance.currentWorld) {
  const scatter = getComponent(entity, ScatterComponent)
  if (scatter.state === ScatterState.STAGING) {
    console.error('scatter component is already staging')
  }
  scatter.state = ScatterState.STAGING
  const target = world.entityTree.uuidNodeMap.get(scatter.surface)!.entity
  const targetRoot = getComponent(target, Object3DComponent).value
  const meshes: Mesh[] = []
  targetRoot.traverse((child: Mesh) => {
    child.isMesh && meshes.push(child)
  })

  if (meshes.length < 1) {
    console.error('no target surface found in', targetRoot)
    return
  }
  const targetGeo = meshes[0].geometry
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

  let props = scatter.properties
  if ((props as GrassProperties).isGrassProperties) {
    const grassProps = props as GrassProperties
    await loadGrassTextures(grassProps)
    //samplers
    const grassGeometry = new PlaneBufferGeometry(
      grassProps.bladeWidth.mu,
      grassProps.bladeHeight.mu,
      1,
      grassProps.joints
    )

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

    for (let i = 0; i < scatter.count; i += 1) {
      indices.push(i / scatter.count)
      let position: Vector3 | null, normal: Vector3 | null
      do {
        const sample = new Vector2(
          uvBounds.minU + (uvBounds.maxU - uvBounds.minU) * Math.random(),
          uvBounds.minV + (uvBounds.maxV - uvBounds.minV) * Math.random()
        )
        //sample positions from random uvs
        ;[position, normal] = positionAt(sample)
      } while (position === null)
      offsets.push(position.x, position.y, position.z)

      let orient = new Quaternion()
      orient.setFromUnitVectors(new Vector3(0, 1, 0), normal!)
      orients.push(orient.x, orient.y, orient.z, orient.w)

      const scale = new Vector2(1 + sampleVar(grassProps.bladeWidth), 1 + sampleVar(grassProps.bladeHeight))
      scales.push(scale.x, scale.y)
    }

    const offsetAttribute = new InstancedBufferAttribute(new Float32Array(offsets), 3)
    const scaleAttribute = new InstancedBufferAttribute(new Float32Array(scales), 2)
    const orientAttribute = new InstancedBufferAttribute(new Float32Array(orients), 4)
    const indexAttribute = new InstancedBufferAttribute(new Float32Array(indices), 1)

    instancedGeometry.setAttribute('offset', offsetAttribute)
    instancedGeometry.setAttribute('scale', scaleAttribute)
    instancedGeometry.setAttribute('orient', orientAttribute)
    instancedGeometry.setAttribute('index', indexAttribute)

    const grassMaterial = new RawShaderMaterial({
      uniforms: {
        time: { value: 0 },
        map: { value: grassProps.grassTexture },
        vHeight: { value: grassProps.bladeHeight.mu + grassProps.bladeHeight.sigma },
        alphaMap: { value: grassProps.alphaMap },
        sunDirection: { value: new Vector3(-0.35, 0, 0) },
        cameraPosition: { value: Engine.instance.currentWorld.camera.position },
        ambientStrength: { value: grassProps.ambientStrength },
        diffuseStrength: { value: grassProps.diffuseStrength },
        sunColour: { value: grassProps.sunColour }
      },
      vertexShader: grassVertexSource,
      fragmentShader: grassFragmentSource,
      side: DoubleSide
    })

    const grass = new Mesh(instancedGeometry, grassMaterial)

    grass.name = 'Grass'

    let obj3d = getComponent(entity, Object3DComponent)
    if (!obj3d) {
      const val = new Object3D() as Object3DWithEntity
      val.entity = entity
      Engine.instance.currentWorld.scene.add(val)
      obj3d = addComponent(entity, Object3DComponent, { value: val })
    }
    const val = obj3d.value as UpdateableObject3D
    val.name = 'Grass Base'
    function move(dT: number) {
      grassMaterial.uniforms.time.value += dT
    }

    val.update = move
    if (!hasComponent(entity, UpdatableComponent)) {
      addComponent(entity, UpdatableComponent, {})
    }
    val.add(grass)
  }
  scatter.state = ScatterState.STAGED
}

export function unstageScatter(entity: Entity, world = Engine.instance.currentWorld) {
  const comp = getComponent(entity, ScatterComponent) as ScatterComponentType
  removeComponent(entity, Object3DComponent, world)
  comp.state = ScatterState.UNSTAGED
}
