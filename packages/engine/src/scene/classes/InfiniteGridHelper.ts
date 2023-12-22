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

import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  NormalBlending,
  Plane,
  PlaneGeometry,
  ShaderMaterial
} from 'three'

import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { useEffect } from 'react'
import { Entity } from '../../ecs/classes/Entity'
import {
  defineComponent,
  getComponent,
  getMutableComponent,
  setComponent
} from '../../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity, useEntityContext } from '../../ecs/functions/EntityFunctions'
import { EntityTreeComponent } from '../../ecs/functions/EntityTree'
import { RendererState } from '../../renderer/RendererState'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { GroupComponent, addObjectToGroup, removeObjectFromGroup } from '../components/GroupComponent'
import { NameComponent } from '../components/NameComponent'
import { setVisibleComponent } from '../components/VisibleComponent'
import LogarithmicDepthBufferMaterialChunk from '../functions/LogarithmicDepthBufferMaterialChunk'
import { setObjectLayers } from '../functions/setObjectLayers'

/**
 * Original Author: Fyrestar
 * https://discourse.threejs.org/t/three-infinitegridhelper-anti-aliased/8377
 */
const vertexShaderGrid = `
varying vec3 worldPosition;
      
uniform float uDistance;
#include <logdepthbuf_pars_vertex>
${LogarithmicDepthBufferMaterialChunk}

void main() {

  vec3 pos = position.xzy * uDistance;
  pos.xz += cameraPosition.xz;
  // avoid z fighting
  pos.y += 0.01;

  worldPosition = pos;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

  #include <logdepthbuf_vertex>
}
`

const fragmentShaderGrid = `
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

float getXAxisLine() {
  float lineWidth = 0.02; // Adjust line width if needed
  float xLine = smoothstep(-lineWidth, lineWidth, abs(worldPosition.x));
  return 1.0 - xLine;
}

float getZAxisLine() {
  float lineWidth = 0.02; // Adjust line width if needed
  float zLine = smoothstep(-lineWidth, lineWidth, abs(worldPosition.z));
  return 1.0 - zLine;
}

void main() {
  #include <logdepthbuf_fragment>

  float d = 1.0 - min(distance(cameraPosition.xz, worldPosition.xz) / uDistance, 1.0);

  float g1 = getGrid(uSize1);
  float g2 = getGrid(uSize2);
  float xAxisLine = getXAxisLine();
  float zAxisLine = getZAxisLine();
  vec3 xAxisColor = vec3(1.0, 0.0, 0.0);
  vec3 zAxisColor = vec3(0.0, 0.0, 1.0);

  if (xAxisLine > 0.0 || zAxisLine > 0.0) {
    discard;
  } else {
    gl_FragColor = vec4(uColor.rgb, mix(g2, g1, g1) * pow(d, 3.0));
    gl_FragColor.a = mix(0.5 * gl_FragColor.a, gl_FragColor.a, g2);
}

  if ( gl_FragColor.a <= 0.0 ) discard;
}
`

export class InfiniteGridHelper extends Mesh<PlaneGeometry, ShaderMaterial> {
  plane: Plane

  constructor(size1 = 1, size2 = 10, color = new Color('white'), distance = 8000) {
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
      vertexShader: vertexShaderGrid,
      fragmentShader: fragmentShaderGrid,
      extensions: {
        derivatives: true
      }
    })

    super(geometry, material)

    this.name = 'InfiniteGridHelper'
    setObjectLayers(this, ObjectLayers.Gizmos)
    this.frustumCulled = false
    this.plane = new Plane(this.up)
  }

  setSize(size) {
    this.material.uniforms.uSize1.value = size
    this.material.uniforms.uSize2.value = size * 10
  }

  setDistance(distance) {
    this.material.uniforms.uDistance.value = distance
  }

  setGridColor(color) {
    this.material.uniforms.uColor.value = color
  }

  setGridHeight(value) {
    this.position.y = value
    this.updateMatrixWorld(true)
  }

  static createLines(distance: number) {
    const lines = [] as LineSegments[]
    const lineColors = ['red', 'green', 'blue']
    for (let i = 0; i < lineColors.length; i++) {
      const lineGeometry = new BufferGeometry()
      const floatArray = [0, 0, 0, 0, 0, 0]
      floatArray[i] = -distance
      floatArray[i + 3] = distance
      const linePositions = new Float32Array(floatArray)
      lineGeometry.setAttribute('position', new BufferAttribute(linePositions, 3))
      const lineMaterial = new LineBasicMaterial({
        side: DoubleSide,
        color: lineColors[i],
        transparent: true,
        opacity: 0.3,
        linewidth: 2,
        blending: NormalBlending,
        depthTest: true,
        depthWrite: true
      })
      const line = new LineSegments(lineGeometry, lineMaterial)
      lines.push(line)
      setObjectLayers(line, ObjectLayers.Gizmos)
    }
    return lines
  }
}

export const InfiniteGridComponent = defineComponent({
  name: 'Infinite Grid',
  onInit(entity) {
    return {
      size: 1,
      color: new Color('white'),
      distance: 8000,
      // internal
      helper: new InfiniteGridHelper(),
      lineEntities: [] as Entity[]
    }
  },

  onSet(
    entity,
    component,
    json: Partial<{
      size: number
      color: string | Color
      distance: number
    }>
  ) {
    if (!json) return

    if (typeof json.size === 'number') component.size.set(json.size)
    if (typeof json.color === 'string') component.color.set(new Color(json.color))
    if (json.color instanceof Color) component.color.set(json.color)
    if (typeof json.distance === 'number') component.distance.set(json.distance)
  },

  reactor: () => {
    const entity = useEntityContext()
    const component = useHookstate(getMutableComponent(entity, InfiniteGridComponent))
    const engineRendererSettings = useHookstate(getMutableState(RendererState))

    useEffect(() => {
      const helper = getComponent(entity, InfiniteGridComponent).helper
      addObjectToGroup(entity, helper)

      const distance = component.distance.value

      const lineEntities = [] as Entity[]

      const lines = InfiniteGridHelper.createLines(distance)
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const lineEntity = createEntity()
        addObjectToGroup(lineEntity, line)
        setComponent(lineEntity, NameComponent, 'Infinite Grid Helper Line ' + i)
        setVisibleComponent(lineEntity, true)
        setComponent(lineEntity, EntityTreeComponent, { parentEntity: entity })
        lineEntities.push(lineEntity)
      }

      component.lineEntities.set(lineEntities)

      return () => {
        removeObjectFromGroup(entity, helper)
        for (const lineEntity of lineEntities) removeEntity(lineEntity)
      }
    }, [])

    useEffect(() => {
      const component = getComponent(entity, InfiniteGridComponent)
      component.helper.setGridHeight(engineRendererSettings.gridHeight.value)
    }, [engineRendererSettings.gridHeight])

    useEffect(() => {
      const component = getComponent(entity, InfiniteGridComponent)
      component.helper.setGridColor(component.color)
    }, [component.color])

    useEffect(() => {
      const component = getComponent(entity, InfiniteGridComponent)
      component.helper.setSize(component.size)
    }, [component.size])

    useEffect(() => {
      const component = getComponent(entity, InfiniteGridComponent)
      component.helper.setDistance(component.distance)
      for (let i = 0; i < component.lineEntities.length; i++) {
        const lineEntity = component.lineEntities[i]
        const line = getComponent(lineEntity, GroupComponent)[0] as any as LineSegments
        const floatArray = [0, 0, 0, 0, 0, 0]
        floatArray[i] = -component.distance
        floatArray[i + 3] = component.distance
        const linePositions = new Float32Array(floatArray)
        line.geometry.setAttribute('position', new BufferAttribute(linePositions, 3))
      }
    }, [component.distance, component.lineEntities])

    return null
  }
})

export const createInfiniteGridHelper = () => {
  const entity = createEntity()
  setComponent(entity, EntityTreeComponent)
  setComponent(entity, InfiniteGridComponent)
  setComponent(entity, NameComponent, 'Infinite Grid Helper')
  setVisibleComponent(entity, true)
  return entity
}
