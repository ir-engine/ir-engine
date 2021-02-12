import { getComponent } from "../../../ecs/functions/EntityFunctions";
import { InteractionCheckHandler } from "../../../interaction/types/InteractionTypes";
import { Interactable } from "../../../interaction/components/Interactable";
import { Interactor } from "../../../interaction/components/Interactor";
import { VehicleBody } from "../../../physics/components/VehicleBody";
import { isClient } from "../../../common/functions/isClient";
import { CharacterComponent } from "../../../templates/character/components/CharacterComponent";

export const getInCarPossible: InteractionCheckHandler = (possibleDriverEntity, carEntity, focusedPart = 0) => {

  const vehicle = getComponent(carEntity, VehicleBody);
  //interactable.currentFocusedPart
  // TODO: add some sort of seats system and check available empty seats

  return vehicle && !vehicle[vehicle.seatPlane[focusedPart]];
};
