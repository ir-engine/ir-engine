import { Behavior } from "../../../common/interfaces/Behavior";
import { Entity } from "../../../ecs/classes/Entity";
import { Color, Mesh } from "three";
import { getComponent } from "../../../ecs/functions/EntityFunctions";
import { Object3DComponent } from "../../../common/components/Object3DComponent";

export const changeColor: Behavior = (entity: Entity, args: { materialName: string, color?: Color }): void => {
  const vehicle = getComponent(entity, Object3DComponent).value;
  let material;
  vehicle.traverse(child => {
    if (child instanceof Mesh) {
      if (child?.material?.name === args.materialName) {
        material = child.material;
      }
    }
  })
  if (material) {
    if (args.color) {
      material.color.copy(args.color)
    } else {
      material.color.setHSL(Math.random(), 1, 0.5);
    }
  }
};