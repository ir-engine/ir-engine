import { Behavior } from "../../../common/interfaces/Behavior";
import {
  addComponent,
  getComponent,
  getMutableComponent,
  hasComponent,
  removeComponent
} from "../../../ecs/functions/EntityFunctions";
import { CharacterComponent } from "../components/CharacterComponent";
import { AssetLoader } from "../../../assets/components/AssetLoader";
import { AssetLoaderState } from "../../../assets/components/AssetLoaderState";
import { Group } from "three";
import { State } from "../../../state/components/State";
import { LifecycleValue } from "../../../common/enums/LifecycleValue";
import { CharacterAvatars } from "../CharacterAvatars";
import { CharacterAvatarComponent } from "../components/CharacterAvatarComponent";
import { initializeCharacter } from "./initializeCharacter";

export const loadActorAvatar: Behavior = (entity) => {
  const avatarId: string = getComponent(entity, CharacterAvatarComponent).avatarId ?? "Andy";
  const avatarSource = CharacterAvatars.find(avatarData => avatarData.id === avatarId)?.src;
  
  if(hasComponent(entity, AssetLoader)) removeComponent(entity, AssetLoader, true);
  if(hasComponent(entity, AssetLoaderState)) removeComponent(entity, AssetLoaderState, true);

  const tmpGroup = new Group();
  addComponent(entity, AssetLoader, {
    url: avatarSource,
    receiveShadow: true,
    castShadow: true,
    parent: tmpGroup,
    onLoaded: (entity, args) => {
      const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);

      initializeCharacter(entity);
      actor.mixer?.stopAllAction();
      
      // forget that we have any animation playing
      actor.currentAnimationAction = null;

      // clear current avatar mesh
      if(actor.modelContainer !== undefined)
        ([ ...actor.modelContainer.children ])
          .forEach(child => actor.modelContainer.remove(child));

      tmpGroup.children.forEach(child => actor.modelContainer.add(child));

      const stateComponent = getComponent(entity, State);
      // trigger all states to restart?
      stateComponent.data.forEach(data => data.lifecycleState = LifecycleValue.STARTED);
    }
  });
};