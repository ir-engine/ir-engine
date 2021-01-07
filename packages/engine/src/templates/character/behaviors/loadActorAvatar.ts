import { AnimationMixer, Group } from "three";
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
import { State } from "../../../state/components/State";
import { LifecycleValue } from "../../../common/enums/LifecycleValue";
import { NetworkObject } from "../../../networking/components/NetworkObject";
import { getPseudoRandomAvatarIdByUserId } from "../functions/pseudoRandomAvatar";

export const loadActorAvatar: Behavior = (entity) => {
  console.log("Calling load actor avatar for ", entity)

  // const ownerId = getComponent(entity, NetworkObject)?.ownerId;
  const avatarId: string = getComponent(entity, CharacterAvatarComponent)?.avatarId;
  // const avatarId: string = getComponent(entity, CharacterAvatarComponent)?.avatarId ?? "Andy";
  // const avatarId: string = ownerId ? getPseudoRandomAvatarIdByUserId(ownerId): getComponent(entity, CharacterAvatarComponent)?.avatarId ?? "Andy";
  const avatarSource = CharacterAvatars.find(avatarData => avatarData.id === avatarId)?.src;
  
  if(hasComponent(entity, AssetLoader)) removeComponent(entity, AssetLoader, true);
  if(hasComponent(entity, AssetLoaderState)) removeComponent(entity, AssetLoaderState, true);

  const tmpGroup = new Group();
  addComponent(entity, AssetLoader, {
    url: avatarSource,
    receiveShadow: true,
    castShadow: true,
    parent: tmpGroup,
  });
  const loader = getComponent(entity, AssetLoader);
  loader.onLoaded.push((entity, args) => {
    console.log("onLoaded fired on loadActorAvatar for ", entity.id)
    const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
    actor.mixer && actor.mixer.stopAllAction();
    // forget that we have any animation playing
    actor.currentAnimationAction = null;

    // clear current avatar mesh
    ([ ...actor.modelContainer.children ])
      .forEach(child => actor.modelContainer.remove(child) );

    tmpGroup.children.forEach(child => actor.modelContainer.add(child));

    actor.mixer = new AnimationMixer(actor.modelContainer.children[0]);
    actor.mixer.timeScale = actor.animationsTimeScale;

    const stateComponent = getComponent(entity, State);
    // trigger all states to restart?
    stateComponent.data.forEach(data => data.lifecycleState = LifecycleValue.STARTED);
  })
};