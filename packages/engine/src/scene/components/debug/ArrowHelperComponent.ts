import {
  createEntity,
  defineComponent,
  removeEntity,
  setComponent,
  useComponent,
  useEntityContext
} from '@etherealengine/ecs'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { matchesColor, matchesVector3 } from '@etherealengine/spatial/src/common/functions/MatchesUtils'
import { addObjectToGroup, removeObjectFromGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { ObjectLayerMaskComponent } from '@etherealengine/spatial/src/renderer/components/ObjectLayerComponent'
import { setVisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@etherealengine/spatial/src/renderer/constants/ObjectLayers'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { useEffect } from 'react'
import { ArrowHelper, ColorRepresentation, Vector3 } from 'three'
import { useObj } from '../../../assets/functions/resourceHooks'

export const ArrowHelperComponent = defineComponent({
  name: 'ArrowHelperComponent',

  onInit: (entity) => {
    return {
      dir: new Vector3(0, 0, 1),
      origin: new Vector3(0, 0, 0),
      length: 0.5,
      color: 0xffffff as ColorRepresentation,
      headLength: undefined as undefined | number,
      headWidth: undefined as undefined | number
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matchesVector3.test(json.dir)) component.dir.set(json.dir)
    if (matchesVector3.test(json.origin)) component.origin.set(json.origin)
    if (typeof json.length === 'number') component.length.set(json.length)
    if (matchesColor.test(json.color)) component.color.set(json.color)
    if (typeof json.headLength === 'number') component.headLength.set(json.headLength)
    if (typeof json.headWidth === 'number') component.headWidth.set(json.headWidth)
  },

  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, ArrowHelperComponent)
    const [helper] = useObj<ArrowHelper, typeof ArrowHelper>(
      ArrowHelper,
      entity,
      component.dir.value,
      // Origin value isn't updatable in ArrowHelper
      component.origin.value,
      component.length.value,
      component.color.value,
      component.headLength.value,
      component.headWidth.value
    )

    useEffect(() => {
      helper.setDirection(component.dir.value)
      helper.setColor(component.color.value)
      helper.setLength(component.length.value, component.headLength.value, component.headWidth.value)
    }, [component.dir, component.length, component.color, component.headLength, component.headWidth])

    useEffect(() => {
      helper.name = `arrow-helper-${entity}`

      const helperEntity = createEntity()
      addObjectToGroup(helperEntity, helper)
      setComponent(helperEntity, NameComponent, helper.name)
      setComponent(helperEntity, EntityTreeComponent, { parentEntity: entity })
      setVisibleComponent(helperEntity, true)
      setComponent(helperEntity, ObjectLayerMaskComponent, ObjectLayers.NodeHelper)

      return () => {
        removeObjectFromGroup(helperEntity, helper)
        removeEntity(helperEntity)
      }
    }, [])

    return null
  }
})
