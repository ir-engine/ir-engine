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

import { Color, DoubleSide, Mesh, Plane, PlaneGeometry, ShaderMaterial, Vector3 } from 'three'

import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import LogarithmicDepthBufferMaterialChunk from '../functions/LogarithmicDepthBufferMaterialChunk'

/**
 * Original Author: Fyrestar
 * https://discourse.threejs.org/t/three-infinitegridhelper-anti-aliased/8377
 */
const vertexShader = `
varying vec3 worldPosition;
      
uniform float uDistance;
#include <logdepthbuf_pars_vertex>
${LogarithmicDepthBufferMaterialChunk}

void main() {

  vec3 pos = position.xzy * uDistance;
  pos.xz += cameraPosition.xz;
  // this is necessary to avoid z fighting
  pos.y += 0.001;

  worldPosition = pos;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

  #include <logdepthbuf_vertex>
}
`
const fragmentShader = `
varying vec3 worldPosition;

uniform float uSize1;
uniform float uSize2;
uniform vec3 uColor;
uniform float uDistance;

#include <logdepthbuf_pars_fragment>

float getGrid(float size) {
    vec2 r = worldPosition.xz / size;
    vec2 grid = abs(fract(r - 0.5) - 0.5) / fwidth(r);
    float line = min(grid.x, grid.y);
    return 1.0 - min(line, 1.0);
}

void main() {
  #include <logdepthbuf_fragment>

  float d = 1.0 - min(distance(cameraPosition.xz, worldPosition.xz) / uDistance, 1.0);

  float g1 = getGrid(uSize1);
  float g2 = getGrid(uSize2);


  gl_FragColor = vec4(uColor.rgb, mix(g2, g1, g1) * pow(d, 3.0));
  gl_FragColor.a = mix(0.5 * gl_FragColor.a, gl_FragColor.a, g2);

  if ( gl_FragColor.a <= 0.0 ) discard;
}
`

const GRID_INCREAMENT = 1.5

export default class InfiniteGridHelper extends Mesh {
  static instance: InfiniteGridHelper
  plane: Plane
  intersectionPointWorld: Vector3
  intersection: any

  constructor(size1?, size2?, color?, distance?) {
    color = color || new Color('white')
    size1 = size1 || 1
    size2 = size2 || 10
    distance = distance || 8000
    const geometry = new PlaneGeometry(2, 2, 1, 1)
    const material = new ShaderMaterial({
      side: DoubleSide,
      uniforms: {
        uSize1: {
          value: size1
        },
        uSize2: {
          value: size2
        },
        uColor: {
          value: color
        },
        uDistance: {
          value: distance
        }
      },
      transparent: true,
      vertexShader,
      fragmentShader,
      extensions: {
        derivatives: true
      }
    })

    super(geometry, material)

    this.name = 'InfiniteGridHelper'
    setObjectLayers(this, ObjectLayers.Gizmos)
    this.frustumCulled = false
    this.plane = new Plane(this.up)
    this.intersectionPointWorld = new Vector3()
    this.intersection = {
      distance: 0,
      point: this.intersectionPointWorld,
      object: this
    }
  }

  setSize(size) {
    ;(this.material as any).uniforms.uSize1.value = size
    ;(this.material as any).uniforms.uSize2.value = size * 10
  }

  raycast(raycaster, intersects) {
    const point = new Vector3()
    const intersection = raycaster.ray.intersectPlane(this.plane, point)
    if (intersection === null) return null
    this.intersectionPointWorld.copy(point)
    this.intersectionPointWorld.applyMatrix4(this.matrixWorld)
    const distance = raycaster.ray.origin.distanceTo(this.intersectionPointWorld)
    if (distance < raycaster.near || distance > raycaster.far) return null
    this.intersection.distance = distance
    intersects.push(this.intersection)
  }

  incrementGridHeight() {
    this.setGridHeight(this.position.y + GRID_INCREAMENT)
  }

  decrementGridHeight() {
    this.setGridHeight(this.position.y - GRID_INCREAMENT)
  }

  setGridHeight(value) {
    this.position.y = value
    this.updateMatrixWorld(true)
  }
}
