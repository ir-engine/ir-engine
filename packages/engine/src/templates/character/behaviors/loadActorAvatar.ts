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
      initializeCharacter(entity);
      const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
      tmpGroup.children.forEach(child => actor.modelContainer.add(child));
    }
  });
};