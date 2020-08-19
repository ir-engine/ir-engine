import { Behavior } from '../../common/interfaces/Behavior';
import { transformBehavior } from '../behaviors/transformBehavior';
import { TransformComponent } from '../components/TransformComponent';
import { TransformParentComponent } from '../components/TransformParentComponent';
import { System, SystemAttributes } from '../../ecs/classes/System';

export class TransformSystem extends System {
  transformBehavior: Behavior
  childTransformBehavior: Behavior
  init (attributes: SystemAttributes) {
    if (attributes && attributes.transformBehavior) {
      this.transformBehavior = attributes.transformBehavior;
    } else {
      this.transformBehavior = transformBehavior;
    }
  }

  execute (delta) {
    this.queryResults.transforms.all?.forEach(t => {
      this.transformBehavior(t, {}, delta);
    });
  }
}

TransformSystem.queries = {
  parent: {
    components: [TransformParentComponent, TransformComponent],
    listen: {
      added: true
    }
  },
  transforms: {
    components: [TransformComponent],
    listen: {
      added: true,
      changed: true
    }
  }
};
