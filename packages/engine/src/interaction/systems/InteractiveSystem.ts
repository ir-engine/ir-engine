import { System } from "../../ecs/classes/System";
import { Interactive } from "../components/Interactive";
import { Interacts } from "../components/Interacts";
import { interactHover } from "../behaviors/interactHover";
import { interact } from "../behaviors/interact";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import { Input } from "../../input/components/Input";
import { DefaultInput } from "../../templates/shared/DefaultInput";
import { BinaryValue } from "../../common/enums/BinaryValue";

export class InteractiveSystem extends System {
  execute(delta: number, time: number): void {
    this.queryResults.interactors?.all.forEach(entity => {
      console.log('this.queryResults.interactive?.all.length', this.queryResults.interactive?.all.length)
      if (this.queryResults.interactive?.all.length) {
        interactHover(entity, { interactive: this.queryResults.interactive.all })

        const interacts = getComponent(entity, Interacts)
        if (interacts.focusedInteractive) {
          const input = getComponent(entity, Input)
          if (input.data.has(DefaultInput.INTERACT) && input.data.get(DefaultInput.INTERACT).value === BinaryValue.ON) {
            console.log('Interact with', interacts.focusedInteractive)
            interact(entity, null, delta, interacts.focusedInteractive)
          } else {
            // TODO: highlight or ... ?
          }
        }
      }
    })

  }

  static queries: any = {
    interactors: { components: [ Interacts ] },
    interactive: { components: [ Interactive ] },
  }
}