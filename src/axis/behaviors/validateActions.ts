import { Entity } from "ecsy"
import InputActionHandler from "../../axis/components/InputActionHandler"
export function validateActions(actionHandler: Entity): void {
  const actionQueueArray = actionHandler.getComponent(InputActionHandler).values.toArray()
  for (let i = 0; i < actionQueueArray.length; i++) {
    for (let k = 0; k < actionQueueArray.length; k++) {
      if (i == k) continue // don't compare to self

      // Opposing axes cancel out
      if (this.axesOpposeEachOther(actionQueueArray, i, k)) {
        actionHandler.getMutableComponent(InputActionHandler).values.remove(i)
        actionHandler.getMutableComponent(InputActionHandler).values.remove(k)
      }
      // If axis is blocked by another axis that overrides and is active, remove this axis
      else if (this.actionIsBlockedByAnother(actionQueueArray, i, k)) {
        actionHandler.getMutableComponent(InputActionHandler).values.remove(i)
      }
      // Override axes override
      else if (this.actionOverridesAnother(actionQueueArray, i, k)) {
        actionHandler.getMutableComponent(InputActionHandler).values.remove(k)
      }
    }
  }
}
