import { Material, Mesh, SkinnedMesh } from "three";
import { CharacterComponent } from "../components/CharacterComponent";

export const setVisible = (character: CharacterComponent, visible: boolean): void => {
  if(character.visible !== visible) {
    character.visible = visible;
    character.tiltContainer.traverse((obj) => {
      const mat = (obj as SkinnedMesh).material;
      if(mat) {
        (mat as Material).visible = visible;
      }
    });
  }
};