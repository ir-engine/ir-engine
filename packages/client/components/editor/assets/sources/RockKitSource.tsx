import KitSource from "../KitSource";
import { TransformPivot } from "@xr3ngine/engine/src/editor/controls/EditorControls";
export default class RockKitSource extends KitSource {
  transformPivot: string;
  name: string;
  id: string;
  constructor(api) {
    super(
      api,
      "https://assets-prod.reticulum.io/kits/rock/RocksKit_v2-f259c85a5e6091bd72eac7e2fdca177209613f1b.gltf"
    );
    this.id = "rock-kit";
    this.name = "Rock Kit";
    this.transformPivot = TransformPivot.Selection;
  }
}
