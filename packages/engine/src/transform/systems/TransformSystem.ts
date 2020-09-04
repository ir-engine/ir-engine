import { transformBehavior } from '../behaviors/transformBehavior';
import { transformParentBehavior } from '../behaviors/transformParentBehavior';
import { TransformComponent } from '../components/TransformComponent';
import { TransformParentComponent } from '../components/TransformParentComponent';
import { System, SystemAttributes } from '../../ecs/classes/System';
import { hasComponent } from "../../ecs/functions/EntityFunctions";

export class TransformSystem extends System {
  execute (delta) {
    this.queryResults.transforms.all?.forEach(entity => {
      transformBehavior(entity, {}, delta);
    });

    this.queryResults.parent.all?.forEach(entity => {
      if (!hasComponent(entity, TransformParentComponent)) {
        return;
      }
      transformParentBehavior(entity, {}, delta);
    });
  }
}

TransformSystem.queries = {
  parent: {
    components: [TransformParentComponent, TransformComponent],
    // listen: {
    //   added: true
    // }
  },
  transforms: {
    components: [TransformComponent],
    listen: {
      added: true,
      changed: true
    }
  }
};
