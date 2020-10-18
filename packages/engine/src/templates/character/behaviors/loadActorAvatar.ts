import { Behavior } from "../../../common/interfaces/Behavior";
import {
  addComponent,
  getComponent,
  getMutableComponent,
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

export const loadActorAvatar: Behavior = (entity) => {
  const avatarId:string = getComponent(entity, CharacterAvatarComponent)?.avatarId;
  if (!avatarId) {
    return;
  }
  const nextAvatarSrc = CharacterAvatars.find(avatarData => avatarData.id === avatarId)?.src;
  if (!nextAvatarSrc) {
    throw new Error("Avatar not found for id:" + String(avatarId));
  }
  
  removeComponent(entity, AssetLoader, true);
  removeComponent(entity, AssetLoaderState, true);

  const tmpGroup = new Group();
  addComponent(entity, AssetLoader, {
    //url: "models/avatars/" + nextAvatarSrc,
    url: nextAvatarSrc,
    receiveShadow: true,
    castShadow: true,
    parent: tmpGroup,
    onLoaded: (entity, args) => {
      // console.log('loaded new avatar model', args);

      const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);

      actor.mixer.stopAllAction();
      // forget that we have any animation playing
      actor.currentAnimationAction = null;

      // clear current avatar mesh
      ([ ...actor.modelContainer.children ])
        .forEach(child => actor.modelContainer.remove(child) );

      tmpGroup.children.forEach(child => actor.modelContainer.add(child));

      const stateComponent = getComponent(entity, State);
      // trigger all states to restart?
      stateComponent.data.forEach(data => data.lifecycleState = LifecycleValue.STARTED);
    }
  });
};