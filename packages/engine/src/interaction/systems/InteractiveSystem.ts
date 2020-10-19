import { System, SystemAttributes } from "../../ecs/classes/System";
import { Interactive } from "../components/Interactive";
import { Interacts } from "../components/Interacts";
import { interactRaycast } from "../behaviors/interactRaycast";
import { interact } from "../behaviors/interact";
import { addComponent, getComponent, hasComponent, removeComponent } from "../../ecs/functions/EntityFunctions";
import { Input } from "../../input/components/Input";
import { DefaultInput } from "../../templates/shared/DefaultInput";
import { BinaryValue } from "../../common/enums/BinaryValue";
import { InteractiveFocused } from "../components/InteractiveFocused";
import { Entity } from "../../ecs/classes/Entity";
import { interactFocused } from "../behaviors/interactFocused";

export class InteractiveSystem extends System {
  /**
   * Elements that was in focused state on last execution
   */
  focused: Set<Entity>
  /**
   * Elements that are focused on current execution
   */
  newFocused: Set<Entity>

  constructor(attributes?: SystemAttributes) {
    super(attributes);

    this.focused = new Set();
    this.newFocused = new Set();
  }

  dispose(): void {
    super.dispose();
    this.focused?.clear();
    this.newFocused?.clear();
  }

  execute(delta: number, time: number): void {
    this.newFocused.clear();

    this.queryResults.interactors?.all.forEach(entity => {
      if (this.queryResults.interactive?.all.length) {
        interactRaycast(entity, { interactive: this.queryResults.interactive.all });

        const interacts = getComponent(entity, Interacts);
        if (interacts.focusedInteractive) {
          this.newFocused.add(interacts.focusedInteractive);
          // TODO: can someone else focus object? should we update 'interacts' entity
          if (!hasComponent(interacts.focusedInteractive, InteractiveFocused)) {
            addComponent(interacts.focusedInteractive, InteractiveFocused, {interacts: entity});
          }
        }

        // unmark all unfocused
        this.queryResults.interactive?.all.forEach(entity => {
          if (entity !== interacts.focusedInteractive) {
            removeComponent(entity, InteractiveFocused);
          }
        });
      }
    });

    this.queryResults.focus.added?.forEach(entity => {
      interactFocused(entity, null, delta);
    });
    this.queryResults.focus.removed?.forEach(entity => {
      interactFocused(entity, null, delta);
    });

    this.focused.clear();
    this.newFocused.forEach(e => this.focused.add(e) );
  }

  static queries: any = {
    interactors: { components: [ Interacts ] },
    interactive: { components: [ Interactive ] },
    focus: {
      components: [ Interactive, InteractiveFocused ],
      listen: {
        added: true,
        removed: true
      }
    },
  }
}