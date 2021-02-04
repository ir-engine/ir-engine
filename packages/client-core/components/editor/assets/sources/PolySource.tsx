import ModelMediaSource from "../ModelMediaSource";
import { TransformPivot } from "@xr3ngine/engine/src/editor/controls/EditorControls";
export default class PolySource extends ModelMediaSource {
  tags: { label: string; value: string }[];
  searchLegalCopy: string;
  privacyPolicyUrl: string;
  transformPivot: any;
  constructor(api) {
    super(api);
    this.id = "poly";
    this.name = "Google Poly";
    this.tags = [
      { label: "Featured", value: "" },
      { label: "Animals", value: "animals" },
      { label: "Architecture", value: "architecture" },
      { label: "Art", value: "art" },
      { label: "Food", value: "food" },
      { label: "Nature", value: "nature" },
      { label: "Objects", value: "objects" },
      { label: "People", value: "people" },
      { label: "Scenes", value: "scenes" },
      { label: "Transport", value: "transport" }
    ];
    this.searchLegalCopy = "Search by Google";
    this.privacyPolicyUrl = "https://policies.google.com/privacy";
    this.transformPivot = TransformPivot.Bottom;
  }
}
