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
  ArrowHelper,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Euler,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshLambertMaterial,
  Quaternion,
  Vector3
} from 'three'

import { matches } from '../../common/functions/MatchesUtils'
import { defineComponent, getOptionalComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { PresentationSystemGroup } from '../../ecs/functions/EngineFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { useExecute } from '../../ecs/functions/SystemFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { ObjectLayers } from '../constants/ObjectLayers'
import { setObjectLayers } from '../functions/setObjectLayers'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'

// an idea of a bundle that packages up all the related concerns on a spline point
// @todo there may need to be a concept of an engine mode versus editor mode where no gizmos are manufactured

let id = 0

class SplineElement {
  id: number
  position: Vector3
  quaternion: Quaternion
  gizmo: Mesh
  dirty: boolean
  constructor(elem = { position: { x: 0, y: 0, z: 0 }, quaternion: { x: 0, y: 0, z: 0, w: 1 } }) {
    this.position = new Vector3(elem.position.x, elem.position.y, elem.position.z)
    this.quaternion = new Quaternion(elem.quaternion.x, elem.quaternion.y, elem.quaternion.z, elem.quaternion.w)
    id++
    this.id = id
    this.dirty = true
  }
}

// @todo debugging -> for now i pulled the elements out of hookstate scope - later revert to be reactive

const ARC_SEGMENTS = 200
const _point = new Vector3()
const helperGeometry = new BoxGeometry(0.1, 0.1, 0.1)
const helperMaterial = new MeshLambertMaterial({ color: 'white' })
const lineGeometry = new BufferGeometry()
lineGeometry.setAttribute('position', new BufferAttribute(new Float32Array(ARC_SEGMENTS * 3), 3))

class SplineWrapper extends Group {
  elements: SplineElement[] = []
  curveType: 'catmullrom' | 'centripetal' | 'chordal' = 'catmullrom'
  curve: CatmullRomCurve3 | null = null
  line: Line | null = null

  constructor(name: string) {
    super()
    this.name = name
  }

  addSplineElement() {
    const elem = new SplineElement()
    this.elements.push(elem)
  }

  removeSplineElement() {
    const elements = this.elements
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].id == elem.id) {
        const elem2 = elements.splice(i, 1)
        if (elem2 && elem2.length && elem2[0].gizmo) {
          this.remove(elem2[0].gizmo)
        }
      }
    }
  }

  update() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this

    self.elements.forEach((elem) => {
      if (!elem.gizmo) {
        const gizmo = (elem.gizmo = new Mesh(helperGeometry, helperMaterial))
        gizmo.castShadow = true
        gizmo.receiveShadow = true
        gizmo.layers.set(ObjectLayers.NodeHelper)
        gizmo.name = `${this.name}-gizmos-${elem.id}}`
        gizmo.updateMatrixWorld(true)
        gizmo.add(new ArrowHelper())
        self.add(gizmo)
        elem.dirty = true
      }
      if (elem.dirty) {
        elem.dirty = false
        elem.gizmo.position.set(elem.position.x, elem.position.y, elem.position.z)
        elem.gizmo.quaternion.copy(elem.quaternion)
        elem.gizmo.updateMatrixWorld(true)
      }
    })

    // don't paint a line if insufficient data
    if (self.elements.length <= 2) {
      if (self.line) self.line.visible = false
      return
    }

    // assert that a line exists
    if (!self.line) {
      const line = new Line(lineGeometry.clone(), new LineBasicMaterial({ color: 0xff0000, opacity: 0.35 }))
      line.castShadow = true
      line.layers.set(ObjectLayers.NodeHelper)
      line.name = `${this.name}-line`
      self.add(line)
      self.line = line
    }

    // and is visible
    self.line.visible = true

    // build curve
    //const poses = component.wrapper.elements.map((element)=>{ new Vector3(element.position) })
    const poses: Vector3[] = []
    for (let i = 0; i < self.elements.length; i++) {
      poses.push(self.elements[i].position)
    }
    if (!self.curve) {
      self.curve = new CatmullRomCurve3(poses)
      self.curve.curveType = self.curveType
    }

    // have the line follow the curve
    const positions = self.line.geometry.attributes.position
    for (let i = 0; i < ARC_SEGMENTS; i++) {
      const t = i / (ARC_SEGMENTS - 1)
      self.curve.getPoint(t, _point)
      positions.setXYZ(i, _point.x, _point.y, _point.z)
    }
    positions.needsUpdate = true
  }

  flush() {
    this.elements.forEach((elem) => {
      if (elem.gizmo) this.remove(elem.gizmo)
    })
    if (this.line) {
      this.remove(this.line)
      this.line = null
    }
    this.elements = []
  }

  fromJSON(json) {
    this.flush()
    if (!matches.array.test(json.elems)) return
    const data = [] as SplineElement[]
    for (const val of json.elems) data.push(new SplineElement(val))
    this.elements = data
  }

  toJSON() {
    return this.elements.map((elem) => {
      return {
        position: { x: elem.position.x, y: elem.position.y, z: elem.position.z },
        quaternion: { x: elem.quaternion.x, y: elem.quaternion.y, z: elem.quaternion.z, w: elem.quaternion.w }
      }
    })
  }

  // test code
  alpha = 0.0
  testing(entity) {
    console.log('.... ' + this.alpha)

    const transform = getOptionalComponent(entity, TransformComponent)
    if (!transform) return

    this.alpha += 0.01 // deltaSeconds * 0.1
    const alpha = this.alpha
    const index = Math.floor(alpha)
    if (index > this.elements.length - 2) {
      this.alpha = 0
      return
    }
    const p1 = this.elements[index].position
    const p2 = this.elements[index + 1].position
    const q1 = this.elements[index].quaternion
    const q2 = this.elements[index + 1].quaternion

    // @todo replace naive lerp with a spline division based calculation
    transform.position.lerpVectors(p1, p2, alpha - index) //.add(transform.position).y -= 1
    transform.rotation.copy(new Quaternion().slerpQuaternions(q1, q2, alpha - index))
    //cameraTransform.rotation.copy(l) //.multiply(transform.rotation)

    console.log('....... ' + this.alpha)
  }
}

export const SplineComponent = defineComponent({
  name: 'SplineComponent',
  jsonID: 'spline-component',

  onInit: (entity) => {
    const wrapper = new SplineWrapper(`spline-line-${entity}`)
    addObjectToGroup(entity, wrapper)
    setObjectLayers(wrapper, ObjectLayers.NodeHelper)
    return {
      wrapper: wrapper
    }
  },

  onRemove: (entity, component) => {
    removeObjectFromGroup(entity, component.value.wrapper)
  },

  onSet: (entity, component, json) => {
    if (!json) return
    component.value.wrapper.fromJSON(json)
  },

  toJSON: (entity, component) => {
    return component.value.wrapper.toJSON()
  },

  getSplineElements: (entity, component) => {
    return component.value.wrapper.elements
  },

  addSplineElement: (entity, component) => {
    component.value.wrapper.addSplineElement()
    //hookstate approach:
    //set( ...component.value.elements, elem )
    //component.value.elements.concat([elem])
    component.value.wrapper.update() // @todo not reactive
  },

  moveSplineElement: (entity, component, elem: SplineElement, position: Vector3) => {
    elem.position.set(position.x, position.y, position.z)
    elem.dirty = true
    component.value.wrapper.update()
  },

  rotateSplineElement: (entity, component, elem: SplineElement, euler: Euler) => {
    elem.quaternion.setFromEuler(euler)
    elem.dirty = true
    component.value.wrapper.update()
  },

  removeSplineElement: (entity, component, elem) => {
    component.value.wrapper.removeSplineElement(elem)
    component.value.wrapper.update()
  },

  reactor: function (props) {
    const entity = useEntityContext()
    const component = useComponent(entity, SplineComponent)
    //const component = useOptionalComponent(entity, SplineComponent)?.value

    useExecute(
      () => {
        component.value.wrapper.testing(entity)
      },
      { with: PresentationSystemGroup }
    )

    // @todo turn reactivity back on by merging wrapper back into this component
    //useEffect(()=>{
    //  component.value.wrapper.update()
    //}, [component.wrapper.elements])

    return null
  }
})

/*

// this is a pattern to use jsx to keep the spline positions synced with arrows
// but let's push these arrow things down into the spline itcomponent - why mirror it here?

{
  reactor: function (props) {
    return (
      <>
        {component.splinePositions.map((point,i) => (
          <ArrowHelperReactor key={i} arrowsRef={arrowsRef} point={point} />
        ))}
      </>
    )

    return null
  }
}

function ArrowHelperReactor(arrowsRef,point) {
  useEffect( () => {
    const arrow = new ArrowHelper()
    arrowsRef.value.add(arrow)
    return () => {
      arrowsRef.children.remove(arrow)
    }
  })
}

*/

/*

  reactor: function (props) {

    // this was an idea for late creation of other components to reduce startup costs... not used atm
    // it turns out to be a hassle to get at state easily
    const splineRef = useHookstate(()=>{
      const spline = new Spline()
      spline.name = `spline-helper-${entity}`
      setObjectLayers(spline, ObjectLayers.NodeHelper)
      addObjectToGroup(entity, spline)
      return spline
    })

    // this wasn't actually that useful as a pattern, it should be buried inside of the rendering logic not up here
    const arrowsRef = useHookstate(()=>{
      const arrows = new Group()
      arrows.name = `spline-arrows-${entity}`
      setObjectLayers(arrows, ObjectLayers.NodeHelper)
      addObjectToGroup(entity, arrows)
      return arrows
    })

    // this was another thought about late construction
    useEffect(()=>{

      // another approach for late building 
      const spline = new Spline()
      splineComponent.spline.set(spline)
      spline.name = `spline-helper-${entity}`
      setObjectLayers(spline, ObjectLayers.NodeHelper)
      addObjectToGroup(entity, spline)

      // there's probably no point in having these up at this level at all
      const arrows = new Group()
      splineComponent.arrows.set(arrows)
      arrows.name = `spline-arrows-${entity}`
      setObjectLayers(arrows, ObjectLayers.NodeHelper)
      addObjectToGroup(entity, arrows)

      // destroy things when done...
      return () => {
        splineComponent.spline.set(null)
        splineComponent.arrows.set(null)
        removeObjectFromGroup(entity, arrows )
        removeObjectFromGroup(entity, spline )
      }
    },[])

    return null
  }

*/

/*

    // there was a concept of arrow helpers... removed for now

    useEffect(() => {
      const arrows = splineComponent.arrows.value!
      while(arrows.children.length<splineComponent.splinePositions.value.length) {
        arrows.add(new ArrowHelper)
      }
      while(arrows.children.length>splineComponent.splinePositions.value.length) {
        arrows.children[arrows.children.length-1].removeFromParent()
      }
      for (let i = 0; i < arrows.children.length; i++) {
        const child = arrows.children[i]
        child.position.copy(splineComponent.splinePositions.value[i])
        child.quaternion.copy(splineComponent.splineRotations.value[i])
        child.updateMatrixWorld(true)
      }
    }, [splineComponent.splinePositions, splineComponent.splineRotations])
    */
