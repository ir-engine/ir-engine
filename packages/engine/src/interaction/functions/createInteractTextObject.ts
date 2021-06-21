import { ExtrudeGeometry, Group, Mesh, MeshBasicMaterial, Object3D } from "three";
import { isClient } from "../../common/functions/isClient";
import { FontManager } from "../../ui/classes/FontManager";

export const createInteractTextObject = (): Object3D => {

  if(!isClient) return new Group();
  
  const fontResolution = 120;

  const createText = (text, scale) => {
    const exitTextShapes = FontManager.instance._defaultFont.generateShapes(text, fontResolution);
    const geometry = new ExtrudeGeometry(exitTextShapes, { bevelEnabled: false });
    const invResolution = scale / fontResolution;
    geometry.scale(invResolution, invResolution * 0.8, 1 / fontResolution);
    geometry.computeBoundingBox();
    const xMid = - 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
    geometry.translate(xMid, 0, 1);
    return geometry;
  }

  const geometry = createText('Interact', 2.5);

  const textSize = 0.15;
  const text = new Mesh(geometry, new MeshBasicMaterial({ color: 0x000000 }))
  text.scale.setScalar(textSize)

  return text;
}