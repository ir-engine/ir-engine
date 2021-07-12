import { System, SystemAttributes } from '../../ecs/classes/System'
import { UIPanelComponent } from '../components/UIPanelComponent'
import { Block, update } from '../../assets/three-mesh-ui'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { Group, Raycaster } from 'three'
import { Engine } from '../../ecs/classes/Engine'
import { MouseInput } from '../../input/enums/InputEnums'
import { UI_ELEMENT_SELECT_STATE } from '../classes/UIBaseElement'
import { InputValue } from '../../input/interfaces/InputValue'
import { NumericalType } from '../../common/types/NumericalTypes'
import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { DesiredTransformComponent } from '../../transform/components/DesiredTransformComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType'

const getUIPanelFromHit = (hit: any) => {
  if (!(hit instanceof Block)) {
    if (!hit.parent) return null
    return getUIPanelFromHit(hit.parent)
  }

  if (!hit.setSelectState) return null

  if (!getVisiblity(hit)) return null

  return hit
}

const getMovableFromHit = (hit: any) => {
  if (!(hit instanceof Block)) {
    if (!hit.parent) return null
    return getMovableFromHit(hit.parent)
  }

  if (!hit.setMoveHandler) return null

  if (!getVisiblity(hit)) return null

  return hit
}

const getVisiblity = (obj) => {
  if (obj && obj.visible === false) return false

  let bool = true
  obj.traverseAncestors((parent) => {
    if (parent && !parent.visible) bool = false
  })
  return bool
}

// for internal use
export class UIPanelSystem extends System {
  raycaster: Raycaster = new Raycaster()
  panelContainer: Group = new Group()
  lastRaycastTargets: Block[] = []
  updateType = SystemUpdateType.Fixed

  constructor(attributes: SystemAttributes = {}) {
    super(attributes)
    this.panelContainer
    Engine.scene.add(this.panelContainer)
  }

  execute(): void {
    this.queryResults.panels?.added?.forEach((entity: Entity) => {
      const uiPanel = getComponent(entity, UIPanelComponent)
      this.panelContainer.add(uiPanel.panel)
    })

    this.queryResults.panels?.removed?.forEach((entity: Entity) => {
      const uiPanel = getComponent(entity, UIPanelComponent)
      this.panelContainer.remove(uiPanel.panel)
    })

    this.queryResults.panels?.all?.forEach((entity: Entity) => {
      // const transform = getComponent(entity, TransformComponent);
      // const desiredTransform = getComponent(entity, DesiredTransformComponent);

      // console.log('Transform: ', transform.position);
      // console.log('DesiredTransform: ', desiredTransform.position);

      const component = getComponent(entity, UIPanelComponent)
      // console.log('component: ', component);

      const currentdate = new Date()
      const datetime =
        'Last Sync: ' +
        currentdate.getDate() +
        '/' +
        (currentdate.getMonth() + 1) +
        '/' +
        currentdate.getFullYear() +
        ' @ ' +
        currentdate.getHours() +
        ':' +
        currentdate.getMinutes() +
        ':' +
        currentdate.getSeconds()

      // console.log('current time: ', datetime);
    })

    this.doRaycasts()
    if (this.queryResults.panels?.all?.length) {
      update()
    }
  }

  doRaycasts() {
    if (Engine.xrSession) {
      // TODO
    } else {
      const mousePos = Engine.inputState.get(MouseInput.MousePosition) as InputValue<NumericalType>
      const mouseDown = Engine.inputState.get(MouseInput.LeftButton) as InputValue<NumericalType>

      if (!mousePos?.value) return

      this.raycaster.setFromCamera({ x: mousePos.value[0], y: mousePos.value[1] }, Engine.camera)

      const hits = this.raycaster.intersectObjects(this.panelContainer.children, true)

      if (!hits || !hits[0]) return

      let movable = null
      for (let i = 0; i < hits.length; i++) {
        const hit = hits[i].object
        movable = getMovableFromHit(hit)
        if (movable) {
          console.log(hits[i], mouseDown)
          movable.setMoveHandler(hits[i].point, mouseDown)
          return
        }
      }

      let uiElement = null
      for (let i = 0; i < hits.length; i++) {
        const hit = hits[i].object
        uiElement = getUIPanelFromHit(hit)
        if (uiElement) break
      }

      if (!uiElement) return

      if (this.lastRaycastTargets[0] !== uiElement) {
        this.lastRaycastTargets[0]?.setSelectState(UI_ELEMENT_SELECT_STATE.IDLE)
      }

      this.lastRaycastTargets[0] = uiElement

      const isInputClicked = Boolean(
        mouseDown && mouseDown.value && mouseDown.lifecycleState === LifecycleValue.STARTED
      )

      uiElement.setSelectState(isInputClicked ? UI_ELEMENT_SELECT_STATE.SELECTED : UI_ELEMENT_SELECT_STATE.HOVERED)
    }
  }

  dispose() {}
}

UIPanelSystem.queries = {
  panels: {
    components: [UIPanelComponent],
    listen: {
      added: true,
      removed: true
    }
  }
}
