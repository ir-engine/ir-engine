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
  ColorRepresentation,
  DoubleSide,
  LineBasicMaterial,
  NormalBlending,
  Plane,
  PlaneGeometry,
  ShaderMaterial
} from 'three'

import { Entity } from '@etherealengine/ecs'
import { defineComponent, setComponent, useComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { createEntity, removeEntity, useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { useEffect } from 'react'
import { NameComponent } from '../../common/NameComponent'
import { setVisibleComponent } from '../../renderer/components/VisibleComponent'
import { useResource } from '../../resources/resourceHooks'
import { RendererState } from '../RendererState'
import LogarithmicDepthBufferMaterialChunk from '../constants/LogarithmicDepthBufferMaterialChunk'
import { LineSegmentComponent } from './LineSegmentComponent'
import { useMeshComponent } from './MeshComponent'

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
  // pos.y += 0.01;

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

export const InfiniteGridHelperComponent = defineComponent({
  name: 'InfiniteGridHelperComponent',

  onInit: (entity) => {
    return {
      name: 'infinite-grid-helper',
      size1: 1,
      size2: 10,
      color: new Color('white') as ColorRepresentation,
      distance: 8000,
      gridHeight: 0
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (typeof json.name == 'string') component.name.set(json.name)
    if (typeof json.size1 == 'number') component.size1.set(json.size1)
    if (typeof json.size2 == 'number') component.size2.set(json.size2)
    // if (matchesColor.test(json.color)) component.color.set(json.color)
    if (typeof json.distance == 'number') component.distance.set(json.distance)
    if (typeof json.gridHeight == 'number') component.gridHeight.set(json.gridHeight)
  },

  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, InfiniteGridHelperComponent)
    const [mesh, geometry, material] = useMeshComponent(
      entity,
      new PlaneGeometry(2, 2, 1, 1),
      new ShaderMaterial({
        side: DoubleSide,
        uniforms: {
          uSize1: {
            value: component.size1.value
          },
          uSize2: {
            value: component.size2.value
          },
          uColor: {
            value: component.color.value
          },
          uDistance: {
            value: component.distance.value
          }
        },
        transparent: true,
        vertexShader: vertexShaderGrid,
        fragmentShader: fragmentShaderGrid,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: 0.01,
        extensions: {
          derivatives: true
        }
      })
    )
    const [plane] = useResource(new Plane(mesh.up), entity)

    useEffect(() => {
      mesh.name = component.name.value
      mesh.frustumCulled = false
    }, [])

    useEffect(() => {
      material.uniforms.uSize1.set({
        value: component.size1.value
      })
      material.uniforms.uSize2.set({
        value: component.size2.value
      })
    }, [component.size1, component.size2])

    useEffect(() => {
      material.uniforms.uDistance.set({
        value: component.distance.value
      })

      const lineEntities = [] as Entity[]
      const lineColors = ['red', 'green', 'blue']
      for (let i = 0; i < lineColors.length; i++) {
        const lineGeometry = new BufferGeometry()
        const floatArray = [0, 0, 0, 0, 0, 0]
        floatArray[i] = -component.distance.value
        floatArray[i + 3] = component.distance.value
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

        const lineEntity = createEntity()
        setComponent(lineEntity, LineSegmentComponent, {
          name: `infinite-grid-helper-line-${i}`,
          geometry: lineGeometry,
          material: lineMaterial
        })
        setComponent(lineEntity, EntityTreeComponent, { parentEntity: entity })
        lineEntities.push(lineEntity)
      }

      return () => {
        for (const lineEntity of lineEntities) removeEntity(lineEntity)
      }
    }, [component.distance])

    useEffect(() => {
      material.uniforms.uColor.set({
        value: component.color.value
      })
    }, [component.color])

    useEffect(() => {
      mesh.position.y = component.gridHeight.value
      mesh.updateMatrixWorld(true)
    }, [component.gridHeight])

    return null
  }
})

export const InfiniteGridComponent = defineComponent({
  name: 'Infinite Grid',
  onInit(entity) {
    return {
      size: 1,
      color: new Color('white'),
      distance: 8000
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

    setComponent(entity, InfiniteGridHelperComponent, {
      size1: component.size.value,
      size2: component.size.value * 10,
      color: component.color.value,
      distance: component.distance.value
    })
  },

  reactor: () => {
    const entity = useEntityContext()

    const component = useComponent(entity, InfiniteGridComponent)
    const engineRendererSettings = useHookstate(getMutableState(RendererState))
    const helper = useComponent(entity, InfiniteGridHelperComponent)

    useEffect(() => {
      helper.gridHeight.set(engineRendererSettings.gridHeight.value)
    }, [engineRendererSettings.gridHeight])

    useEffect(() => {
      helper.color.set(component.color.value)
    }, [component.color])

    useEffect(() => {
      const size = component.size.value
      helper.size1.set(size)
      helper.size2.set(size * 10)
    }, [component.size])

    useEffect(() => {
      helper.distance.set(component.distance.value)
    }, [component.distance])

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
