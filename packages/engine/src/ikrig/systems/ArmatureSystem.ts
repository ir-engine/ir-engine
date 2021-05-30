import { System } from "../../ecs/classes/System";
import { getMutableComponent } from "../../ecs/functions/EntityFunctions";
import { SystemUpdateType } from "../../ecs/functions/SystemUpdateType";
import Armature from "../components/Armature";

export class ArmatureSystem extends System {

  updateType = SystemUpdateType.Fixed;

  execute(delta: number, time: number): void {
    this.queryResults.armatures.changed?.forEach(e => {
        const a = getMutableComponent(e, Armature);
        if( a.updated ) a.updated = false;
  })
}

  static queries: any = {
    armatures: {
      components: [Armature],
      listen: {
        added: true,
        removed: true
      }
    }
  }
}