// @ts-nocheck

import EditorNodeMixin from "./EditorNodeMixin";
import Spline from "../../scene/classes/Spline";
import { Object3D } from "three";

export default class SplineNode extends EditorNodeMixin(Object3D) {
  static nodeName = "Spline";
  helper = null;
  // static async deserialize(editor, json) {
  //   const node = await super.deserialize(editor, json);
  //   const {
  //     color,
  //     intensity,
  //     range,
  //     castShadow,
  //     shadowMapResolution,
  //     shadowBias,
  //     shadowRadius
  //   } = json.components.find(c => c.name === "point-light").props;
  //   node.color.set(color);
  //   node.intensity = intensity;
  //   node.range = range;
  //   node.castShadow = castShadow;
  //   node.shadowBias = shadowBias || 0;
  //   node.shadowRadius = shadowRadius === undefined ? 1 : shadowRadius;
  //   if (shadowMapResolution) {
  //     node.shadowMapResolution.fromArray(shadowMapResolution);
  //   }
  //   return node;
  // }
  constructor(editor) {
    super(editor);
    this.helper = new Spline();

    super.add(this.helper);
  }
  onAdd() {
    this.helper.init(this.editor);
    let initialSplineHelperObjects = this.helper.getCurrentSplineHelperObjects();
    for (let index = 0; index < initialSplineHelperObjects.length; index++) {
      const object = initialSplineHelperObjects[index];
      this.addSplineHelperObjectToEditorNodes(object); 
    }
  }
  onChange() {
  }
  onSelect() {
  }
  onDeselect() {
  }
  onAddNodeToSpline() {
    const newSplineObject = this.helper.addPoint();
    
    this.addSplineHelperObjectToEditorNodes(newSplineObject);
  }
  addSplineHelperObjectToEditorNodes(splineHelperObject) {
    super.add(splineHelperObject);
    // Maybe this should not be done here?
    this.editor.nodes.push(splineHelperObject);
  }
  // copy(source, recursive = true) {
  //   super.copy(source, false);
  //   if (recursive) {
  //     this.remove(this.helper);
  //     for (let i = 0; i < source.children.length; i++) {
  //       const child = source.children[i];
  //       if (child === source.helper) {
  //         this.helper = new EditorPointLightHelper(this);
  //         this.add(this.helper);
  //       } else {
  //         this.add(child.clone());
  //       }
  //     }
  //   }
  //   return this;
  // }
  // serialize() {
  //   return super.serialize({
  //     "point-light": {
  //       color: this.color,
  //       intensity: this.intensity,
  //       range: this.range,
  //       castShadow: this.castShadow,
  //       shadowMapResolution: this.shadowMapResolution.toArray(),
  //       shadowBias: this.shadowBias,
  //       shadowRadius: this.shadowRadius
  //     }
  //   });
  // }
  // prepareForExport() {
  //   super.prepareForExport();
  //   this.remove(this.helper);
  //   this.addGLTFComponent("point-light", {
  //     color: this.color,
  //     intensity: this.intensity,
  //     range: this.range,
  //     castShadow: this.castShadow,
  //     shadowMapResolution: this.shadowMapResolution.toArray(),
  //     shadowBias: this.shadowBias,
  //     shadowRadius: this.shadowRadius
  //   });
  //   this.replaceObject();
  // }
}
