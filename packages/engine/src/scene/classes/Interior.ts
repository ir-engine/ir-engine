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
import { Mesh, PlaneGeometry, ShaderMaterial, SRGBColorSpace, Texture, Vector2 } from 'three'

import { Entity } from '../../ecs/classes/Entity'
import { InteriorComponent } from '../components/InteriorComponent'
import { loadCubeMapTexture, loadDDSTexture } from '../constants/Util'
import { addError, removeError } from '../functions/ErrorFunctions'

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

export class Interior extends Mesh<PlaneGeometry, ShaderMaterial> {
  _cubePath: string
  _size: Vector2
  entity: Entity

  constructor(entity: Entity) {
    const material = new ShaderMaterial({
      uniforms: {
        cubemap: { value: null },
        tiling: { value: new Vector2(1, 1) }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    })

    const geometry = new PlaneGeometry(1, 1)
    geometry.computeTangents()

    super(geometry, material)

    this._size = new Vector2(1, 1)
    this.entity = entity
  }

  get _material(): ShaderMaterial {
    return this.material
  }

  get cubeMap(): string {
    return this._cubePath
  }

  set cubeMap(path: string) {
    this._cubePath = path
    const onLoad = (texture: Texture) => {
      texture.colorSpace = SRGBColorSpace
      this._material.uniforms.cubemap.value = texture
      removeError(this.entity, InteriorComponent, 'LOADING_ERROR')
    }
    const onError = (error) => addError(this.entity, InteriorComponent, 'LOADING_ERROR', error.message)

    if (this._cubePath.endsWith('.dds')) {
      loadDDSTexture(path, onLoad, undefined, onError)
    } else {
      loadCubeMapTexture(path, onLoad, undefined, onError)
    }
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

    const geometry = new PlaneGeometry(this._size.x, this._size.y)
    geometry.computeTangents()

    this.geometry = geometry
  }
}
