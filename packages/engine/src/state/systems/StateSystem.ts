import { LifecycleValue } from '../../common/enums/LifecycleValue';
import { Behavior } from '../../common/interfaces/Behavior';
import { NumericalType } from '../../common/types/NumericalTypes';
import { Entity } from '../../ecs/classes/Entity';
import { System } from '../../ecs/classes/System';
import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType';
import { State } from '../components/State';
import { StateValue } from '../interfaces/StateValue';

export class StateSystem extends System {
  updateType = SystemUpdateType.Fixed;
  private _state: State
  private readonly _args: any
  public execute (delta: number): void {
    this.queryResults.state.added?.forEach(entity => {
      // If stategroup has a default, add it to our state map
      this._state = getComponent(entity, State);
      if(this._state === undefined)
        return  console.warn("Tried to execute on a newly added input component, but it was undefined")
    });
    this.queryResults.state.all?.forEach(entity => {
      callBehaviors(entity, { phase: 'onUpdate' }, delta);
      // callBehaviors(entity, { phase: 'onLateUpdate' }, delta);
    });
  }
}

export const callBehaviors: Behavior = (entity: Entity, args: { phase: string }, delta: number) => {
  const _state = getComponent(entity, State);
  _state.data.forEach((stateValue: StateValue<NumericalType>) => {
    // Call actions on start of start (onEntry)
    if (stateValue.lifecycleState === LifecycleValue.STARTED &&
      _state.schema.states[stateValue.state] !== undefined){
        if(_state.schema.states[stateValue.state]['componentProperties'] !== undefined){
          _state.schema.states[stateValue.state]['componentProperties'].forEach(componentProp => {
            const component = getMutableComponent(entity, componentProp.component) as any;
            if(component === undefined) console.warn ("Component is undefined, check your state");
            else
            for (const prop in componentProp.properties){
              component[prop] = componentProp.properties[prop];
            }
        });
      }
        
      if(_state.schema.states[stateValue.state]['onEntry'] !== undefined) {
        _state.schema.states[stateValue.state]['onEntry'].forEach(stateBehavior => {
          stateBehavior.behavior(
          entity,
          stateBehavior.args,
          delta
        );}
        );
    }
  }
    // Call actions on update
    if (_state.schema.states[stateValue.state] !== undefined &&
      _state.schema.states[stateValue.state]['onUpdate'] !== undefined ) {
      if (stateValue.lifecycleState === LifecycleValue.STARTED) {
        _state.data.set(stateValue.state, {
          ...stateValue,
          lifecycleState: LifecycleValue.CONTINUED
        });
      }
      _state.schema.states[stateValue.state]['onUpdate'].forEach(stateBehavior =>
        stateBehavior.behavior(
        entity,
        stateBehavior.args,
        delta
      ));
    }
        // Call actions on start of end of state (onEntry)
        if (stateValue.lifecycleState === LifecycleValue.ENDED &&
          _state.schema.states[stateValue.state] !== undefined &&
          _state.schema.states[stateValue.state]['onExit'] !== undefined) {
            _state.schema.states[stateValue.state]['onExit'].forEach(stateBehavior =>
              stateBehavior.behavior(
              entity,
              stateBehavior.args,
              delta
            ));
            _state.data.delete(stateValue.state);
          }
      });
  };

StateSystem.queries = {
  state: {
    components: [State],
    listen: {
      added: true,
      changed: true,
      removed: true
    }
  }
};
