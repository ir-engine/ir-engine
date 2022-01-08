import {
  CubeTexture,
  CubeTextureLoader,
  Mesh,
  PlaneBufferGeometry,
  ShaderMaterial,
  Texture,
  Vector2,
  sRGBEncoding
} from 'three'

import { DDSLoader } from '../../assets/loaders/dds/DDSLoader'

const vertexShader = `
attribute vec4 tangent;

varying vec3 vViewDirTangent;
varying vec2 vUv;

void main()
{
    vUv = uv;
    vec3 vNormal = normalMatrix * normal;
    vec3 vTangent = normalMatrix * tangent.xyz;
    vec3 vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );

    mat3 mTBN = transpose(mat3(vTangent, vBitangent, vNormal));
    
    vec4 mvPos = modelViewMatrix * vec4( position, 1.0 );
    vec3 viewDir = -mvPos.xyz;
    vViewDirTangent = mTBN * viewDir;

    gl_Position = projectionMatrix * mvPos;
}`

const fragmentShader = `
varying vec3 vViewDirTangent;
varying vec2 vUv;

uniform samplerCube cubemap;
uniform vec2 tiling;

float min3 (vec3 v) {
  return min (min (v.x, v.y), v.z);
}

void main()
{
    vec2 uv = fract(vUv * tiling);
    vec3 sampleDir = normalize(vViewDirTangent);

    sampleDir *= vec3(-1.,-1.,1.);
    vec3 viewInv = 1. / sampleDir;

    vec3 pos = vec3(uv * 2.0 - 1.0, -1.0);
    
    float fmin = min3(abs(viewInv) - viewInv * pos);
    sampleDir = sampleDir * fmin + pos;

    gl_FragColor = texture(cubemap, sampleDir);
}`

function loadCubeMap(path): Promise<CubeTexture> {
  const loader = new CubeTextureLoader().setPath(path)
  const negx = 'negx.jpg'
  const negy = 'negy.jpg'
  const negz = 'negz.jpg'
  const posx = 'posx.jpg'
  const posy = 'posy.jpg'
  const posz = 'posz.jpg'
  return new Promise((resolve, reject) => {
    loader.load([posx, negx, posy, negy, posz, negz], resolve, null!, (error) => reject(error))
  })
}

function loadDDS(path): Promise<Texture> {
  return new Promise((resolve, reject) => {
    const loader = new DDSLoader()

    loader.load(
      path,
      (data) => {
        resolve(data)
      },
      null!,
      (error) => {
        reject(error)
      }
    )
  })
}

export class Interior extends Mesh {
  _cubePath: string
  _size: Vector2

  constructor() {
    const material = new ShaderMaterial({
      uniforms: {
        cubemap: { value: null },
        tiling: { value: new Vector2(1, 1) }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    })

    const geometry = new PlaneBufferGeometry(1, 1)
    geometry.computeTangents()

    super(geometry, material)

    this._size = new Vector2(1, 1)
  }

  get _material(): ShaderMaterial {
    return this.material as ShaderMaterial
  }

  get cubeMap(): string {
    return this._cubePath
  }

  set cubeMap(path: string) {
    this._cubePath = path
    let promise

    if (this._cubePath.endsWith('.dds')) {
      promise = loadDDS(path)
    } else {
      promise = loadCubeMap(path)
    }

    promise
      .then((texture) => {
        texture.encoding = sRGBEncoding
        this._material.uniforms.cubemap.value = texture
      })
      .catch(console.error)
  }

  get tiling(): number {
    return this._material.uniforms.tiling.value.x
  }

  set tiling(value: number) {
    this._material.uniforms.tiling.value.set(value, value)
  }

  get size(): Vector2 {
    return this._size
  }

  set size(value: Vector2) {
    this._size.copy(value)

    const geometry = new PlaneBufferGeometry(this._size.x, this._size.y)
    geometry.computeTangents()

    this.geometry = geometry
  }
}
