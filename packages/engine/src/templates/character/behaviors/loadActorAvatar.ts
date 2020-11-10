import { Group } from "three";
import { AssetLoader } from "../../../assets/components/AssetLoader";
import { AssetLoaderState } from "../../../assets/components/AssetLoaderState";
import { Behavior } from "../../../common/interfaces/Behavior";
import {
  addComponent,
  getComponent,
  getMutableComponent,
  hasComponent,
  removeComponent
} from "../../../ecs/functions/EntityFunctions";
import { CharacterAvatars } from "../CharacterAvatars";
import { CharacterAvatarComponent } from "../components/CharacterAvatarComponent";
import { CharacterComponent } from "../components/CharacterComponent";

export const loadActorAvatar: Behavior = (entity) => {
  console.log("Calling load actor avatar for ", entity.id)
  const avatarId: string = getComponent(entity, CharacterAvatarComponent)?.avatarId ?? "Andy";
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
      console.log("onLoaded fired on loadActorAvatrar for ", entity.id)
      const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
      tmpGroup.children.forEach(child => actor.modelContainer.add(child));
    }
  });
};