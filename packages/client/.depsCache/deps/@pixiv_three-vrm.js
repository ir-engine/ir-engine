import {
  AxesHelper,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  DynamicDrawUsage,
  Euler,
  GLBufferAttribute,
  Group,
  ImageLoader,
  Line,
  LineBasicMaterial,
  LineSegments,
  LinearEncoding,
  MathUtils,
  Matrix3,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Quaternion,
  REVISION,
  RGBAFormat,
  ShaderMaterial,
  Skeleton,
  SkinnedMesh,
  TangentSpaceNormalMap,
  UniformsLib,
  UniformsUtils,
  UnsignedByteType,
  Vector2,
  Vector3,
  sRGBEncoding
} from "./chunk-FQAJRN7P.js";
import "./chunk-TFWDKVI3.js";

// ../../node_modules/@pixiv/three-vrm/lib/three-vrm.module.js
var VRMExpression = class extends Object3D {
  constructor(expressionName) {
    super();
    this.weight = 0;
    this.isBinary = false;
    this.overrideBlink = "none";
    this.overrideLookAt = "none";
    this.overrideMouth = "none";
    this._binds = [];
    this.name = `VRMExpression_${expressionName}`;
    this.expressionName = expressionName;
    this.type = "VRMExpression";
    this.visible = false;
  }
  /**
   * A value represents how much it should override blink expressions.
   * `0.0` == no override at all, `1.0` == completely block the expressions.
   */
  get overrideBlinkAmount() {
    if (this.overrideBlink === "block") {
      return 0 < this.weight ? 1 : 0;
    } else if (this.overrideBlink === "blend") {
      return this.weight;
    } else {
      return 0;
    }
  }
  /**
   * A value represents how much it should override lookAt expressions.
   * `0.0` == no override at all, `1.0` == completely block the expressions.
   */
  get overrideLookAtAmount() {
    if (this.overrideLookAt === "block") {
      return 0 < this.weight ? 1 : 0;
    } else if (this.overrideLookAt === "blend") {
      return this.weight;
    } else {
      return 0;
    }
  }
  /**
   * A value represents how much it should override mouth expressions.
   * `0.0` == no override at all, `1.0` == completely block the expressions.
   */
  get overrideMouthAmount() {
    if (this.overrideMouth === "block") {
      return 0 < this.weight ? 1 : 0;
    } else if (this.overrideMouth === "blend") {
      return this.weight;
    } else {
      return 0;
    }
  }
  addBind(bind) {
    this._binds.push(bind);
  }
  /**
   * Apply weight to every assigned blend shapes.
   * Should be called every frame.
   */
  applyWeight(options) {
    var _a;
    let actualWeight = this.isBinary ? this.weight <= 0.5 ? 0 : 1 : this.weight;
    actualWeight *= (_a = options === null || options === void 0 ? void 0 : options.multiplier) !== null && _a !== void 0 ? _a : 1;
    this._binds.forEach((bind) => bind.applyWeight(actualWeight));
  }
  /**
   * Clear previously assigned blend shapes.
   */
  clearAppliedWeight() {
    this._binds.forEach((bind) => bind.clearAppliedWeight());
  }
};
function __awaiter$6(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
function extractPrimitivesInternal(gltf, nodeIndex, node) {
  var _a, _b;
  const json = gltf.parser.json;
  const schemaNode = (_a = json.nodes) === null || _a === void 0 ? void 0 : _a[nodeIndex];
  if (schemaNode == null) {
    console.warn(`extractPrimitivesInternal: Attempt to use nodes[${nodeIndex}] of glTF but the node doesn't exist`);
    return null;
  }
  const meshIndex = schemaNode.mesh;
  if (meshIndex == null) {
    return null;
  }
  const schemaMesh = (_b = json.meshes) === null || _b === void 0 ? void 0 : _b[meshIndex];
  if (schemaMesh == null) {
    console.warn(`extractPrimitivesInternal: Attempt to use meshes[${meshIndex}] of glTF but the mesh doesn't exist`);
    return null;
  }
  const primitiveCount = schemaMesh.primitives.length;
  const primitives = [];
  node.traverse((object) => {
    if (primitives.length < primitiveCount) {
      if (object.isMesh) {
        primitives.push(object);
      }
    }
  });
  return primitives;
}
function gltfExtractPrimitivesFromNode(gltf, nodeIndex) {
  return __awaiter$6(this, void 0, void 0, function* () {
    const node = yield gltf.parser.getDependency("node", nodeIndex);
    return extractPrimitivesInternal(gltf, nodeIndex, node);
  });
}
function gltfExtractPrimitivesFromNodes(gltf) {
  return __awaiter$6(this, void 0, void 0, function* () {
    const nodes = yield gltf.parser.getDependencies("node");
    const map = /* @__PURE__ */ new Map();
    nodes.forEach((node, index) => {
      const result = extractPrimitivesInternal(gltf, index, node);
      if (result != null) {
        map.set(index, result);
      }
    });
    return map;
  });
}
function gltfGetAssociatedMaterialIndex(parser, material) {
  var _a, _b;
  const threeRevision = parseInt(REVISION, 10);
  let index = null;
  if (threeRevision >= 133) {
    index = (_b = (_a = parser.associations.get(material)) === null || _a === void 0 ? void 0 : _a.materials) !== null && _b !== void 0 ? _b : null;
  } else {
    const associations = parser.associations;
    const reference = associations.get(material);
    if ((reference === null || reference === void 0 ? void 0 : reference.type) === "materials") {
      index = reference.index;
    }
  }
  return index;
}
var VRMExpressionPresetName = {
  Aa: "aa",
  Ih: "ih",
  Ou: "ou",
  Ee: "ee",
  Oh: "oh",
  Blink: "blink",
  Happy: "happy",
  Angry: "angry",
  Sad: "sad",
  Relaxed: "relaxed",
  LookUp: "lookUp",
  Surprised: "surprised",
  LookDown: "lookDown",
  LookLeft: "lookLeft",
  LookRight: "lookRight",
  BlinkLeft: "blinkLeft",
  BlinkRight: "blinkRight",
  Neutral: "neutral"
};
function saturate(value) {
  return Math.max(Math.min(value, 1), 0);
}
var VRMExpressionManager = class {
  /**
   * Create a new {@link VRMExpressionManager}.
   */
  constructor() {
    this.blinkExpressionNames = ["blink", "blinkLeft", "blinkRight"];
    this.lookAtExpressionNames = ["lookLeft", "lookRight", "lookUp", "lookDown"];
    this.mouthExpressionNames = ["aa", "ee", "ih", "oh", "ou"];
    this._expressions = [];
    this._expressionMap = {};
  }
  get expressions() {
    return this._expressions.concat();
  }
  get expressionMap() {
    return Object.assign({}, this._expressionMap);
  }
  /**
   * A map from name to expression, but excluding custom expressions.
   */
  get presetExpressionMap() {
    const result = {};
    const presetNameSet = new Set(Object.values(VRMExpressionPresetName));
    Object.entries(this._expressionMap).forEach(([name, expression]) => {
      if (presetNameSet.has(name)) {
        result[name] = expression;
      }
    });
    return result;
  }
  /**
   * A map from name to expression, but excluding preset expressions.
   */
  get customExpressionMap() {
    const result = {};
    const presetNameSet = new Set(Object.values(VRMExpressionPresetName));
    Object.entries(this._expressionMap).forEach(([name, expression]) => {
      if (!presetNameSet.has(name)) {
        result[name] = expression;
      }
    });
    return result;
  }
  /**
   * Copy the given {@link VRMExpressionManager} into this one.
   * @param source The {@link VRMExpressionManager} you want to copy
   * @returns this
   */
  copy(source) {
    const expressions = this._expressions.concat();
    expressions.forEach((expression) => {
      this.unregisterExpression(expression);
    });
    source._expressions.forEach((expression) => {
      this.registerExpression(expression);
    });
    this.blinkExpressionNames = source.blinkExpressionNames.concat();
    this.lookAtExpressionNames = source.lookAtExpressionNames.concat();
    this.mouthExpressionNames = source.mouthExpressionNames.concat();
    return this;
  }
  /**
   * Returns a clone of this {@link VRMExpressionManager}.
   * @returns Copied {@link VRMExpressionManager}
   */
  clone() {
    return new VRMExpressionManager().copy(this);
  }
  /**
   * Return a registered expression.
   * If it cannot find an expression, it will return `null` instead.
   *
   * @param name Name or preset name of the expression
   */
  getExpression(name) {
    var _a;
    return (_a = this._expressionMap[name]) !== null && _a !== void 0 ? _a : null;
  }
  /**
   * Register an expression.
   *
   * @param expression {@link VRMExpression} that describes the expression
   */
  registerExpression(expression) {
    this._expressions.push(expression);
    this._expressionMap[expression.expressionName] = expression;
  }
  /**
   * Unregister an expression.
   *
   * @param expression The expression you want to unregister
   */
  unregisterExpression(expression) {
    const index = this._expressions.indexOf(expression);
    if (index === -1) {
      console.warn("VRMExpressionManager: The specified expressions is not registered");
    }
    this._expressions.splice(index, 1);
    delete this._expressionMap[expression.expressionName];
  }
  /**
   * Get the current weight of the specified expression.
   * If it doesn't have an expression of given name, it will return `null` instead.
   *
   * @param name Name of the expression
   */
  getValue(name) {
    var _a;
    const expression = this.getExpression(name);
    return (_a = expression === null || expression === void 0 ? void 0 : expression.weight) !== null && _a !== void 0 ? _a : null;
  }
  /**
   * Set a weight to the specified expression.
   *
   * @param name Name of the expression
   * @param weight Weight
   */
  setValue(name, weight) {
    const expression = this.getExpression(name);
    if (expression) {
      expression.weight = saturate(weight);
    }
  }
  /**
   * Get a track name of specified expression.
   * This track name is needed to manipulate its expression via keyframe animations.
   *
   * @example Manipulate an expression using keyframe animation
   * ```js
   * const trackName = vrm.expressionManager.getExpressionTrackName( 'blink' );
   * const track = new THREE.NumberKeyframeTrack(
   *   name,
   *   [ 0.0, 0.5, 1.0 ], // times
   *   [ 0.0, 1.0, 0.0 ] // values
   * );
   *
   * const clip = new THREE.AnimationClip(
   *   'blink', // name
   *   1.0, // duration
   *   [ track ] // tracks
   * );
   *
   * const mixer = new THREE.AnimationMixer( vrm.scene );
   * const action = mixer.clipAction( clip );
   * action.play();
   * ```
   *
   * @param name Name of the expression
   */
  getExpressionTrackName(name) {
    const expression = this.getExpression(name);
    return expression ? `${expression.name}.weight` : null;
  }
  /**
   * Update every expressions.
   */
  update() {
    const weightMultipliers = this._calculateWeightMultipliers();
    this._expressions.forEach((expression) => {
      expression.clearAppliedWeight();
    });
    this._expressions.forEach((expression) => {
      let multiplier = 1;
      const name = expression.expressionName;
      if (this.blinkExpressionNames.indexOf(name) !== -1) {
        multiplier *= weightMultipliers.blink;
      }
      if (this.lookAtExpressionNames.indexOf(name) !== -1) {
        multiplier *= weightMultipliers.lookAt;
      }
      if (this.mouthExpressionNames.indexOf(name) !== -1) {
        multiplier *= weightMultipliers.mouth;
      }
      expression.applyWeight({ multiplier });
    });
  }
  /**
   * Calculate sum of override amounts to see how much we should multiply weights of certain expressions.
   */
  _calculateWeightMultipliers() {
    let blink = 1;
    let lookAt = 1;
    let mouth = 1;
    this._expressions.forEach((expression) => {
      blink -= expression.overrideBlinkAmount;
      lookAt -= expression.overrideLookAtAmount;
      mouth -= expression.overrideMouthAmount;
    });
    blink = Math.max(0, blink);
    lookAt = Math.max(0, lookAt);
    mouth = Math.max(0, mouth);
    return { blink, lookAt, mouth };
  }
};
var VRMExpressionMaterialColorType = {
  Color: "color",
  EmissionColor: "emissionColor",
  ShadeColor: "shadeColor",
  MatcapColor: "matcapColor",
  RimColor: "rimColor",
  OutlineColor: "outlineColor"
};
var v0ExpressionMaterialColorMap = {
  _Color: VRMExpressionMaterialColorType.Color,
  _EmissionColor: VRMExpressionMaterialColorType.EmissionColor,
  _ShadeColor: VRMExpressionMaterialColorType.ShadeColor,
  _RimColor: VRMExpressionMaterialColorType.RimColor,
  _OutlineColor: VRMExpressionMaterialColorType.OutlineColor
};
var _color = new Color();
var VRMExpressionMaterialColorBind = class {
  constructor({ material, type, targetValue }) {
    var _a, _b, _c;
    this.material = material;
    this.type = type;
    this.targetValue = targetValue;
    const propertyNameMap = (_a = Object.entries(VRMExpressionMaterialColorBind._propertyNameMapMap).find(([distinguisher]) => {
      return material[distinguisher] === true;
    })) === null || _a === void 0 ? void 0 : _a[1];
    const propertyName = (_b = propertyNameMap === null || propertyNameMap === void 0 ? void 0 : propertyNameMap[type]) !== null && _b !== void 0 ? _b : null;
    if (propertyName == null) {
      console.warn(`Tried to add a material color bind to the material ${(_c = material.name) !== null && _c !== void 0 ? _c : "(no name)"}, the type ${type} but the material or the type is not supported.`);
      this._state = null;
    } else {
      const target = material[propertyName];
      const initialValue = target.clone();
      const deltaValue = new Color(targetValue.r - initialValue.r, targetValue.g - initialValue.g, targetValue.b - initialValue.b);
      this._state = {
        propertyName,
        initialValue,
        deltaValue
      };
    }
  }
  applyWeight(weight) {
    if (this._state == null) {
      return;
    }
    const { propertyName, deltaValue } = this._state;
    const target = this.material[propertyName];
    if (target === void 0) {
      return;
    }
    target.add(_color.copy(deltaValue).multiplyScalar(weight));
    if (typeof this.material.shouldApplyUniforms === "boolean") {
      this.material.shouldApplyUniforms = true;
    }
  }
  clearAppliedWeight() {
    if (this._state == null) {
      return;
    }
    const { propertyName, initialValue } = this._state;
    const target = this.material[propertyName];
    if (target === void 0) {
      return;
    }
    target.copy(initialValue);
    if (typeof this.material.shouldApplyUniforms === "boolean") {
      this.material.shouldApplyUniforms = true;
    }
  }
};
VRMExpressionMaterialColorBind._propertyNameMapMap = {
  isMeshStandardMaterial: {
    color: "color",
    emissionColor: "emissive"
  },
  isMeshBasicMaterial: {
    color: "color"
  },
  isMToonMaterial: {
    color: "color",
    emissionColor: "emissive",
    outlineColor: "outlineColorFactor",
    matcapColor: "matcapFactor",
    rimColor: "parametricRimColorFactor",
    shadeColor: "shadeColorFactor"
  }
};
var VRMExpressionMorphTargetBind = class {
  constructor({ primitives, index, weight }) {
    this.primitives = primitives;
    this.index = index;
    this.weight = weight;
  }
  applyWeight(weight) {
    this.primitives.forEach((mesh) => {
      var _a;
      if (((_a = mesh.morphTargetInfluences) === null || _a === void 0 ? void 0 : _a[this.index]) != null) {
        mesh.morphTargetInfluences[this.index] += this.weight * weight;
      }
    });
  }
  clearAppliedWeight() {
    this.primitives.forEach((mesh) => {
      var _a;
      if (((_a = mesh.morphTargetInfluences) === null || _a === void 0 ? void 0 : _a[this.index]) != null) {
        mesh.morphTargetInfluences[this.index] = 0;
      }
    });
  }
};
var _v2 = new Vector2();
var VRMExpressionTextureTransformBind = class {
  constructor({ material, scale, offset }) {
    var _a, _b;
    this.material = material;
    this.scale = scale;
    this.offset = offset;
    const propertyNames = (_a = Object.entries(VRMExpressionTextureTransformBind._propertyNamesMap).find(([distinguisher]) => {
      return material[distinguisher] === true;
    })) === null || _a === void 0 ? void 0 : _a[1];
    if (propertyNames == null) {
      console.warn(`Tried to add a texture transform bind to the material ${(_b = material.name) !== null && _b !== void 0 ? _b : "(no name)"} but the material is not supported.`);
      this._properties = [];
    } else {
      this._properties = [];
      propertyNames.forEach((propertyName) => {
        var _a2;
        const texture = (_a2 = material[propertyName]) === null || _a2 === void 0 ? void 0 : _a2.clone();
        if (!texture) {
          return null;
        }
        material[propertyName] = texture;
        const initialOffset = texture.offset.clone();
        const initialScale = texture.repeat.clone();
        const deltaOffset = offset.clone().sub(initialOffset);
        const deltaScale = scale.clone().sub(initialScale);
        this._properties.push({
          name: propertyName,
          initialOffset,
          deltaOffset,
          initialScale,
          deltaScale
        });
      });
    }
  }
  applyWeight(weight) {
    this._properties.forEach((property) => {
      const target = this.material[property.name];
      if (target === void 0) {
        return;
      }
      target.offset.add(_v2.copy(property.deltaOffset).multiplyScalar(weight));
      target.repeat.add(_v2.copy(property.deltaScale).multiplyScalar(weight));
      target.needsUpdate = true;
    });
  }
  clearAppliedWeight() {
    this._properties.forEach((property) => {
      const target = this.material[property.name];
      if (target === void 0) {
        return;
      }
      target.offset.copy(property.initialOffset);
      target.repeat.copy(property.initialScale);
      target.needsUpdate = true;
    });
  }
};
VRMExpressionTextureTransformBind._propertyNamesMap = {
  isMeshStandardMaterial: [
    "map",
    "emissiveMap",
    "bumpMap",
    "normalMap",
    "displacementMap",
    "roughnessMap",
    "metalnessMap",
    "alphaMap"
  ],
  isMeshBasicMaterial: ["map", "specularMap", "alphaMap"],
  isMToonMaterial: [
    "map",
    "normalMap",
    "emissiveMap",
    "shadeMultiplyTexture",
    "rimMultiplyTexture",
    "outlineWidthMultiplyTexture",
    "uvAnimationMaskTexture"
  ]
};
var POSSIBLE_SPEC_VERSIONS$4 = /* @__PURE__ */ new Set(["1.0", "1.0-beta"]);
var VRMExpressionLoaderPlugin = class {
  constructor(parser) {
    this.parser = parser;
  }
  get name() {
    return "VRMExpressionLoaderPlugin";
  }
  afterRoot(gltf) {
    return __awaiter$6(this, void 0, void 0, function* () {
      gltf.userData.vrmExpressionManager = yield this._import(gltf);
    });
  }
  /**
   * Import a {@link VRMExpressionManager} from a VRM.
   *
   * @param gltf A parsed result of GLTF taken from GLTFLoader
   */
  _import(gltf) {
    return __awaiter$6(this, void 0, void 0, function* () {
      const v1Result = yield this._v1Import(gltf);
      if (v1Result) {
        return v1Result;
      }
      const v0Result = yield this._v0Import(gltf);
      if (v0Result) {
        return v0Result;
      }
      return null;
    });
  }
  _v1Import(gltf) {
    var _a, _b;
    return __awaiter$6(this, void 0, void 0, function* () {
      const json = this.parser.json;
      const isVRMUsed = ((_a = json.extensionsUsed) === null || _a === void 0 ? void 0 : _a.indexOf("VRMC_vrm")) !== -1;
      if (!isVRMUsed) {
        return null;
      }
      const extension = (_b = json.extensions) === null || _b === void 0 ? void 0 : _b["VRMC_vrm"];
      if (!extension) {
        return null;
      }
      const specVersion = extension.specVersion;
      if (!POSSIBLE_SPEC_VERSIONS$4.has(specVersion)) {
        console.warn(`VRMExpressionLoaderPlugin: Unknown VRMC_vrm specVersion "${specVersion}"`);
        return null;
      }
      const schemaExpressions = extension.expressions;
      if (!schemaExpressions) {
        return null;
      }
      const presetNameSet = new Set(Object.values(VRMExpressionPresetName));
      const nameSchemaExpressionMap = /* @__PURE__ */ new Map();
      if (schemaExpressions.preset != null) {
        Object.entries(schemaExpressions.preset).forEach(([name, schemaExpression]) => {
          if (schemaExpression == null) {
            return;
          }
          if (!presetNameSet.has(name)) {
            console.warn(`VRMExpressionLoaderPlugin: Unknown preset name "${name}" detected. Ignoring the expression`);
            return;
          }
          nameSchemaExpressionMap.set(name, schemaExpression);
        });
      }
      if (schemaExpressions.custom != null) {
        Object.entries(schemaExpressions.custom).forEach(([name, schemaExpression]) => {
          if (presetNameSet.has(name)) {
            console.warn(`VRMExpressionLoaderPlugin: Custom expression cannot have preset name "${name}". Ignoring the expression`);
            return;
          }
          nameSchemaExpressionMap.set(name, schemaExpression);
        });
      }
      const manager = new VRMExpressionManager();
      yield Promise.all(Array.from(nameSchemaExpressionMap.entries()).map(([name, schemaExpression]) => __awaiter$6(this, void 0, void 0, function* () {
        var _c, _d, _e, _f, _g, _h, _j;
        const expression = new VRMExpression(name);
        gltf.scene.add(expression);
        expression.isBinary = (_c = schemaExpression.isBinary) !== null && _c !== void 0 ? _c : false;
        expression.overrideBlink = (_d = schemaExpression.overrideBlink) !== null && _d !== void 0 ? _d : "none";
        expression.overrideLookAt = (_e = schemaExpression.overrideLookAt) !== null && _e !== void 0 ? _e : "none";
        expression.overrideMouth = (_f = schemaExpression.overrideMouth) !== null && _f !== void 0 ? _f : "none";
        (_g = schemaExpression.morphTargetBinds) === null || _g === void 0 ? void 0 : _g.forEach((bind) => __awaiter$6(this, void 0, void 0, function* () {
          var _k;
          if (bind.node === void 0 || bind.index === void 0) {
            return;
          }
          const primitives = yield gltfExtractPrimitivesFromNode(gltf, bind.node);
          const morphTargetIndex = bind.index;
          if (!primitives.every((primitive) => Array.isArray(primitive.morphTargetInfluences) && morphTargetIndex < primitive.morphTargetInfluences.length)) {
            console.warn(`VRMExpressionLoaderPlugin: ${schemaExpression.name} attempts to index morph #${morphTargetIndex} but not found.`);
            return;
          }
          expression.addBind(new VRMExpressionMorphTargetBind({
            primitives,
            index: morphTargetIndex,
            weight: (_k = bind.weight) !== null && _k !== void 0 ? _k : 1
          }));
        }));
        if (schemaExpression.materialColorBinds || schemaExpression.textureTransformBinds) {
          const gltfMaterials = [];
          gltf.scene.traverse((object) => {
            const material = object.material;
            if (material) {
              gltfMaterials.push(material);
            }
          });
          (_h = schemaExpression.materialColorBinds) === null || _h === void 0 ? void 0 : _h.forEach((bind) => __awaiter$6(this, void 0, void 0, function* () {
            const materials = gltfMaterials.filter((material) => {
              const materialIndex = gltfGetAssociatedMaterialIndex(this.parser, material);
              return bind.material === materialIndex;
            });
            materials.forEach((material) => {
              expression.addBind(new VRMExpressionMaterialColorBind({
                material,
                type: bind.type,
                targetValue: new Color().fromArray(bind.targetValue)
              }));
            });
          }));
          (_j = schemaExpression.textureTransformBinds) === null || _j === void 0 ? void 0 : _j.forEach((bind) => __awaiter$6(this, void 0, void 0, function* () {
            const materials = gltfMaterials.filter((material) => {
              const materialIndex = gltfGetAssociatedMaterialIndex(this.parser, material);
              return bind.material === materialIndex;
            });
            materials.forEach((material) => {
              var _a2, _b2;
              expression.addBind(new VRMExpressionTextureTransformBind({
                material,
                offset: new Vector2().fromArray((_a2 = bind.offset) !== null && _a2 !== void 0 ? _a2 : [0, 0]),
                scale: new Vector2().fromArray((_b2 = bind.scale) !== null && _b2 !== void 0 ? _b2 : [1, 1])
              }));
            });
          }));
        }
        manager.registerExpression(expression);
      })));
      return manager;
    });
  }
  _v0Import(gltf) {
    var _a;
    return __awaiter$6(this, void 0, void 0, function* () {
      const json = this.parser.json;
      const vrmExt = (_a = json.extensions) === null || _a === void 0 ? void 0 : _a.VRM;
      if (!vrmExt) {
        return null;
      }
      const schemaBlendShape = vrmExt.blendShapeMaster;
      if (!schemaBlendShape) {
        return null;
      }
      const manager = new VRMExpressionManager();
      const schemaBlendShapeGroups = schemaBlendShape.blendShapeGroups;
      if (!schemaBlendShapeGroups) {
        return manager;
      }
      const blendShapeNameSet = /* @__PURE__ */ new Set();
      yield Promise.all(schemaBlendShapeGroups.map((schemaGroup) => __awaiter$6(this, void 0, void 0, function* () {
        var _b;
        const v0PresetName = schemaGroup.presetName;
        const v1PresetName = v0PresetName != null && VRMExpressionLoaderPlugin.v0v1PresetNameMap[v0PresetName] || null;
        const name = v1PresetName !== null && v1PresetName !== void 0 ? v1PresetName : schemaGroup.name;
        if (name == null) {
          console.warn("VRMExpressionLoaderPlugin: One of custom expressions has no name. Ignoring the expression");
          return;
        }
        if (blendShapeNameSet.has(name)) {
          console.warn(`VRMExpressionLoaderPlugin: An expression preset ${v0PresetName} has duplicated entries. Ignoring the expression`);
          return;
        }
        blendShapeNameSet.add(name);
        const expression = new VRMExpression(name);
        gltf.scene.add(expression);
        expression.isBinary = (_b = schemaGroup.isBinary) !== null && _b !== void 0 ? _b : false;
        if (schemaGroup.binds) {
          schemaGroup.binds.forEach((bind) => __awaiter$6(this, void 0, void 0, function* () {
            var _c;
            if (bind.mesh === void 0 || bind.index === void 0) {
              return;
            }
            const nodesUsingMesh = [];
            (_c = json.nodes) === null || _c === void 0 ? void 0 : _c.forEach((node, i) => {
              if (node.mesh === bind.mesh) {
                nodesUsingMesh.push(i);
              }
            });
            const morphTargetIndex = bind.index;
            yield Promise.all(nodesUsingMesh.map((nodeIndex) => __awaiter$6(this, void 0, void 0, function* () {
              var _d;
              const primitives = yield gltfExtractPrimitivesFromNode(gltf, nodeIndex);
              if (!primitives.every((primitive) => Array.isArray(primitive.morphTargetInfluences) && morphTargetIndex < primitive.morphTargetInfluences.length)) {
                console.warn(`VRMExpressionLoaderPlugin: ${schemaGroup.name} attempts to index ${morphTargetIndex}th morph but not found.`);
                return;
              }
              expression.addBind(new VRMExpressionMorphTargetBind({
                primitives,
                index: morphTargetIndex,
                weight: 0.01 * ((_d = bind.weight) !== null && _d !== void 0 ? _d : 100)
              }));
            })));
          }));
        }
        const materialValues = schemaGroup.materialValues;
        if (materialValues && materialValues.length !== 0) {
          materialValues.forEach((materialValue) => {
            if (materialValue.materialName === void 0 || materialValue.propertyName === void 0 || materialValue.targetValue === void 0) {
              return;
            }
            const materials = [];
            gltf.scene.traverse((object) => {
              if (object.material) {
                const material = object.material;
                if (Array.isArray(material)) {
                  materials.push(...material.filter((mtl) => (mtl.name === materialValue.materialName || mtl.name === materialValue.materialName + " (Outline)") && materials.indexOf(mtl) === -1));
                } else if (material.name === materialValue.materialName && materials.indexOf(material) === -1) {
                  materials.push(material);
                }
              }
            });
            const materialPropertyName = materialValue.propertyName;
            materials.forEach((material) => {
              if (materialPropertyName === "_MainTex_ST") {
                const scale = new Vector2(materialValue.targetValue[0], materialValue.targetValue[1]);
                const offset = new Vector2(materialValue.targetValue[2], materialValue.targetValue[3]);
                expression.addBind(new VRMExpressionTextureTransformBind({
                  material,
                  scale,
                  offset
                }));
                return;
              }
              const materialColorType = v0ExpressionMaterialColorMap[materialPropertyName];
              if (materialColorType) {
                expression.addBind(new VRMExpressionMaterialColorBind({
                  material,
                  type: materialColorType,
                  targetValue: new Color(...materialValue.targetValue.slice(0, 3))
                }));
                return;
              }
              console.warn(materialPropertyName + " is not supported");
            });
          });
        }
        manager.registerExpression(expression);
      })));
      return manager;
    });
  }
};
VRMExpressionLoaderPlugin.v0v1PresetNameMap = {
  a: "aa",
  e: "ee",
  i: "ih",
  o: "oh",
  u: "ou",
  blink: "blink",
  joy: "happy",
  angry: "angry",
  sorrow: "sad",
  fun: "relaxed",
  lookup: "lookUp",
  lookdown: "lookDown",
  lookleft: "lookLeft",
  lookright: "lookRight",
  // eslint-disable-next-line @typescript-eslint/naming-convention
  blink_l: "blinkLeft",
  // eslint-disable-next-line @typescript-eslint/naming-convention
  blink_r: "blinkRight",
  neutral: "neutral"
};
var VRMExpressionOverrideType = {
  None: "none",
  Block: "block",
  Blend: "blend"
};
var VRMFirstPerson = class {
  /**
   * Create a new VRMFirstPerson object.
   *
   * @param humanoid A {@link VRMHumanoid}
   * @param meshAnnotations A renderer settings. See the description of [[RendererFirstPersonFlags]] for more info
   */
  constructor(humanoid, meshAnnotations) {
    this._firstPersonOnlyLayer = VRMFirstPerson.DEFAULT_FIRSTPERSON_ONLY_LAYER;
    this._thirdPersonOnlyLayer = VRMFirstPerson.DEFAULT_THIRDPERSON_ONLY_LAYER;
    this._initializedLayers = false;
    this.humanoid = humanoid;
    this.meshAnnotations = meshAnnotations;
  }
  /**
   * Copy the given {@link VRMFirstPerson} into this one.
   * {@link humanoid} must be same as the source one.
   * @param source The {@link VRMFirstPerson} you want to copy
   * @returns this
   */
  copy(source) {
    if (this.humanoid !== source.humanoid) {
      throw new Error("VRMFirstPerson: humanoid must be same in order to copy");
    }
    this.meshAnnotations = source.meshAnnotations.map((annotation) => ({
      meshes: annotation.meshes.concat(),
      type: annotation.type
    }));
    return this;
  }
  /**
   * Returns a clone of this {@link VRMFirstPerson}.
   * @returns Copied {@link VRMFirstPerson}
   */
  clone() {
    return new VRMFirstPerson(this.humanoid, this.meshAnnotations).copy(this);
  }
  /**
   * A camera layer represents `FirstPersonOnly` layer.
   * Note that **you must call {@link setup} first before you use the layer feature** or it does not work properly.
   *
   * The value is {@link DEFAULT_FIRSTPERSON_ONLY_LAYER} by default but you can change the layer by specifying via {@link setup} if you prefer.
   *
   * @see https://vrm.dev/en/univrm/api/univrm_use_firstperson/
   * @see https://threejs.org/docs/#api/en/core/Layers
   */
  get firstPersonOnlyLayer() {
    return this._firstPersonOnlyLayer;
  }
  /**
   * A camera layer represents `ThirdPersonOnly` layer.
   * Note that **you must call {@link setup} first before you use the layer feature** or it does not work properly.
   *
   * The value is {@link DEFAULT_THIRDPERSON_ONLY_LAYER} by default but you can change the layer by specifying via {@link setup} if you prefer.
   *
   * @see https://vrm.dev/en/univrm/api/univrm_use_firstperson/
   * @see https://threejs.org/docs/#api/en/core/Layers
   */
  get thirdPersonOnlyLayer() {
    return this._thirdPersonOnlyLayer;
  }
  /**
   * In this method, it assigns layers for every meshes based on mesh annotations.
   * You must call this method first before you use the layer feature.
   *
   * This is an equivalent of [VRMFirstPerson.Setup](https://github.com/vrm-c/UniVRM/blob/73a5bd8fcddaa2a7a8735099a97e63c9db3e5ea0/Assets/VRM/Runtime/FirstPerson/VRMFirstPerson.cs#L295-L299) of the UniVRM.
   *
   * The `cameraLayer` parameter specifies which layer will be assigned for `FirstPersonOnly` / `ThirdPersonOnly`.
   * In UniVRM, we specified those by naming each desired layer as `FIRSTPERSON_ONLY_LAYER` / `THIRDPERSON_ONLY_LAYER`
   * but we are going to specify these layers at here since we are unable to name layers in Three.js.
   *
   * @param cameraLayer Specify which layer will be for `FirstPersonOnly` / `ThirdPersonOnly`.
   */
  setup({ firstPersonOnlyLayer = VRMFirstPerson.DEFAULT_FIRSTPERSON_ONLY_LAYER, thirdPersonOnlyLayer = VRMFirstPerson.DEFAULT_THIRDPERSON_ONLY_LAYER } = {}) {
    if (this._initializedLayers) {
      return;
    }
    this._firstPersonOnlyLayer = firstPersonOnlyLayer;
    this._thirdPersonOnlyLayer = thirdPersonOnlyLayer;
    this.meshAnnotations.forEach((item) => {
      item.meshes.forEach((mesh) => {
        if (item.type === "firstPersonOnly") {
          mesh.layers.set(this._firstPersonOnlyLayer);
          mesh.traverse((child) => child.layers.set(this._firstPersonOnlyLayer));
        } else if (item.type === "thirdPersonOnly") {
          mesh.layers.set(this._thirdPersonOnlyLayer);
          mesh.traverse((child) => child.layers.set(this._thirdPersonOnlyLayer));
        } else if (item.type === "auto") {
          this._createHeadlessModel(mesh);
        }
      });
    });
    this._initializedLayers = true;
  }
  _excludeTriangles(triangles, bws, skinIndex, exclude) {
    let count = 0;
    if (bws != null && bws.length > 0) {
      for (let i = 0; i < triangles.length; i += 3) {
        const a = triangles[i];
        const b = triangles[i + 1];
        const c = triangles[i + 2];
        const bw0 = bws[a];
        const skin0 = skinIndex[a];
        if (bw0[0] > 0 && exclude.includes(skin0[0]))
          continue;
        if (bw0[1] > 0 && exclude.includes(skin0[1]))
          continue;
        if (bw0[2] > 0 && exclude.includes(skin0[2]))
          continue;
        if (bw0[3] > 0 && exclude.includes(skin0[3]))
          continue;
        const bw1 = bws[b];
        const skin1 = skinIndex[b];
        if (bw1[0] > 0 && exclude.includes(skin1[0]))
          continue;
        if (bw1[1] > 0 && exclude.includes(skin1[1]))
          continue;
        if (bw1[2] > 0 && exclude.includes(skin1[2]))
          continue;
        if (bw1[3] > 0 && exclude.includes(skin1[3]))
          continue;
        const bw2 = bws[c];
        const skin2 = skinIndex[c];
        if (bw2[0] > 0 && exclude.includes(skin2[0]))
          continue;
        if (bw2[1] > 0 && exclude.includes(skin2[1]))
          continue;
        if (bw2[2] > 0 && exclude.includes(skin2[2]))
          continue;
        if (bw2[3] > 0 && exclude.includes(skin2[3]))
          continue;
        triangles[count++] = a;
        triangles[count++] = b;
        triangles[count++] = c;
      }
    }
    return count;
  }
  _createErasedMesh(src, erasingBonesIndex) {
    const dst = new SkinnedMesh(src.geometry.clone(), src.material);
    dst.name = `${src.name}(erase)`;
    dst.frustumCulled = src.frustumCulled;
    dst.layers.set(this._firstPersonOnlyLayer);
    const geometry = dst.geometry;
    const skinIndexAttr = geometry.getAttribute("skinIndex");
    const skinIndexAttrArray = skinIndexAttr instanceof GLBufferAttribute ? [] : skinIndexAttr.array;
    const skinIndex = [];
    for (let i = 0; i < skinIndexAttrArray.length; i += 4) {
      skinIndex.push([
        skinIndexAttrArray[i],
        skinIndexAttrArray[i + 1],
        skinIndexAttrArray[i + 2],
        skinIndexAttrArray[i + 3]
      ]);
    }
    const skinWeightAttr = geometry.getAttribute("skinWeight");
    const skinWeightAttrArray = skinWeightAttr instanceof GLBufferAttribute ? [] : skinWeightAttr.array;
    const skinWeight = [];
    for (let i = 0; i < skinWeightAttrArray.length; i += 4) {
      skinWeight.push([
        skinWeightAttrArray[i],
        skinWeightAttrArray[i + 1],
        skinWeightAttrArray[i + 2],
        skinWeightAttrArray[i + 3]
      ]);
    }
    const index = geometry.getIndex();
    if (!index) {
      throw new Error("The geometry doesn't have an index buffer");
    }
    const oldTriangles = Array.from(index.array);
    const count = this._excludeTriangles(oldTriangles, skinWeight, skinIndex, erasingBonesIndex);
    const newTriangle = [];
    for (let i = 0; i < count; i++) {
      newTriangle[i] = oldTriangles[i];
    }
    geometry.setIndex(newTriangle);
    if (src.onBeforeRender) {
      dst.onBeforeRender = src.onBeforeRender;
    }
    dst.bind(new Skeleton(src.skeleton.bones, src.skeleton.boneInverses), new Matrix4());
    return dst;
  }
  _createHeadlessModelForSkinnedMesh(parent, mesh) {
    const eraseBoneIndexes = [];
    mesh.skeleton.bones.forEach((bone, index) => {
      if (this._isEraseTarget(bone))
        eraseBoneIndexes.push(index);
    });
    if (!eraseBoneIndexes.length) {
      mesh.layers.enable(this._thirdPersonOnlyLayer);
      mesh.layers.enable(this._firstPersonOnlyLayer);
      return;
    }
    mesh.layers.set(this._thirdPersonOnlyLayer);
    const newMesh = this._createErasedMesh(mesh, eraseBoneIndexes);
    parent.add(newMesh);
  }
  _createHeadlessModel(node) {
    if (node.type === "Group") {
      node.layers.set(this._thirdPersonOnlyLayer);
      if (this._isEraseTarget(node)) {
        node.traverse((child) => child.layers.set(this._thirdPersonOnlyLayer));
      } else {
        const parent = new Group();
        parent.name = `_headless_${node.name}`;
        parent.layers.set(this._firstPersonOnlyLayer);
        node.parent.add(parent);
        node.children.filter((child) => child.type === "SkinnedMesh").forEach((child) => {
          const skinnedMesh = child;
          this._createHeadlessModelForSkinnedMesh(parent, skinnedMesh);
        });
      }
    } else if (node.type === "SkinnedMesh") {
      const skinnedMesh = node;
      this._createHeadlessModelForSkinnedMesh(node.parent, skinnedMesh);
    } else {
      if (this._isEraseTarget(node)) {
        node.layers.set(this._thirdPersonOnlyLayer);
        node.traverse((child) => child.layers.set(this._thirdPersonOnlyLayer));
      }
    }
  }
  _isEraseTarget(bone) {
    if (bone === this.humanoid.getRawBoneNode("head")) {
      return true;
    } else if (!bone.parent) {
      return false;
    } else {
      return this._isEraseTarget(bone.parent);
    }
  }
};
VRMFirstPerson.DEFAULT_FIRSTPERSON_ONLY_LAYER = 9;
VRMFirstPerson.DEFAULT_THIRDPERSON_ONLY_LAYER = 10;
var POSSIBLE_SPEC_VERSIONS$3 = /* @__PURE__ */ new Set(["1.0", "1.0-beta"]);
var VRMFirstPersonLoaderPlugin = class {
  constructor(parser) {
    this.parser = parser;
  }
  get name() {
    return "VRMFirstPersonLoaderPlugin";
  }
  afterRoot(gltf) {
    return __awaiter$6(this, void 0, void 0, function* () {
      const vrmHumanoid = gltf.userData.vrmHumanoid;
      if (vrmHumanoid === null) {
        return;
      } else if (vrmHumanoid === void 0) {
        throw new Error("VRMFirstPersonLoaderPlugin: vrmHumanoid is undefined. VRMHumanoidLoaderPlugin have to be used first");
      }
      gltf.userData.vrmFirstPerson = yield this._import(gltf, vrmHumanoid);
    });
  }
  /**
   * Import a {@link VRMFirstPerson} from a VRM.
   *
   * @param gltf A parsed result of GLTF taken from GLTFLoader
   * @param humanoid A {@link VRMHumanoid} instance that represents the VRM
   */
  _import(gltf, humanoid) {
    return __awaiter$6(this, void 0, void 0, function* () {
      if (humanoid == null) {
        return null;
      }
      const v1Result = yield this._v1Import(gltf, humanoid);
      if (v1Result) {
        return v1Result;
      }
      const v0Result = yield this._v0Import(gltf, humanoid);
      if (v0Result) {
        return v0Result;
      }
      return null;
    });
  }
  _v1Import(gltf, humanoid) {
    var _a, _b;
    return __awaiter$6(this, void 0, void 0, function* () {
      const json = this.parser.json;
      const isVRMUsed = ((_a = json.extensionsUsed) === null || _a === void 0 ? void 0 : _a.indexOf("VRMC_vrm")) !== -1;
      if (!isVRMUsed) {
        return null;
      }
      const extension = (_b = json.extensions) === null || _b === void 0 ? void 0 : _b["VRMC_vrm"];
      if (!extension) {
        return null;
      }
      const specVersion = extension.specVersion;
      if (!POSSIBLE_SPEC_VERSIONS$3.has(specVersion)) {
        console.warn(`VRMFirstPersonLoaderPlugin: Unknown VRMC_vrm specVersion "${specVersion}"`);
        return null;
      }
      const schemaFirstPerson = extension.firstPerson;
      if (!schemaFirstPerson) {
        return null;
      }
      const meshAnnotations = [];
      const nodePrimitivesMap = yield gltfExtractPrimitivesFromNodes(gltf);
      Array.from(nodePrimitivesMap.entries()).forEach(([nodeIndex, primitives]) => {
        var _a2;
        const annotation = schemaFirstPerson.meshAnnotations ? schemaFirstPerson.meshAnnotations.find((a) => a.node === nodeIndex) : void 0;
        meshAnnotations.push({
          meshes: primitives,
          type: (_a2 = annotation === null || annotation === void 0 ? void 0 : annotation.type) !== null && _a2 !== void 0 ? _a2 : "both"
        });
      });
      return new VRMFirstPerson(humanoid, meshAnnotations);
    });
  }
  _v0Import(gltf, humanoid) {
    var _a;
    return __awaiter$6(this, void 0, void 0, function* () {
      const json = this.parser.json;
      const vrmExt = (_a = json.extensions) === null || _a === void 0 ? void 0 : _a.VRM;
      if (!vrmExt) {
        return null;
      }
      const schemaFirstPerson = vrmExt.firstPerson;
      if (!schemaFirstPerson) {
        return null;
      }
      const meshAnnotations = [];
      const nodePrimitivesMap = yield gltfExtractPrimitivesFromNodes(gltf);
      Array.from(nodePrimitivesMap.entries()).forEach(([nodeIndex, primitives]) => {
        const schemaNode = json.nodes[nodeIndex];
        const flag = schemaFirstPerson.meshAnnotations ? schemaFirstPerson.meshAnnotations.find((a) => a.mesh === schemaNode.mesh) : void 0;
        meshAnnotations.push({
          meshes: primitives,
          type: this._convertV0FlagToV1Type(flag === null || flag === void 0 ? void 0 : flag.firstPersonFlag)
        });
      });
      return new VRMFirstPerson(humanoid, meshAnnotations);
    });
  }
  _convertV0FlagToV1Type(flag) {
    if (flag === "FirstPersonOnly") {
      return "firstPersonOnly";
    } else if (flag === "ThirdPersonOnly") {
      return "thirdPersonOnly";
    } else if (flag === "Auto") {
      return "auto";
    } else {
      return "both";
    }
  }
};
var VRMFirstPersonMeshAnnotationType = {
  Auto: "auto",
  Both: "both",
  ThirdPersonOnly: "thirdPersonOnly",
  FirstPersonOnly: "firstPersonOnly"
};
var _v3A$4$1 = new Vector3();
var _v3B$2$1 = new Vector3();
var _quatA$5 = new Quaternion();
var VRMHumanoidHelper = class extends Group {
  constructor(humanoid) {
    super();
    this.vrmHumanoid = humanoid;
    this._boneAxesMap = /* @__PURE__ */ new Map();
    Object.values(humanoid.humanBones).forEach((bone) => {
      const helper = new AxesHelper(1);
      helper.matrixAutoUpdate = false;
      helper.material.depthTest = false;
      helper.material.depthWrite = false;
      this.add(helper);
      this._boneAxesMap.set(bone, helper);
    });
  }
  dispose() {
    Array.from(this._boneAxesMap.values()).forEach((axes) => {
      axes.geometry.dispose();
      axes.material.dispose();
    });
  }
  updateMatrixWorld(force) {
    Array.from(this._boneAxesMap.entries()).forEach(([bone, axes]) => {
      bone.node.updateWorldMatrix(true, false);
      bone.node.matrixWorld.decompose(_v3A$4$1, _quatA$5, _v3B$2$1);
      const scale = _v3A$4$1.set(0.1, 0.1, 0.1).divide(_v3B$2$1);
      axes.matrix.copy(bone.node.matrixWorld).scale(scale);
    });
    super.updateMatrixWorld(force);
  }
};
var VRMHumanBoneList = [
  "hips",
  "spine",
  "chest",
  "upperChest",
  "neck",
  "head",
  "leftEye",
  "rightEye",
  "jaw",
  "leftUpperLeg",
  "leftLowerLeg",
  "leftFoot",
  "leftToes",
  "rightUpperLeg",
  "rightLowerLeg",
  "rightFoot",
  "rightToes",
  "leftShoulder",
  "leftUpperArm",
  "leftLowerArm",
  "leftHand",
  "rightShoulder",
  "rightUpperArm",
  "rightLowerArm",
  "rightHand",
  "leftThumbMetacarpal",
  "leftThumbProximal",
  "leftThumbDistal",
  "leftIndexProximal",
  "leftIndexIntermediate",
  "leftIndexDistal",
  "leftMiddleProximal",
  "leftMiddleIntermediate",
  "leftMiddleDistal",
  "leftRingProximal",
  "leftRingIntermediate",
  "leftRingDistal",
  "leftLittleProximal",
  "leftLittleIntermediate",
  "leftLittleDistal",
  "rightThumbMetacarpal",
  "rightThumbProximal",
  "rightThumbDistal",
  "rightIndexProximal",
  "rightIndexIntermediate",
  "rightIndexDistal",
  "rightMiddleProximal",
  "rightMiddleIntermediate",
  "rightMiddleDistal",
  "rightRingProximal",
  "rightRingIntermediate",
  "rightRingDistal",
  "rightLittleProximal",
  "rightLittleIntermediate",
  "rightLittleDistal"
];
var VRMHumanBoneName = {
  Hips: "hips",
  Spine: "spine",
  Chest: "chest",
  UpperChest: "upperChest",
  Neck: "neck",
  Head: "head",
  LeftEye: "leftEye",
  RightEye: "rightEye",
  Jaw: "jaw",
  LeftUpperLeg: "leftUpperLeg",
  LeftLowerLeg: "leftLowerLeg",
  LeftFoot: "leftFoot",
  LeftToes: "leftToes",
  RightUpperLeg: "rightUpperLeg",
  RightLowerLeg: "rightLowerLeg",
  RightFoot: "rightFoot",
  RightToes: "rightToes",
  LeftShoulder: "leftShoulder",
  LeftUpperArm: "leftUpperArm",
  LeftLowerArm: "leftLowerArm",
  LeftHand: "leftHand",
  RightShoulder: "rightShoulder",
  RightUpperArm: "rightUpperArm",
  RightLowerArm: "rightLowerArm",
  RightHand: "rightHand",
  LeftThumbMetacarpal: "leftThumbMetacarpal",
  LeftThumbProximal: "leftThumbProximal",
  LeftThumbDistal: "leftThumbDistal",
  LeftIndexProximal: "leftIndexProximal",
  LeftIndexIntermediate: "leftIndexIntermediate",
  LeftIndexDistal: "leftIndexDistal",
  LeftMiddleProximal: "leftMiddleProximal",
  LeftMiddleIntermediate: "leftMiddleIntermediate",
  LeftMiddleDistal: "leftMiddleDistal",
  LeftRingProximal: "leftRingProximal",
  LeftRingIntermediate: "leftRingIntermediate",
  LeftRingDistal: "leftRingDistal",
  LeftLittleProximal: "leftLittleProximal",
  LeftLittleIntermediate: "leftLittleIntermediate",
  LeftLittleDistal: "leftLittleDistal",
  RightThumbMetacarpal: "rightThumbMetacarpal",
  RightThumbProximal: "rightThumbProximal",
  RightThumbDistal: "rightThumbDistal",
  RightIndexProximal: "rightIndexProximal",
  RightIndexIntermediate: "rightIndexIntermediate",
  RightIndexDistal: "rightIndexDistal",
  RightMiddleProximal: "rightMiddleProximal",
  RightMiddleIntermediate: "rightMiddleIntermediate",
  RightMiddleDistal: "rightMiddleDistal",
  RightRingProximal: "rightRingProximal",
  RightRingIntermediate: "rightRingIntermediate",
  RightRingDistal: "rightRingDistal",
  RightLittleProximal: "rightLittleProximal",
  RightLittleIntermediate: "rightLittleIntermediate",
  RightLittleDistal: "rightLittleDistal"
};
var VRMHumanBoneParentMap = {
  hips: null,
  spine: "hips",
  chest: "spine",
  upperChest: "chest",
  neck: "upperChest",
  head: "neck",
  leftEye: "head",
  rightEye: "head",
  jaw: "head",
  leftUpperLeg: "hips",
  leftLowerLeg: "leftUpperLeg",
  leftFoot: "leftLowerLeg",
  leftToes: "leftFoot",
  rightUpperLeg: "hips",
  rightLowerLeg: "rightUpperLeg",
  rightFoot: "rightLowerLeg",
  rightToes: "rightFoot",
  leftShoulder: "upperChest",
  leftUpperArm: "leftShoulder",
  leftLowerArm: "leftUpperArm",
  leftHand: "leftLowerArm",
  rightShoulder: "upperChest",
  rightUpperArm: "rightShoulder",
  rightLowerArm: "rightUpperArm",
  rightHand: "rightLowerArm",
  leftThumbMetacarpal: "leftHand",
  leftThumbProximal: "leftThumbMetacarpal",
  leftThumbDistal: "leftThumbProximal",
  leftIndexProximal: "leftHand",
  leftIndexIntermediate: "leftIndexProximal",
  leftIndexDistal: "leftIndexIntermediate",
  leftMiddleProximal: "leftHand",
  leftMiddleIntermediate: "leftMiddleProximal",
  leftMiddleDistal: "leftMiddleIntermediate",
  leftRingProximal: "leftHand",
  leftRingIntermediate: "leftRingProximal",
  leftRingDistal: "leftRingIntermediate",
  leftLittleProximal: "leftHand",
  leftLittleIntermediate: "leftLittleProximal",
  leftLittleDistal: "leftLittleIntermediate",
  rightThumbMetacarpal: "rightHand",
  rightThumbProximal: "rightThumbMetacarpal",
  rightThumbDistal: "rightThumbProximal",
  rightIndexProximal: "rightHand",
  rightIndexIntermediate: "rightIndexProximal",
  rightIndexDistal: "rightIndexIntermediate",
  rightMiddleProximal: "rightHand",
  rightMiddleIntermediate: "rightMiddleProximal",
  rightMiddleDistal: "rightMiddleIntermediate",
  rightRingProximal: "rightHand",
  rightRingIntermediate: "rightRingProximal",
  rightRingDistal: "rightRingIntermediate",
  rightLittleProximal: "rightHand",
  rightLittleIntermediate: "rightLittleProximal",
  rightLittleDistal: "rightLittleIntermediate"
};
function quatInvertCompat$1(target) {
  if (target.invert) {
    target.invert();
  } else {
    target.inverse();
  }
  return target;
}
var _v3A$3$2 = new Vector3();
var _quatA$4 = new Quaternion();
var VRMRig = class {
  /**
   * Create a new {@link VRMHumanoid}.
   * @param humanBones A {@link VRMHumanBones} contains all the bones of the new humanoid
   */
  constructor(humanBones) {
    this.humanBones = humanBones;
    this.restPose = this.getAbsolutePose();
  }
  /**
   * Return the current absolute pose of this humanoid as a {@link VRMPose}.
   * Note that the output result will contain initial state of the VRM and not compatible between different models.
   * You might want to use {@link getPose} instead.
   */
  getAbsolutePose() {
    const pose = {};
    Object.keys(this.humanBones).forEach((vrmBoneNameString) => {
      const vrmBoneName = vrmBoneNameString;
      const node = this.getBoneNode(vrmBoneName);
      if (!node) {
        return;
      }
      _v3A$3$2.copy(node.position);
      _quatA$4.copy(node.quaternion);
      pose[vrmBoneName] = {
        position: _v3A$3$2.toArray(),
        rotation: _quatA$4.toArray()
      };
    });
    return pose;
  }
  /**
   * Return the current pose of this humanoid as a {@link VRMPose}.
   *
   * Each transform is a local transform relative from rest pose (T-pose).
   */
  getPose() {
    const pose = {};
    Object.keys(this.humanBones).forEach((boneNameString) => {
      const boneName = boneNameString;
      const node = this.getBoneNode(boneName);
      if (!node) {
        return;
      }
      _v3A$3$2.set(0, 0, 0);
      _quatA$4.identity();
      const restState = this.restPose[boneName];
      if (restState === null || restState === void 0 ? void 0 : restState.position) {
        _v3A$3$2.fromArray(restState.position).negate();
      }
      if (restState === null || restState === void 0 ? void 0 : restState.rotation) {
        quatInvertCompat$1(_quatA$4.fromArray(restState.rotation));
      }
      _v3A$3$2.add(node.position);
      _quatA$4.premultiply(node.quaternion);
      pose[boneName] = {
        position: _v3A$3$2.toArray(),
        rotation: _quatA$4.toArray()
      };
    });
    return pose;
  }
  /**
   * Let the humanoid do a specified pose.
   *
   * Each transform have to be a local transform relative from rest pose (T-pose).
   * You can pass what you got from {@link getPose}.
   *
   * @param poseObject A [[VRMPose]] that represents a single pose
   */
  setPose(poseObject) {
    Object.entries(poseObject).forEach(([boneNameString, state]) => {
      const boneName = boneNameString;
      const node = this.getBoneNode(boneName);
      if (!node) {
        return;
      }
      const restState = this.restPose[boneName];
      if (!restState) {
        return;
      }
      if (state === null || state === void 0 ? void 0 : state.position) {
        node.position.fromArray(state.position);
        if (restState.position) {
          node.position.add(_v3A$3$2.fromArray(restState.position));
        }
      }
      if (state === null || state === void 0 ? void 0 : state.rotation) {
        node.quaternion.fromArray(state.rotation);
        if (restState.rotation) {
          node.quaternion.multiply(_quatA$4.fromArray(restState.rotation));
        }
      }
    });
  }
  /**
   * Reset the humanoid to its rest pose.
   */
  resetPose() {
    Object.entries(this.restPose).forEach(([boneName, rest]) => {
      const node = this.getBoneNode(boneName);
      if (!node) {
        return;
      }
      if (rest === null || rest === void 0 ? void 0 : rest.position) {
        node.position.fromArray(rest.position);
      }
      if (rest === null || rest === void 0 ? void 0 : rest.rotation) {
        node.quaternion.fromArray(rest.rotation);
      }
    });
  }
  /**
   * Return a bone bound to a specified {@link VRMHumanBoneName}, as a {@link VRMHumanBone}.
   *
   * @param name Name of the bone you want
   */
  getBone(name) {
    var _a;
    return (_a = this.humanBones[name]) !== null && _a !== void 0 ? _a : void 0;
  }
  /**
   * Return a bone bound to a specified {@link VRMHumanBoneName}, as a `THREE.Object3D`.
   *
   * @param name Name of the bone you want
   */
  getBoneNode(name) {
    var _a, _b;
    return (_b = (_a = this.humanBones[name]) === null || _a === void 0 ? void 0 : _a.node) !== null && _b !== void 0 ? _b : null;
  }
};
var _v3A$2$2 = new Vector3();
var _quatA$3$1 = new Quaternion();
var _boneWorldPos = new Vector3();
var VRMHumanoidRig = class extends VRMRig {
  constructor(humanoid) {
    const { rigBones, root, parentWorldRotations, boneRotations } = VRMHumanoidRig._setupTransforms(humanoid);
    super(rigBones);
    this.original = humanoid;
    this.root = root;
    this._parentWorldRotations = parentWorldRotations;
    this._boneRotations = boneRotations;
  }
  static _setupTransforms(modelRig) {
    const root = new Object3D();
    root.name = "VRMHumanoidRig";
    const boneWorldPositions = {};
    const boneWorldRotations = {};
    const boneRotations = {};
    VRMHumanBoneList.forEach((boneName) => {
      const boneNode = modelRig.getBoneNode(boneName);
      if (boneNode) {
        const boneWorldPosition = new Vector3();
        const boneWorldRotation = new Quaternion();
        boneNode.updateWorldMatrix(true, false);
        boneNode.matrixWorld.decompose(boneWorldPosition, boneWorldRotation, _v3A$2$2);
        boneWorldPositions[boneName] = boneWorldPosition;
        boneWorldRotations[boneName] = boneWorldRotation;
        boneRotations[boneName] = boneNode.quaternion.clone();
      }
    });
    const parentWorldRotations = {};
    const rigBones = {};
    VRMHumanBoneList.forEach((boneName) => {
      var _a;
      const boneNode = modelRig.getBoneNode(boneName);
      if (boneNode) {
        const boneWorldPosition = boneWorldPositions[boneName];
        let currentBoneName = boneName;
        let parentWorldPosition;
        let parentWorldRotation;
        while (parentWorldPosition == null) {
          currentBoneName = VRMHumanBoneParentMap[currentBoneName];
          if (currentBoneName == null) {
            break;
          }
          parentWorldPosition = boneWorldPositions[currentBoneName];
          parentWorldRotation = boneWorldRotations[currentBoneName];
        }
        const rigBoneNode = new Object3D();
        rigBoneNode.name = "Normalized_" + boneNode.name;
        const parentRigBoneNode = currentBoneName ? (_a = rigBones[currentBoneName]) === null || _a === void 0 ? void 0 : _a.node : root;
        parentRigBoneNode.add(rigBoneNode);
        rigBoneNode.position.copy(boneWorldPosition);
        if (parentWorldPosition) {
          rigBoneNode.position.sub(parentWorldPosition);
        }
        rigBones[boneName] = { node: rigBoneNode };
        parentWorldRotations[boneName] = parentWorldRotation !== null && parentWorldRotation !== void 0 ? parentWorldRotation : new Quaternion();
      }
    });
    return {
      rigBones,
      root,
      parentWorldRotations,
      boneRotations
    };
  }
  /**
   * Update this humanoid rig.
   */
  update() {
    VRMHumanBoneList.forEach((boneName) => {
      const boneNode = this.original.getBoneNode(boneName);
      if (boneNode != null) {
        const rigBoneNode = this.getBoneNode(boneName);
        const parentWorldRotation = this._parentWorldRotations[boneName];
        const invParentWorldRotation = _quatA$3$1.copy(parentWorldRotation).invert();
        const boneRotation = this._boneRotations[boneName];
        boneNode.quaternion.copy(rigBoneNode.quaternion).multiply(parentWorldRotation).premultiply(invParentWorldRotation).multiply(boneRotation);
        if (boneName === "hips") {
          const boneWorldPosition = rigBoneNode.getWorldPosition(_boneWorldPos);
          boneNode.parent.updateWorldMatrix(true, false);
          const parentWorldMatrix = boneNode.parent.matrixWorld;
          const localPosition = boneWorldPosition.applyMatrix4(parentWorldMatrix.invert());
          boneNode.position.copy(localPosition);
        }
      }
    });
  }
};
var VRMHumanoid = class {
  /**
   * Create a new {@link VRMHumanoid}.
   * @param humanBones A {@link VRMHumanBones} contains all the bones of the new humanoid
   * @param autoUpdateHumanBones Whether it copies pose from normalizedHumanBones to rawHumanBones on {@link update}. `true` by default.
   */
  constructor(humanBones, options) {
    var _a;
    this.autoUpdateHumanBones = (_a = options === null || options === void 0 ? void 0 : options.autoUpdateHumanBones) !== null && _a !== void 0 ? _a : true;
    this._rawHumanBones = new VRMRig(humanBones);
    this._normalizedHumanBones = new VRMHumanoidRig(this._rawHumanBones);
  }
  /**
   * @deprecated Deprecated. Use either {@link rawRestPose} or {@link normalizedRestPose} instead.
   */
  get restPose() {
    console.warn("VRMHumanoid: restPose is deprecated. Use either rawRestPose or normalizedRestPose instead.");
    return this.rawRestPose;
  }
  /**
   * A {@link VRMPose} of its raw human bones that is its default state.
   * Note that it's not compatible with {@link setRawPose} and {@link getRawPose}, since it contains non-relative values of each local transforms.
   */
  get rawRestPose() {
    return this._rawHumanBones.restPose;
  }
  /**
   * A {@link VRMPose} of its normalized human bones that is its default state.
   * Note that it's not compatible with {@link setNormalizedPose} and {@link getNormalizedPose}, since it contains non-relative values of each local transforms.
   */
  get normalizedRestPose() {
    return this._normalizedHumanBones.restPose;
  }
  /**
   * A map from {@link VRMHumanBoneName} to raw {@link VRMHumanBone}s.
   */
  get humanBones() {
    return this._rawHumanBones.humanBones;
  }
  /**
   * A map from {@link VRMHumanBoneName} to raw {@link VRMHumanBone}s.
   */
  get rawHumanBones() {
    return this._rawHumanBones.humanBones;
  }
  /**
   * A map from {@link VRMHumanBoneName} to normalized {@link VRMHumanBone}s.
   */
  get normalizedHumanBones() {
    return this._normalizedHumanBones.humanBones;
  }
  /**
   * The root of normalized {@link VRMHumanBone}s.
   */
  get normalizedHumanBonesRoot() {
    return this._normalizedHumanBones.root;
  }
  /**
   * Copy the given {@link VRMHumanoid} into this one.
   * @param source The {@link VRMHumanoid} you want to copy
   * @returns this
   */
  copy(source) {
    this.autoUpdateHumanBones = source.autoUpdateHumanBones;
    this._rawHumanBones = new VRMRig(source.humanBones);
    this._normalizedHumanBones = new VRMHumanoidRig(this._rawHumanBones);
    return this;
  }
  /**
   * Returns a clone of this {@link VRMHumanoid}.
   * @returns Copied {@link VRMHumanoid}
   */
  clone() {
    return new VRMHumanoid(this.humanBones, { autoUpdateHumanBones: this.autoUpdateHumanBones }).copy(this);
  }
  /**
   * @deprecated Deprecated. Use either {@link getRawAbsolutePose} or {@link getNormalizedAbsolutePose} instead.
   */
  getAbsolutePose() {
    console.warn("VRMHumanoid: getAbsolutePose() is deprecated. Use either getRawAbsolutePose() or getNormalizedAbsolutePose() instead.");
    return this.getRawAbsolutePose();
  }
  /**
   * Return the current absolute pose of this raw human bones as a {@link VRMPose}.
   * Note that the output result will contain initial state of the VRM and not compatible between different models.
   * You might want to use {@link getRawPose} instead.
   */
  getRawAbsolutePose() {
    return this._rawHumanBones.getAbsolutePose();
  }
  /**
   * Return the current absolute pose of this normalized human bones as a {@link VRMPose}.
   * Note that the output result will contain initial state of the VRM and not compatible between different models.
   * You might want to use {@link getNormalizedPose} instead.
   */
  getNormalizedAbsolutePose() {
    return this._normalizedHumanBones.getAbsolutePose();
  }
  /**
   * @deprecated Deprecated. Use either {@link getRawPose} or {@link getNormalizedPose} instead.
   */
  getPose() {
    console.warn("VRMHumanoid: getPose() is deprecated. Use either getRawPose() or getNormalizedPose() instead.");
    return this.getRawPose();
  }
  /**
   * Return the current pose of raw human bones as a {@link VRMPose}.
   *
   * Each transform is a local transform relative from rest pose (T-pose).
   */
  getRawPose() {
    return this._rawHumanBones.getPose();
  }
  /**
   * Return the current pose of normalized human bones as a {@link VRMPose}.
   *
   * Each transform is a local transform relative from rest pose (T-pose).
   */
  getNormalizedPose() {
    return this._normalizedHumanBones.getPose();
  }
  /**
   * @deprecated Deprecated. Use either {@link setRawPose} or {@link setNormalizedPose} instead.
   */
  setPose(poseObject) {
    console.warn("VRMHumanoid: setPose() is deprecated. Use either setRawPose() or setNormalizedPose() instead.");
    return this.setRawPose(poseObject);
  }
  /**
   * Let the raw human bones do a specified pose.
   *
   * Each transform have to be a local transform relative from rest pose (T-pose).
   * You can pass what you got from {@link getRawPose}.
   *
   * If you are using {@link autoUpdateHumanBones}, you might want to use {@link setNormalizedPose} instead.
   *
   * @param poseObject A {@link VRMPose} that represents a single pose
   */
  setRawPose(poseObject) {
    return this._rawHumanBones.setPose(poseObject);
  }
  /**
   * Let the normalized human bones do a specified pose.
   *
   * Each transform have to be a local transform relative from rest pose (T-pose).
   * You can pass what you got from {@link getNormalizedPose}.
   *
   * @param poseObject A {@link VRMPose} that represents a single pose
   */
  setNormalizedPose(poseObject) {
    return this._normalizedHumanBones.setPose(poseObject);
  }
  /**
   * @deprecated Deprecated. Use either {@link resetRawPose} or {@link resetNormalizedPose} instead.
   */
  resetPose() {
    console.warn("VRMHumanoid: resetPose() is deprecated. Use either resetRawPose() or resetNormalizedPose() instead.");
    return this.resetRawPose();
  }
  /**
   * Reset the raw humanoid to its rest pose.
   *
   * If you are using {@link autoUpdateHumanBones}, you might want to use {@link resetNormalizedPose} instead.
   */
  resetRawPose() {
    return this._rawHumanBones.resetPose();
  }
  /**
   * Reset the normalized humanoid to its rest pose.
   */
  resetNormalizedPose() {
    return this._normalizedHumanBones.resetPose();
  }
  /**
   * @deprecated Deprecated. Use either {@link getRawBone} or {@link getNormalizedBone} instead.
   */
  getBone(name) {
    console.warn("VRMHumanoid: getBone() is deprecated. Use either getRawBone() or getNormalizedBone() instead.");
    return this.getRawBone(name);
  }
  /**
   * Return a raw {@link VRMHumanBone} bound to a specified {@link VRMHumanBoneName}.
   *
   * @param name Name of the bone you want
   */
  getRawBone(name) {
    return this._rawHumanBones.getBone(name);
  }
  /**
   * Return a normalized {@link VRMHumanBone} bound to a specified {@link VRMHumanBoneName}.
   *
   * @param name Name of the bone you want
   */
  getNormalizedBone(name) {
    return this._normalizedHumanBones.getBone(name);
  }
  /**
   * @deprecated Deprecated. Use either {@link getRawBoneNode} or {@link getNormalizedBoneNode} instead.
   */
  getBoneNode(name) {
    console.warn("VRMHumanoid: getBoneNode() is deprecated. Use either getRawBoneNode() or getNormalizedBoneNode() instead.");
    return this.getRawBoneNode(name);
  }
  /**
   * Return a raw bone as a `THREE.Object3D` bound to a specified {@link VRMHumanBoneName}.
   *
   * @param name Name of the bone you want
   */
  getRawBoneNode(name) {
    return this._rawHumanBones.getBoneNode(name);
  }
  /**
   * Return a normalized bone as a `THREE.Object3D` bound to a specified {@link VRMHumanBoneName}.
   *
   * @param name Name of the bone you want
   */
  getNormalizedBoneNode(name) {
    return this._normalizedHumanBones.getBoneNode(name);
  }
  /**
   * Update the humanoid component.
   *
   * If {@link autoUpdateHumanBones} is `true`, it transfers the pose of normalized human bones to raw human bones.
   */
  update() {
    if (this.autoUpdateHumanBones) {
      this._normalizedHumanBones.update();
    }
  }
};
var VRMRequiredHumanBoneName = {
  Hips: "hips",
  Spine: "spine",
  Head: "head",
  LeftUpperLeg: "leftUpperLeg",
  LeftLowerLeg: "leftLowerLeg",
  LeftFoot: "leftFoot",
  RightUpperLeg: "rightUpperLeg",
  RightLowerLeg: "rightLowerLeg",
  RightFoot: "rightFoot",
  LeftUpperArm: "leftUpperArm",
  LeftLowerArm: "leftLowerArm",
  LeftHand: "leftHand",
  RightUpperArm: "rightUpperArm",
  RightLowerArm: "rightLowerArm",
  RightHand: "rightHand"
};
var POSSIBLE_SPEC_VERSIONS$2$1 = /* @__PURE__ */ new Set(["1.0", "1.0-beta"]);
var thumbBoneNameMap = {
  leftThumbProximal: "leftThumbMetacarpal",
  leftThumbIntermediate: "leftThumbProximal",
  rightThumbProximal: "rightThumbMetacarpal",
  rightThumbIntermediate: "rightThumbProximal"
};
var VRMHumanoidLoaderPlugin = class {
  constructor(parser, options) {
    this.parser = parser;
    this.helperRoot = options === null || options === void 0 ? void 0 : options.helperRoot;
    this.autoUpdateHumanBones = options === null || options === void 0 ? void 0 : options.autoUpdateHumanBones;
  }
  get name() {
    return "VRMHumanoidLoaderPlugin";
  }
  afterRoot(gltf) {
    return __awaiter$6(this, void 0, void 0, function* () {
      gltf.userData.vrmHumanoid = yield this._import(gltf);
    });
  }
  /**
   * Import a {@link VRMHumanoid} from a VRM.
   *
   * @param gltf A parsed result of GLTF taken from GLTFLoader
   */
  _import(gltf) {
    return __awaiter$6(this, void 0, void 0, function* () {
      const v1Result = yield this._v1Import(gltf);
      if (v1Result) {
        return v1Result;
      }
      const v0Result = yield this._v0Import(gltf);
      if (v0Result) {
        return v0Result;
      }
      return null;
    });
  }
  _v1Import(gltf) {
    var _a, _b;
    return __awaiter$6(this, void 0, void 0, function* () {
      const json = this.parser.json;
      const isVRMUsed = ((_a = json.extensionsUsed) === null || _a === void 0 ? void 0 : _a.indexOf("VRMC_vrm")) !== -1;
      if (!isVRMUsed) {
        return null;
      }
      const extension = (_b = json.extensions) === null || _b === void 0 ? void 0 : _b["VRMC_vrm"];
      if (!extension) {
        return null;
      }
      const specVersion = extension.specVersion;
      if (!POSSIBLE_SPEC_VERSIONS$2$1.has(specVersion)) {
        console.warn(`VRMHumanoidLoaderPlugin: Unknown VRMC_vrm specVersion "${specVersion}"`);
        return null;
      }
      const schemaHumanoid = extension.humanoid;
      if (!schemaHumanoid) {
        return null;
      }
      const existsPreviousThumbName = schemaHumanoid.humanBones.leftThumbIntermediate != null || schemaHumanoid.humanBones.rightThumbIntermediate != null;
      const humanBones = {};
      if (schemaHumanoid.humanBones != null) {
        yield Promise.all(Object.entries(schemaHumanoid.humanBones).map(([boneNameString, schemaHumanBone]) => __awaiter$6(this, void 0, void 0, function* () {
          let boneName = boneNameString;
          const index = schemaHumanBone.node;
          if (existsPreviousThumbName) {
            const thumbBoneName = thumbBoneNameMap[boneName];
            if (thumbBoneName != null) {
              boneName = thumbBoneName;
            }
          }
          const node = yield this.parser.getDependency("node", index);
          if (node == null) {
            console.warn(`A glTF node bound to the humanoid bone ${boneName} (index = ${index}) does not exist`);
            return;
          }
          humanBones[boneName] = { node };
        })));
      }
      const humanoid = new VRMHumanoid(this._ensureRequiredBonesExist(humanBones), {
        autoUpdateHumanBones: this.autoUpdateHumanBones
      });
      gltf.scene.add(humanoid.normalizedHumanBonesRoot);
      if (this.helperRoot) {
        const helper = new VRMHumanoidHelper(humanoid);
        this.helperRoot.add(helper);
        helper.renderOrder = this.helperRoot.renderOrder;
      }
      return humanoid;
    });
  }
  _v0Import(gltf) {
    var _a;
    return __awaiter$6(this, void 0, void 0, function* () {
      const json = this.parser.json;
      const vrmExt = (_a = json.extensions) === null || _a === void 0 ? void 0 : _a.VRM;
      if (!vrmExt) {
        return null;
      }
      const schemaHumanoid = vrmExt.humanoid;
      if (!schemaHumanoid) {
        return null;
      }
      const humanBones = {};
      if (schemaHumanoid.humanBones != null) {
        yield Promise.all(schemaHumanoid.humanBones.map((bone) => __awaiter$6(this, void 0, void 0, function* () {
          const boneName = bone.bone;
          const index = bone.node;
          if (boneName == null || index == null) {
            return;
          }
          const node = yield this.parser.getDependency("node", index);
          if (node == null) {
            console.warn(`A glTF node bound to the humanoid bone ${boneName} (index = ${index}) does not exist`);
            return;
          }
          const thumbBoneName = thumbBoneNameMap[boneName];
          const newBoneName = thumbBoneName !== null && thumbBoneName !== void 0 ? thumbBoneName : boneName;
          if (humanBones[newBoneName] != null) {
            console.warn(`Multiple bone entries for ${newBoneName} detected (index = ${index}), ignoring duplicated entries.`);
            return;
          }
          humanBones[newBoneName] = { node };
        })));
      }
      const humanoid = new VRMHumanoid(this._ensureRequiredBonesExist(humanBones), {
        autoUpdateHumanBones: this.autoUpdateHumanBones
      });
      gltf.scene.add(humanoid.normalizedHumanBonesRoot);
      if (this.helperRoot) {
        const helper = new VRMHumanoidHelper(humanoid);
        this.helperRoot.add(helper);
        helper.renderOrder = this.helperRoot.renderOrder;
      }
      return humanoid;
    });
  }
  /**
   * Ensure required bones exist in given human bones.
   * @param humanBones Human bones
   * @returns Human bones, no longer partial!
   */
  _ensureRequiredBonesExist(humanBones) {
    const missingRequiredBones = Object.values(VRMRequiredHumanBoneName).filter((requiredBoneName) => humanBones[requiredBoneName] == null);
    if (missingRequiredBones.length > 0) {
      throw new Error(`VRMHumanoidLoaderPlugin: These humanoid bones are required but not exist: ${missingRequiredBones.join(", ")}`);
    }
    return humanBones;
  }
};
var FanBufferGeometry = class extends BufferGeometry {
  constructor() {
    super();
    this._currentTheta = 0;
    this._currentRadius = 0;
    this.theta = 0;
    this.radius = 0;
    this._currentTheta = 0;
    this._currentRadius = 0;
    this._attrPos = new BufferAttribute(new Float32Array(65 * 3), 3);
    this.setAttribute("position", this._attrPos);
    this._attrIndex = new BufferAttribute(new Uint16Array(3 * 63), 1);
    this.setIndex(this._attrIndex);
    this._buildIndex();
    this.update();
  }
  update() {
    let shouldUpdateGeometry = false;
    if (this._currentTheta !== this.theta) {
      this._currentTheta = this.theta;
      shouldUpdateGeometry = true;
    }
    if (this._currentRadius !== this.radius) {
      this._currentRadius = this.radius;
      shouldUpdateGeometry = true;
    }
    if (shouldUpdateGeometry) {
      this._buildPosition();
    }
  }
  _buildPosition() {
    this._attrPos.setXYZ(0, 0, 0, 0);
    for (let i = 0; i < 64; i++) {
      const t = i / 63 * this._currentTheta;
      this._attrPos.setXYZ(i + 1, this._currentRadius * Math.sin(t), 0, this._currentRadius * Math.cos(t));
    }
    this._attrPos.needsUpdate = true;
  }
  _buildIndex() {
    for (let i = 0; i < 63; i++) {
      this._attrIndex.setXYZ(i * 3, 0, i + 1, i + 2);
    }
    this._attrIndex.needsUpdate = true;
  }
};
var LineAndSphereBufferGeometry = class extends BufferGeometry {
  constructor() {
    super();
    this.radius = 0;
    this._currentRadius = 0;
    this.tail = new Vector3();
    this._currentTail = new Vector3();
    this._attrPos = new BufferAttribute(new Float32Array(294), 3);
    this.setAttribute("position", this._attrPos);
    this._attrIndex = new BufferAttribute(new Uint16Array(194), 1);
    this.setIndex(this._attrIndex);
    this._buildIndex();
    this.update();
  }
  update() {
    let shouldUpdateGeometry = false;
    if (this._currentRadius !== this.radius) {
      this._currentRadius = this.radius;
      shouldUpdateGeometry = true;
    }
    if (!this._currentTail.equals(this.tail)) {
      this._currentTail.copy(this.tail);
      shouldUpdateGeometry = true;
    }
    if (shouldUpdateGeometry) {
      this._buildPosition();
    }
  }
  _buildPosition() {
    for (let i = 0; i < 32; i++) {
      const t = i / 16 * Math.PI;
      this._attrPos.setXYZ(i, Math.cos(t), Math.sin(t), 0);
      this._attrPos.setXYZ(32 + i, 0, Math.cos(t), Math.sin(t));
      this._attrPos.setXYZ(64 + i, Math.sin(t), 0, Math.cos(t));
    }
    this.scale(this._currentRadius, this._currentRadius, this._currentRadius);
    this.translate(this._currentTail.x, this._currentTail.y, this._currentTail.z);
    this._attrPos.setXYZ(96, 0, 0, 0);
    this._attrPos.setXYZ(97, this._currentTail.x, this._currentTail.y, this._currentTail.z);
    this._attrPos.needsUpdate = true;
  }
  _buildIndex() {
    for (let i = 0; i < 32; i++) {
      const i1 = (i + 1) % 32;
      this._attrIndex.setXY(i * 2, i, i1);
      this._attrIndex.setXY(64 + i * 2, 32 + i, 32 + i1);
      this._attrIndex.setXY(128 + i * 2, 64 + i, 64 + i1);
    }
    this._attrIndex.setXY(192, 96, 97);
    this._attrIndex.needsUpdate = true;
  }
};
var _quatA$2$1 = new Quaternion();
var _quatB$2$1 = new Quaternion();
var _v3A$1$2 = new Vector3();
var _v3B$1$2 = new Vector3();
var SQRT_2_OVER_2 = Math.sqrt(2) / 2;
var QUAT_XY_CW90 = new Quaternion(0, 0, -SQRT_2_OVER_2, SQRT_2_OVER_2);
var VEC3_POSITIVE_Y = new Vector3(0, 1, 0);
var VRMLookAtHelper = class extends Group {
  constructor(lookAt) {
    super();
    this.matrixAutoUpdate = false;
    this.vrmLookAt = lookAt;
    {
      const geometry = new FanBufferGeometry();
      geometry.radius = 0.5;
      const material = new MeshBasicMaterial({
        color: 65280,
        transparent: true,
        opacity: 0.5,
        side: DoubleSide,
        depthTest: false,
        depthWrite: false
      });
      this._meshPitch = new Mesh(geometry, material);
      this.add(this._meshPitch);
    }
    {
      const geometry = new FanBufferGeometry();
      geometry.radius = 0.5;
      const material = new MeshBasicMaterial({
        color: 16711680,
        transparent: true,
        opacity: 0.5,
        side: DoubleSide,
        depthTest: false,
        depthWrite: false
      });
      this._meshYaw = new Mesh(geometry, material);
      this.add(this._meshYaw);
    }
    {
      const geometry = new LineAndSphereBufferGeometry();
      geometry.radius = 0.1;
      const material = new LineBasicMaterial({
        color: 16777215,
        depthTest: false,
        depthWrite: false
      });
      this._lineTarget = new LineSegments(geometry, material);
      this._lineTarget.frustumCulled = false;
      this.add(this._lineTarget);
    }
  }
  dispose() {
    this._meshYaw.geometry.dispose();
    this._meshYaw.material.dispose();
    this._meshPitch.geometry.dispose();
    this._meshPitch.material.dispose();
    this._lineTarget.geometry.dispose();
    this._lineTarget.material.dispose();
  }
  updateMatrixWorld(force) {
    const yaw = MathUtils.DEG2RAD * this.vrmLookAt.yaw;
    this._meshYaw.geometry.theta = yaw;
    this._meshYaw.geometry.update();
    const pitch = MathUtils.DEG2RAD * this.vrmLookAt.pitch;
    this._meshPitch.geometry.theta = pitch;
    this._meshPitch.geometry.update();
    this.vrmLookAt.getLookAtWorldPosition(_v3A$1$2);
    this.vrmLookAt.getLookAtWorldQuaternion(_quatA$2$1);
    _quatA$2$1.multiply(this.vrmLookAt.getFaceFrontQuaternion(_quatB$2$1));
    this._meshYaw.position.copy(_v3A$1$2);
    this._meshYaw.quaternion.copy(_quatA$2$1);
    this._meshPitch.position.copy(_v3A$1$2);
    this._meshPitch.quaternion.copy(_quatA$2$1);
    this._meshPitch.quaternion.multiply(_quatB$2$1.setFromAxisAngle(VEC3_POSITIVE_Y, yaw));
    this._meshPitch.quaternion.multiply(QUAT_XY_CW90);
    const { target, autoUpdate } = this.vrmLookAt;
    if (target != null && autoUpdate) {
      target.getWorldPosition(_v3B$1$2).sub(_v3A$1$2);
      this._lineTarget.geometry.tail.copy(_v3B$1$2);
      this._lineTarget.geometry.update();
      this._lineTarget.position.copy(_v3A$1$2);
    }
    super.updateMatrixWorld(force);
  }
};
var _position = new Vector3();
var _scale = new Vector3();
function getWorldQuaternionLite(object, out) {
  object.matrixWorld.decompose(_position, out, _scale);
  return out;
}
function calcAzimuthAltitude(vector) {
  return [Math.atan2(-vector.z, vector.x), Math.atan2(vector.y, Math.sqrt(vector.x * vector.x + vector.z * vector.z))];
}
function sanitizeAngle(angle) {
  const roundTurn = Math.round(angle / 2 / Math.PI);
  return angle - 2 * Math.PI * roundTurn;
}
var VEC3_POSITIVE_Z$1 = new Vector3(0, 0, 1);
var _v3A$6 = new Vector3();
var _v3B$3 = new Vector3();
var _v3C$2 = new Vector3();
var _quatA$1$1 = new Quaternion();
var _quatB$1$1 = new Quaternion();
var _quatC$1 = new Quaternion();
var _quatD = new Quaternion();
var _eulerA$1 = new Euler();
var VRMLookAt = class {
  /**
   * Create a new {@link VRMLookAt}.
   *
   * @param humanoid A {@link VRMHumanoid}
   * @param applier A {@link VRMLookAtApplier}
   */
  constructor(humanoid, applier) {
    this.offsetFromHeadBone = new Vector3();
    this.autoUpdate = true;
    this.faceFront = new Vector3(0, 0, 1);
    this.humanoid = humanoid;
    this.applier = applier;
    this._yaw = 0;
    this._pitch = 0;
    this._needsUpdate = true;
    this._restHeadWorldQuaternion = this.getLookAtWorldQuaternion(new Quaternion());
  }
  /**
   * Its current angle around Y axis, in degree.
   */
  get yaw() {
    return this._yaw;
  }
  /**
   * Its current angle around Y axis, in degree.
   */
  set yaw(value) {
    this._yaw = value;
    this._needsUpdate = true;
  }
  /**
   * Its current angle around X axis, in degree.
   */
  get pitch() {
    return this._pitch;
  }
  /**
   * Its current angle around X axis, in degree.
   */
  set pitch(value) {
    this._pitch = value;
    this._needsUpdate = true;
  }
  /**
   * @deprecated Use {@link getEuler} instead.
   */
  get euler() {
    console.warn("VRMLookAt: euler is deprecated. use getEuler() instead.");
    return this.getEuler(new Euler());
  }
  /**
   * Get its yaw-pitch angles as an `Euler`.
   * Does NOT consider {@link faceFront}; it returns `Euler(0, 0, 0; "YXZ")` by default regardless of the faceFront value.
   *
   * @param target The target euler
   */
  getEuler(target) {
    return target.set(MathUtils.DEG2RAD * this._pitch, MathUtils.DEG2RAD * this._yaw, 0, "YXZ");
  }
  /**
   * Copy the given {@link VRMLookAt} into this one.
   * {@link humanoid} must be same as the source one.
   * {@link applier} will reference the same instance as the source one.
   * @param source The {@link VRMLookAt} you want to copy
   * @returns this
   */
  copy(source) {
    if (this.humanoid !== source.humanoid) {
      throw new Error("VRMLookAt: humanoid must be same in order to copy");
    }
    this.offsetFromHeadBone.copy(source.offsetFromHeadBone);
    this.applier = source.applier;
    this.autoUpdate = source.autoUpdate;
    this.target = source.target;
    this.faceFront.copy(source.faceFront);
    return this;
  }
  /**
   * Returns a clone of this {@link VRMLookAt}.
   * Note that {@link humanoid} and {@link applier} will reference the same instance as this one.
   * @returns Copied {@link VRMLookAt}
   */
  clone() {
    return new VRMLookAt(this.humanoid, this.applier).copy(this);
  }
  /**
   * Reset the lookAt direction (yaw and pitch) to the initial direction.
   */
  reset() {
    this._yaw = 0;
    this._pitch = 0;
    this._needsUpdate = true;
  }
  /**
   * Get its lookAt position in world coordinate.
   *
   * @param target A target `THREE.Vector3`
   */
  getLookAtWorldPosition(target) {
    const head = this.humanoid.getRawBoneNode("head");
    return target.copy(this.offsetFromHeadBone).applyMatrix4(head.matrixWorld);
  }
  /**
   * Get its lookAt rotation in world coordinate.
   * Does NOT consider {@link faceFront}.
   *
   * @param target A target `THREE.Quaternion`
   */
  getLookAtWorldQuaternion(target) {
    const head = this.humanoid.getRawBoneNode("head");
    return getWorldQuaternionLite(head, target);
  }
  /**
   * Get a quaternion that rotates the +Z unit vector of the humanoid Head to the {@link faceFront} direction.
   *
   * @param target A target `THREE.Quaternion`
   */
  getFaceFrontQuaternion(target) {
    if (this.faceFront.distanceToSquared(VEC3_POSITIVE_Z$1) < 0.01) {
      return target.copy(this._restHeadWorldQuaternion).invert();
    }
    const [faceFrontAzimuth, faceFrontAltitude] = calcAzimuthAltitude(this.faceFront);
    _eulerA$1.set(0, 0.5 * Math.PI + faceFrontAzimuth, faceFrontAltitude, "YZX");
    return target.setFromEuler(_eulerA$1).premultiply(_quatD.copy(this._restHeadWorldQuaternion).invert());
  }
  /**
   * Get its LookAt direction in world coordinate.
   *
   * @param target A target `THREE.Vector3`
   */
  getLookAtWorldDirection(target) {
    this.getLookAtWorldQuaternion(_quatB$1$1);
    this.getFaceFrontQuaternion(_quatC$1);
    return target.copy(VEC3_POSITIVE_Z$1).applyQuaternion(_quatB$1$1).applyQuaternion(_quatC$1).applyEuler(this.getEuler(_eulerA$1));
  }
  /**
   * Set its lookAt target position.
   *
   * Note that its result will be instantly overwritten if {@link VRMLookAtHead.autoUpdate} is enabled.
   *
   * If you want to track an object continuously, you might want to use {@link target} instead.
   *
   * @param position A target position, in world space
   */
  lookAt(position) {
    const headRotDiffInv = _quatA$1$1.copy(this._restHeadWorldQuaternion).multiply(quatInvertCompat$1(this.getLookAtWorldQuaternion(_quatB$1$1)));
    const headPos = this.getLookAtWorldPosition(_v3B$3);
    const lookAtDir = _v3C$2.copy(position).sub(headPos).applyQuaternion(headRotDiffInv).normalize();
    const [azimuthFrom, altitudeFrom] = calcAzimuthAltitude(this.faceFront);
    const [azimuthTo, altitudeTo] = calcAzimuthAltitude(lookAtDir);
    const yaw = sanitizeAngle(azimuthTo - azimuthFrom);
    const pitch = sanitizeAngle(altitudeFrom - altitudeTo);
    this._yaw = MathUtils.RAD2DEG * yaw;
    this._pitch = MathUtils.RAD2DEG * pitch;
    this._needsUpdate = true;
  }
  /**
   * Update the VRMLookAtHead.
   * If {@link autoUpdate} is enabled, this will make it look at the {@link target}.
   *
   * @param delta deltaTime, it isn't used though. You can use the parameter if you want to use this in your own extended {@link VRMLookAt}.
   */
  update(delta) {
    if (this.target != null && this.autoUpdate) {
      this.lookAt(this.target.getWorldPosition(_v3A$6));
    }
    if (this._needsUpdate) {
      this._needsUpdate = false;
      this.applier.applyYawPitch(this._yaw, this._pitch);
    }
  }
};
VRMLookAt.EULER_ORDER = "YXZ";
var VEC3_POSITIVE_Z = new Vector3(0, 0, 1);
var _quatA$6 = new Quaternion();
var _quatB$3 = new Quaternion();
var _eulerA = new Euler(0, 0, 0, "YXZ");
var VRMLookAtBoneApplier = class {
  /**
   * Create a new {@link VRMLookAtBoneApplier}.
   *
   * @param humanoid A {@link VRMHumanoid}
   * @param rangeMapHorizontalInner A {@link VRMLookAtRangeMap} used for inner transverse direction
   * @param rangeMapHorizontalOuter A {@link VRMLookAtRangeMap} used for outer transverse direction
   * @param rangeMapVerticalDown A {@link VRMLookAtRangeMap} used for down direction
   * @param rangeMapVerticalUp A {@link VRMLookAtRangeMap} used for up direction
   */
  constructor(humanoid, rangeMapHorizontalInner, rangeMapHorizontalOuter, rangeMapVerticalDown, rangeMapVerticalUp) {
    this.humanoid = humanoid;
    this.rangeMapHorizontalInner = rangeMapHorizontalInner;
    this.rangeMapHorizontalOuter = rangeMapHorizontalOuter;
    this.rangeMapVerticalDown = rangeMapVerticalDown;
    this.rangeMapVerticalUp = rangeMapVerticalUp;
    this.faceFront = new Vector3(0, 0, 1);
    this._restQuatLeftEye = new Quaternion();
    this._restQuatRightEye = new Quaternion();
    this._restLeftEyeParentWorldQuat = new Quaternion();
    this._restRightEyeParentWorldQuat = new Quaternion();
    const leftEye = this.humanoid.getRawBoneNode("leftEye");
    const rightEye = this.humanoid.getRawBoneNode("rightEye");
    if (leftEye) {
      this._restQuatLeftEye.copy(leftEye.quaternion);
      getWorldQuaternionLite(leftEye.parent, this._restLeftEyeParentWorldQuat);
    }
    if (rightEye) {
      this._restQuatRightEye.copy(rightEye.quaternion);
      getWorldQuaternionLite(rightEye.parent, this._restRightEyeParentWorldQuat);
    }
  }
  /**
   * Apply the input angle to its associated VRM model.
   *
   * @param yaw Rotation around Y axis, in degree
   * @param pitch Rotation around X axis, in degree
   */
  applyYawPitch(yaw, pitch) {
    const leftEye = this.humanoid.getRawBoneNode("leftEye");
    const rightEye = this.humanoid.getRawBoneNode("rightEye");
    const leftEyeNormalized = this.humanoid.getNormalizedBoneNode("leftEye");
    const rightEyeNormalized = this.humanoid.getNormalizedBoneNode("rightEye");
    if (leftEye) {
      if (pitch < 0) {
        _eulerA.x = -MathUtils.DEG2RAD * this.rangeMapVerticalDown.map(-pitch);
      } else {
        _eulerA.x = MathUtils.DEG2RAD * this.rangeMapVerticalUp.map(pitch);
      }
      if (yaw < 0) {
        _eulerA.y = -MathUtils.DEG2RAD * this.rangeMapHorizontalInner.map(-yaw);
      } else {
        _eulerA.y = MathUtils.DEG2RAD * this.rangeMapHorizontalOuter.map(yaw);
      }
      _quatA$6.setFromEuler(_eulerA);
      this._getWorldFaceFrontQuat(_quatB$3);
      leftEyeNormalized.quaternion.copy(_quatB$3).multiply(_quatA$6).multiply(_quatB$3.invert());
      _quatA$6.copy(this._restLeftEyeParentWorldQuat);
      leftEye.quaternion.copy(leftEyeNormalized.quaternion).multiply(_quatA$6).premultiply(_quatA$6.invert()).multiply(this._restQuatLeftEye);
    }
    if (rightEye) {
      if (pitch < 0) {
        _eulerA.x = -MathUtils.DEG2RAD * this.rangeMapVerticalDown.map(-pitch);
      } else {
        _eulerA.x = MathUtils.DEG2RAD * this.rangeMapVerticalUp.map(pitch);
      }
      if (yaw < 0) {
        _eulerA.y = -MathUtils.DEG2RAD * this.rangeMapHorizontalOuter.map(-yaw);
      } else {
        _eulerA.y = MathUtils.DEG2RAD * this.rangeMapHorizontalInner.map(yaw);
      }
      _quatA$6.setFromEuler(_eulerA);
      this._getWorldFaceFrontQuat(_quatB$3);
      rightEyeNormalized.quaternion.copy(_quatB$3).multiply(_quatA$6).multiply(_quatB$3.invert());
      _quatA$6.copy(this._restRightEyeParentWorldQuat);
      rightEye.quaternion.copy(rightEyeNormalized.quaternion).multiply(_quatA$6).premultiply(_quatA$6.invert()).multiply(this._restQuatRightEye);
    }
  }
  /**
   * @deprecated Use {@link applyYawPitch} instead.
   */
  lookAt(euler) {
    console.warn("VRMLookAtBoneApplier: lookAt() is deprecated. use apply() instead.");
    const yaw = MathUtils.RAD2DEG * euler.y;
    const pitch = MathUtils.RAD2DEG * euler.x;
    this.applyYawPitch(yaw, pitch);
  }
  /**
   * Get a quaternion that rotates the world-space +Z unit vector to the {@link faceFront} direction.
   *
   * @param target A target `THREE.Quaternion`
   */
  _getWorldFaceFrontQuat(target) {
    if (this.faceFront.distanceToSquared(VEC3_POSITIVE_Z) < 0.01) {
      return target.identity();
    }
    const [faceFrontAzimuth, faceFrontAltitude] = calcAzimuthAltitude(this.faceFront);
    _eulerA.set(0, 0.5 * Math.PI + faceFrontAzimuth, faceFrontAltitude, "YZX");
    return target.setFromEuler(_eulerA);
  }
};
VRMLookAtBoneApplier.type = "bone";
var VRMLookAtExpressionApplier = class {
  /**
   * Create a new {@link VRMLookAtExpressionApplier}.
   *
   * @param expressions A {@link VRMExpressionManager}
   * @param rangeMapHorizontalInner A {@link VRMLookAtRangeMap} used for inner transverse direction
   * @param rangeMapHorizontalOuter A {@link VRMLookAtRangeMap} used for outer transverse direction
   * @param rangeMapVerticalDown A {@link VRMLookAtRangeMap} used for down direction
   * @param rangeMapVerticalUp A {@link VRMLookAtRangeMap} used for up direction
   */
  constructor(expressions, rangeMapHorizontalInner, rangeMapHorizontalOuter, rangeMapVerticalDown, rangeMapVerticalUp) {
    this.expressions = expressions;
    this.rangeMapHorizontalInner = rangeMapHorizontalInner;
    this.rangeMapHorizontalOuter = rangeMapHorizontalOuter;
    this.rangeMapVerticalDown = rangeMapVerticalDown;
    this.rangeMapVerticalUp = rangeMapVerticalUp;
  }
  /**
   * Apply the input angle to its associated VRM model.
   *
   * @param yaw Rotation around Y axis, in degree
   * @param pitch Rotation around X axis, in degree
   */
  applyYawPitch(yaw, pitch) {
    if (pitch < 0) {
      this.expressions.setValue("lookDown", 0);
      this.expressions.setValue("lookUp", this.rangeMapVerticalUp.map(-pitch));
    } else {
      this.expressions.setValue("lookUp", 0);
      this.expressions.setValue("lookDown", this.rangeMapVerticalDown.map(pitch));
    }
    if (yaw < 0) {
      this.expressions.setValue("lookLeft", 0);
      this.expressions.setValue("lookRight", this.rangeMapHorizontalOuter.map(-yaw));
    } else {
      this.expressions.setValue("lookRight", 0);
      this.expressions.setValue("lookLeft", this.rangeMapHorizontalOuter.map(yaw));
    }
  }
  /**
   * @deprecated Use {@link applyYawPitch} instead.
   */
  lookAt(euler) {
    console.warn("VRMLookAtBoneApplier: lookAt() is deprecated. use apply() instead.");
    const yaw = MathUtils.RAD2DEG * euler.y;
    const pitch = MathUtils.RAD2DEG * euler.x;
    this.applyYawPitch(yaw, pitch);
  }
};
VRMLookAtExpressionApplier.type = "expression";
var VRMLookAtRangeMap = class {
  /**
   * Create a new {@link VRMLookAtRangeMap}.
   *
   * @param inputMaxValue The {@link inputMaxValue} of the map
   * @param outputScale The {@link outputScale} of the map
   */
  constructor(inputMaxValue, outputScale) {
    this.inputMaxValue = inputMaxValue;
    this.outputScale = outputScale;
  }
  /**
   * Evaluate an input value and output a mapped value.
   * @param src The input value
   */
  map(src) {
    return this.outputScale * saturate(src / this.inputMaxValue);
  }
};
var POSSIBLE_SPEC_VERSIONS$1$1 = /* @__PURE__ */ new Set(["1.0", "1.0-beta"]);
var VRMLookAtLoaderPlugin = class {
  constructor(parser, options) {
    this.parser = parser;
    this.helperRoot = options === null || options === void 0 ? void 0 : options.helperRoot;
  }
  get name() {
    return "VRMLookAtLoaderPlugin";
  }
  afterRoot(gltf) {
    return __awaiter$6(this, void 0, void 0, function* () {
      const vrmHumanoid = gltf.userData.vrmHumanoid;
      if (vrmHumanoid === null) {
        return;
      } else if (vrmHumanoid === void 0) {
        throw new Error("VRMLookAtLoaderPlugin: vrmHumanoid is undefined. VRMHumanoidLoaderPlugin have to be used first");
      }
      const vrmExpressionManager = gltf.userData.vrmExpressionManager;
      if (vrmExpressionManager === null) {
        return;
      } else if (vrmExpressionManager === void 0) {
        throw new Error("VRMLookAtLoaderPlugin: vrmExpressionManager is undefined. VRMExpressionLoaderPlugin have to be used first");
      }
      gltf.userData.vrmLookAt = yield this._import(gltf, vrmHumanoid, vrmExpressionManager);
    });
  }
  /**
   * Import a {@link VRMLookAt} from a VRM.
   *
   * @param gltf A parsed result of GLTF taken from GLTFLoader
   * @param humanoid A {@link VRMHumanoid} instance that represents the VRM
   * @param expressions A {@link VRMExpressionManager} instance that represents the VRM
   */
  _import(gltf, humanoid, expressions) {
    return __awaiter$6(this, void 0, void 0, function* () {
      if (humanoid == null || expressions == null) {
        return null;
      }
      const v1Result = yield this._v1Import(gltf, humanoid, expressions);
      if (v1Result) {
        return v1Result;
      }
      const v0Result = yield this._v0Import(gltf, humanoid, expressions);
      if (v0Result) {
        return v0Result;
      }
      return null;
    });
  }
  _v1Import(gltf, humanoid, expressions) {
    var _a, _b, _c;
    return __awaiter$6(this, void 0, void 0, function* () {
      const json = this.parser.json;
      const isVRMUsed = ((_a = json.extensionsUsed) === null || _a === void 0 ? void 0 : _a.indexOf("VRMC_vrm")) !== -1;
      if (!isVRMUsed) {
        return null;
      }
      const extension = (_b = json.extensions) === null || _b === void 0 ? void 0 : _b["VRMC_vrm"];
      if (!extension) {
        return null;
      }
      const specVersion = extension.specVersion;
      if (!POSSIBLE_SPEC_VERSIONS$1$1.has(specVersion)) {
        console.warn(`VRMLookAtLoaderPlugin: Unknown VRMC_vrm specVersion "${specVersion}"`);
        return null;
      }
      const schemaLookAt = extension.lookAt;
      if (!schemaLookAt) {
        return null;
      }
      const defaultOutputScale = schemaLookAt.type === "expression" ? 1 : 10;
      const mapHI = this._v1ImportRangeMap(schemaLookAt.rangeMapHorizontalInner, defaultOutputScale);
      const mapHO = this._v1ImportRangeMap(schemaLookAt.rangeMapHorizontalOuter, defaultOutputScale);
      const mapVD = this._v1ImportRangeMap(schemaLookAt.rangeMapVerticalDown, defaultOutputScale);
      const mapVU = this._v1ImportRangeMap(schemaLookAt.rangeMapVerticalUp, defaultOutputScale);
      let applier;
      if (schemaLookAt.type === "expression") {
        applier = new VRMLookAtExpressionApplier(expressions, mapHI, mapHO, mapVD, mapVU);
      } else {
        applier = new VRMLookAtBoneApplier(humanoid, mapHI, mapHO, mapVD, mapVU);
      }
      const lookAt = this._importLookAt(humanoid, applier);
      lookAt.offsetFromHeadBone.fromArray((_c = schemaLookAt.offsetFromHeadBone) !== null && _c !== void 0 ? _c : [0, 0.06, 0]);
      return lookAt;
    });
  }
  _v1ImportRangeMap(schemaRangeMap, defaultOutputScale) {
    var _a, _b;
    return new VRMLookAtRangeMap((_a = schemaRangeMap === null || schemaRangeMap === void 0 ? void 0 : schemaRangeMap.inputMaxValue) !== null && _a !== void 0 ? _a : 90, (_b = schemaRangeMap === null || schemaRangeMap === void 0 ? void 0 : schemaRangeMap.outputScale) !== null && _b !== void 0 ? _b : defaultOutputScale);
  }
  _v0Import(gltf, humanoid, expressions) {
    var _a, _b, _c, _d;
    return __awaiter$6(this, void 0, void 0, function* () {
      const json = this.parser.json;
      const vrmExt = (_a = json.extensions) === null || _a === void 0 ? void 0 : _a.VRM;
      if (!vrmExt) {
        return null;
      }
      const schemaFirstPerson = vrmExt.firstPerson;
      if (!schemaFirstPerson) {
        return null;
      }
      const defaultOutputScale = schemaFirstPerson.lookAtTypeName === "BlendShape" ? 1 : 10;
      const mapHI = this._v0ImportDegreeMap(schemaFirstPerson.lookAtHorizontalInner, defaultOutputScale);
      const mapHO = this._v0ImportDegreeMap(schemaFirstPerson.lookAtHorizontalOuter, defaultOutputScale);
      const mapVD = this._v0ImportDegreeMap(schemaFirstPerson.lookAtVerticalDown, defaultOutputScale);
      const mapVU = this._v0ImportDegreeMap(schemaFirstPerson.lookAtVerticalUp, defaultOutputScale);
      let applier;
      if (schemaFirstPerson.lookAtTypeName === "BlendShape") {
        applier = new VRMLookAtExpressionApplier(expressions, mapHI, mapHO, mapVD, mapVU);
      } else {
        applier = new VRMLookAtBoneApplier(humanoid, mapHI, mapHO, mapVD, mapVU);
      }
      const lookAt = this._importLookAt(humanoid, applier);
      if (schemaFirstPerson.firstPersonBoneOffset) {
        lookAt.offsetFromHeadBone.set((_b = schemaFirstPerson.firstPersonBoneOffset.x) !== null && _b !== void 0 ? _b : 0, (_c = schemaFirstPerson.firstPersonBoneOffset.y) !== null && _c !== void 0 ? _c : 0.06, -((_d = schemaFirstPerson.firstPersonBoneOffset.z) !== null && _d !== void 0 ? _d : 0));
      } else {
        lookAt.offsetFromHeadBone.set(0, 0.06, 0);
      }
      lookAt.faceFront.set(0, 0, -1);
      if (applier instanceof VRMLookAtBoneApplier) {
        applier.faceFront.set(0, 0, -1);
      }
      return lookAt;
    });
  }
  _v0ImportDegreeMap(schemaDegreeMap, defaultOutputScale) {
    var _a, _b;
    const curve = schemaDegreeMap === null || schemaDegreeMap === void 0 ? void 0 : schemaDegreeMap.curve;
    if (JSON.stringify(curve) !== "[0,0,0,1,1,1,1,0]") {
      console.warn("Curves of LookAtDegreeMap defined in VRM 0.0 are not supported");
    }
    return new VRMLookAtRangeMap((_a = schemaDegreeMap === null || schemaDegreeMap === void 0 ? void 0 : schemaDegreeMap.xRange) !== null && _a !== void 0 ? _a : 90, (_b = schemaDegreeMap === null || schemaDegreeMap === void 0 ? void 0 : schemaDegreeMap.yRange) !== null && _b !== void 0 ? _b : defaultOutputScale);
  }
  _importLookAt(humanoid, applier) {
    const lookAt = new VRMLookAt(humanoid, applier);
    if (this.helperRoot) {
      const helper = new VRMLookAtHelper(lookAt);
      this.helperRoot.add(helper);
      helper.renderOrder = this.helperRoot.renderOrder;
    }
    return lookAt;
  }
};
var VRMLookAtTypeName = {
  Bone: "bone",
  Expression: "expression"
};
function resolveURL(url, path) {
  if (typeof url !== "string" || url === "")
    return "";
  if (/^https?:\/\//i.test(path) && /^\//.test(url)) {
    path = path.replace(/(^https?:\/\/[^/]+).*/i, "$1");
  }
  if (/^(https?:)?\/\//i.test(url))
    return url;
  if (/^data:.*,.*$/i.test(url))
    return url;
  if (/^blob:.*$/i.test(url))
    return url;
  return path + url;
}
var POSSIBLE_SPEC_VERSIONS$5 = /* @__PURE__ */ new Set(["1.0", "1.0-beta"]);
var VRMMetaLoaderPlugin = class {
  constructor(parser, options) {
    var _a, _b, _c;
    this.parser = parser;
    this.needThumbnailImage = (_a = options === null || options === void 0 ? void 0 : options.needThumbnailImage) !== null && _a !== void 0 ? _a : true;
    this.acceptLicenseUrls = (_b = options === null || options === void 0 ? void 0 : options.acceptLicenseUrls) !== null && _b !== void 0 ? _b : ["https://vrm.dev/licenses/1.0/"];
    this.acceptV0Meta = (_c = options === null || options === void 0 ? void 0 : options.acceptV0Meta) !== null && _c !== void 0 ? _c : true;
  }
  get name() {
    return "VRMMetaLoaderPlugin";
  }
  afterRoot(gltf) {
    return __awaiter$6(this, void 0, void 0, function* () {
      gltf.userData.vrmMeta = yield this._import(gltf);
    });
  }
  _import(gltf) {
    return __awaiter$6(this, void 0, void 0, function* () {
      const v1Result = yield this._v1Import(gltf);
      if (v1Result != null) {
        return v1Result;
      }
      const v0Result = yield this._v0Import(gltf);
      if (v0Result != null) {
        return v0Result;
      }
      return null;
    });
  }
  _v1Import(gltf) {
    var _a, _b, _c;
    return __awaiter$6(this, void 0, void 0, function* () {
      const json = this.parser.json;
      const isVRMUsed = ((_a = json.extensionsUsed) === null || _a === void 0 ? void 0 : _a.indexOf("VRMC_vrm")) !== -1;
      if (!isVRMUsed) {
        return null;
      }
      const extension = (_b = json.extensions) === null || _b === void 0 ? void 0 : _b["VRMC_vrm"];
      if (extension == null) {
        return null;
      }
      const specVersion = extension.specVersion;
      if (!POSSIBLE_SPEC_VERSIONS$5.has(specVersion)) {
        console.warn(`VRMMetaLoaderPlugin: Unknown VRMC_vrm specVersion "${specVersion}"`);
        return null;
      }
      const schemaMeta = extension.meta;
      if (!schemaMeta) {
        return null;
      }
      const licenseUrl = schemaMeta.licenseUrl;
      const acceptLicenseUrlsSet = new Set(this.acceptLicenseUrls);
      if (!acceptLicenseUrlsSet.has(licenseUrl)) {
        throw new Error(`VRMMetaLoaderPlugin: The license url "${licenseUrl}" is not accepted`);
      }
      let thumbnailImage = void 0;
      if (this.needThumbnailImage && schemaMeta.thumbnailImage != null) {
        thumbnailImage = (_c = yield this._extractGLTFImage(schemaMeta.thumbnailImage)) !== null && _c !== void 0 ? _c : void 0;
      }
      return {
        metaVersion: "1",
        name: schemaMeta.name,
        version: schemaMeta.version,
        authors: schemaMeta.authors,
        copyrightInformation: schemaMeta.copyrightInformation,
        contactInformation: schemaMeta.contactInformation,
        references: schemaMeta.references,
        thirdPartyLicenses: schemaMeta.thirdPartyLicenses,
        thumbnailImage,
        licenseUrl: schemaMeta.licenseUrl,
        avatarPermission: schemaMeta.avatarPermission,
        allowExcessivelyViolentUsage: schemaMeta.allowExcessivelyViolentUsage,
        allowExcessivelySexualUsage: schemaMeta.allowExcessivelySexualUsage,
        commercialUsage: schemaMeta.commercialUsage,
        allowPoliticalOrReligiousUsage: schemaMeta.allowPoliticalOrReligiousUsage,
        allowAntisocialOrHateUsage: schemaMeta.allowAntisocialOrHateUsage,
        creditNotation: schemaMeta.creditNotation,
        allowRedistribution: schemaMeta.allowRedistribution,
        modification: schemaMeta.modification,
        otherLicenseUrl: schemaMeta.otherLicenseUrl
      };
    });
  }
  _v0Import(gltf) {
    var _a;
    return __awaiter$6(this, void 0, void 0, function* () {
      const json = this.parser.json;
      const vrmExt = (_a = json.extensions) === null || _a === void 0 ? void 0 : _a.VRM;
      if (!vrmExt) {
        return null;
      }
      const schemaMeta = vrmExt.meta;
      if (!schemaMeta) {
        return null;
      }
      if (!this.acceptV0Meta) {
        throw new Error("VRMMetaLoaderPlugin: Attempted to load VRM0.0 meta but acceptV0Meta is false");
      }
      let texture;
      if (this.needThumbnailImage && schemaMeta.texture != null && schemaMeta.texture !== -1) {
        texture = yield this.parser.getDependency("texture", schemaMeta.texture);
      }
      return {
        metaVersion: "0",
        allowedUserName: schemaMeta.allowedUserName,
        author: schemaMeta.author,
        commercialUssageName: schemaMeta.commercialUssageName,
        contactInformation: schemaMeta.contactInformation,
        licenseName: schemaMeta.licenseName,
        otherLicenseUrl: schemaMeta.otherLicenseUrl,
        otherPermissionUrl: schemaMeta.otherPermissionUrl,
        reference: schemaMeta.reference,
        sexualUssageName: schemaMeta.sexualUssageName,
        texture: texture !== null && texture !== void 0 ? texture : void 0,
        title: schemaMeta.title,
        version: schemaMeta.version,
        violentUssageName: schemaMeta.violentUssageName
      };
    });
  }
  _extractGLTFImage(index) {
    var _a;
    return __awaiter$6(this, void 0, void 0, function* () {
      const json = this.parser.json;
      const source = (_a = json.images) === null || _a === void 0 ? void 0 : _a[index];
      if (source == null) {
        console.warn(`VRMMetaLoaderPlugin: Attempt to use images[${index}] of glTF as a thumbnail but the image doesn't exist`);
        return null;
      }
      let sourceURI = source.uri;
      if (source.bufferView != null) {
        const bufferView = yield this.parser.getDependency("bufferView", source.bufferView);
        const blob = new Blob([bufferView], { type: source.mimeType });
        sourceURI = URL.createObjectURL(blob);
      }
      if (sourceURI == null) {
        console.warn(`VRMMetaLoaderPlugin: Attempt to use images[${index}] of glTF as a thumbnail but the image couldn't load properly`);
        return null;
      }
      const loader = new ImageLoader();
      return yield loader.loadAsync(resolveURL(sourceURI, this.parser.options.path)).catch((error) => {
        console.error(error);
        console.warn("VRMMetaLoaderPlugin: Failed to load a thumbnail image");
        return null;
      });
    });
  }
};
var VRMCore = class {
  /**
   * Create a new VRM instance.
   *
   * @param params [[VRMParameters]] that represents components of the VRM
   */
  constructor(params) {
    this.scene = params.scene;
    this.meta = params.meta;
    this.humanoid = params.humanoid;
    this.expressionManager = params.expressionManager;
    this.firstPerson = params.firstPerson;
    this.lookAt = params.lookAt;
  }
  /**
   * **You need to call this on your update loop.**
   *
   * This function updates every VRM components.
   *
   * @param delta deltaTime
   */
  update(delta) {
    this.humanoid.update();
    if (this.lookAt) {
      this.lookAt.update(delta);
    }
    if (this.expressionManager) {
      this.expressionManager.update();
    }
  }
};
var VRMCoreLoaderPlugin = class {
  constructor(parser, options) {
    var _a, _b, _c, _d, _e;
    this.parser = parser;
    const helperRoot = options === null || options === void 0 ? void 0 : options.helperRoot;
    const autoUpdateHumanBones = options === null || options === void 0 ? void 0 : options.autoUpdateHumanBones;
    this.expressionPlugin = (_a = options === null || options === void 0 ? void 0 : options.expressionPlugin) !== null && _a !== void 0 ? _a : new VRMExpressionLoaderPlugin(parser);
    this.firstPersonPlugin = (_b = options === null || options === void 0 ? void 0 : options.firstPersonPlugin) !== null && _b !== void 0 ? _b : new VRMFirstPersonLoaderPlugin(parser);
    this.humanoidPlugin = (_c = options === null || options === void 0 ? void 0 : options.humanoidPlugin) !== null && _c !== void 0 ? _c : new VRMHumanoidLoaderPlugin(parser, { helperRoot, autoUpdateHumanBones });
    this.lookAtPlugin = (_d = options === null || options === void 0 ? void 0 : options.lookAtPlugin) !== null && _d !== void 0 ? _d : new VRMLookAtLoaderPlugin(parser, { helperRoot });
    this.metaPlugin = (_e = options === null || options === void 0 ? void 0 : options.metaPlugin) !== null && _e !== void 0 ? _e : new VRMMetaLoaderPlugin(parser);
  }
  get name() {
    return "VRMC_vrm";
  }
  afterRoot(gltf) {
    return __awaiter$6(this, void 0, void 0, function* () {
      yield this.metaPlugin.afterRoot(gltf);
      yield this.humanoidPlugin.afterRoot(gltf);
      yield this.expressionPlugin.afterRoot(gltf);
      yield this.lookAtPlugin.afterRoot(gltf);
      yield this.firstPersonPlugin.afterRoot(gltf);
      const meta = gltf.userData.vrmMeta;
      const humanoid = gltf.userData.vrmHumanoid;
      if (meta && humanoid) {
        const vrmCore = new VRMCore({
          scene: gltf.scene,
          expressionManager: gltf.userData.vrmExpressionManager,
          firstPerson: gltf.userData.vrmFirstPerson,
          humanoid,
          lookAt: gltf.userData.vrmLookAt,
          meta
        });
        gltf.userData.vrmCore = vrmCore;
      }
    });
  }
};
var VRM = class extends VRMCore {
  /**
   * Create a new VRM instance.
   *
   * @param params [[VRMParameters]] that represents components of the VRM
   */
  constructor(params) {
    super(params);
    this.materials = params.materials;
    this.springBoneManager = params.springBoneManager;
    this.nodeConstraintManager = params.nodeConstraintManager;
  }
  /**
   * **You need to call this on your update loop.**
   *
   * This function updates every VRM components.
   *
   * @param delta deltaTime
   */
  update(delta) {
    super.update(delta);
    if (this.nodeConstraintManager) {
      this.nodeConstraintManager.update();
    }
    if (this.springBoneManager) {
      this.springBoneManager.update(delta);
    }
    if (this.materials) {
      this.materials.forEach((material) => {
        if (material.update) {
          material.update(delta);
        }
      });
    }
  }
};
function __awaiter$5(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
function __awaiter$4(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
var vertexShader = "// #define PHONG\n\nvarying vec3 vViewPosition;\n\n#ifndef FLAT_SHADED\n  varying vec3 vNormal;\n#endif\n\n#include <common>\n\n// #include <uv_pars_vertex>\n#ifdef MTOON_USE_UV\n  varying vec2 vUv;\n  uniform mat3 uvTransform;\n#endif\n\n#include <uv2_pars_vertex>\n// #include <displacementmap_pars_vertex>\n// #include <envmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\n\n#ifdef USE_OUTLINEWIDTHMULTIPLYTEXTURE\n  uniform sampler2D outlineWidthMultiplyTexture;\n  uniform mat3 outlineWidthMultiplyTextureUvTransform;\n#endif\n\nuniform float outlineWidthFactor;\n\nvoid main() {\n\n  // #include <uv_vertex>\n  #ifdef MTOON_USE_UV\n    vUv = ( uvTransform * vec3( uv, 1 ) ).xy;\n  #endif\n\n  #include <uv2_vertex>\n  #include <color_vertex>\n\n  #include <beginnormal_vertex>\n  #include <morphnormal_vertex>\n  #include <skinbase_vertex>\n  #include <skinnormal_vertex>\n\n  // we need this to compute the outline properly\n  objectNormal = normalize( objectNormal );\n\n  #include <defaultnormal_vertex>\n\n  #ifndef FLAT_SHADED // Normal computed with derivatives when FLAT_SHADED\n    vNormal = normalize( transformedNormal );\n  #endif\n\n  #include <begin_vertex>\n\n  #include <morphtarget_vertex>\n  #include <skinning_vertex>\n  // #include <displacementmap_vertex>\n  #include <project_vertex>\n  #include <logdepthbuf_vertex>\n  #include <clipping_planes_vertex>\n\n  vViewPosition = - mvPosition.xyz;\n\n  float outlineTex = 1.0;\n\n  #ifdef OUTLINE\n    #ifdef USE_OUTLINEWIDTHMULTIPLYTEXTURE\n      vec2 outlineWidthMultiplyTextureUv = ( outlineWidthMultiplyTextureUvTransform * vec3( vUv, 1 ) ).xy;\n      outlineTex = texture2D( outlineWidthMultiplyTexture, outlineWidthMultiplyTextureUv ).g;\n    #endif\n\n    #ifdef OUTLINE_WIDTH_WORLD\n      float worldNormalLength = length( transformedNormal );\n      vec3 outlineOffset = outlineWidthFactor * outlineTex * worldNormalLength * objectNormal;\n      gl_Position = projectionMatrix * modelViewMatrix * vec4( outlineOffset + transformed, 1.0 );\n    #endif\n\n    #ifdef OUTLINE_WIDTH_SCREEN\n      vec3 clipNormal = ( projectionMatrix * modelViewMatrix * vec4( objectNormal, 0.0 ) ).xyz;\n      vec2 projectedNormal = normalize( clipNormal.xy );\n      projectedNormal.x *= projectionMatrix[ 0 ].x / projectionMatrix[ 1 ].y;\n      gl_Position.xy += 2.0 * outlineWidthFactor * outlineTex * projectedNormal.xy;\n    #endif\n\n    gl_Position.z += 1E-6 * gl_Position.w; // anti-artifact magic\n  #endif\n\n  #include <worldpos_vertex>\n  // #include <envmap_vertex>\n  #include <shadowmap_vertex>\n  #include <fog_vertex>\n\n}";
var fragmentShader = '// #define PHONG\n\nuniform vec3 litFactor;\n\nuniform float opacity;\n\nuniform vec3 shadeColorFactor;\n#ifdef USE_SHADEMULTIPLYTEXTURE\n  uniform sampler2D shadeMultiplyTexture;\n  uniform mat3 shadeMultiplyTextureUvTransform;\n#endif\n\nuniform float shadingShiftFactor;\nuniform float shadingToonyFactor;\n\n#ifdef USE_SHADINGSHIFTTEXTURE\n  uniform sampler2D shadingShiftTexture;\n  uniform mat3 shadingShiftTextureUvTransform;\n  uniform float shadingShiftTextureScale;\n#endif\n\nuniform float giEqualizationFactor;\n\nuniform vec3 parametricRimColorFactor;\n#ifdef USE_RIMMULTIPLYTEXTURE\n  uniform sampler2D rimMultiplyTexture;\n  uniform mat3 rimMultiplyTextureUvTransform;\n#endif\nuniform float rimLightingMixFactor;\nuniform float parametricRimFresnelPowerFactor;\nuniform float parametricRimLiftFactor;\n\n#ifdef USE_MATCAPTEXTURE\n  uniform vec3 matcapFactor;\n  uniform sampler2D matcapTexture;\n  uniform mat3 matcapTextureUvTransform;\n#endif\n\nuniform vec3 emissive;\nuniform float emissiveIntensity;\n\nuniform vec3 outlineColorFactor;\nuniform float outlineLightingMixFactor;\n\n#ifdef USE_UVANIMATIONMASKTEXTURE\n  uniform sampler2D uvAnimationMaskTexture;\n  uniform mat3 uvAnimationMaskTextureUvTransform;\n#endif\n\nuniform float uvAnimationScrollXOffset;\nuniform float uvAnimationScrollYOffset;\nuniform float uvAnimationRotationPhase;\n\n#include <common>\n#include <packing>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n\n// #include <uv_pars_fragment>\n#if ( defined( MTOON_USE_UV ) && !defined( MTOON_UVS_VERTEX_ONLY ) )\n  varying vec2 vUv;\n#endif\n\n#include <uv2_pars_fragment>\n#include <map_pars_fragment>\n\n#ifdef USE_MAP\n  uniform mat3 mapUvTransform;\n#endif\n\n// #include <alphamap_pars_fragment>\n\n#if THREE_VRM_THREE_REVISION >= 132\n  #include <alphatest_pars_fragment>\n#endif\n\n#include <aomap_pars_fragment>\n// #include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n\n#ifdef USE_EMISSIVEMAP\n  uniform mat3 emissiveMapUvTransform;\n#endif\n\n// #include <envmap_common_pars_fragment>\n// #include <envmap_pars_fragment>\n// #include <cube_uv_reflection_fragment>\n#include <fog_pars_fragment>\n\n// #include <bsdfs>\nvec3 BRDF_Lambert( const in vec3 diffuseColor ) {\n  return RECIPROCAL_PI * diffuseColor;\n}\n\n#include <lights_pars_begin>\n\n#if THREE_VRM_THREE_REVISION >= 132\n  #include <normal_pars_fragment>\n#endif\n\n// #include <lights_phong_pars_fragment>\nvarying vec3 vViewPosition;\n\n#if THREE_VRM_THREE_REVISION < 132\n  #ifndef FLAT_SHADED\n    varying vec3 vNormal;\n  #endif\n#endif\n\nstruct MToonMaterial {\n  vec3 diffuseColor;\n  vec3 shadeColor;\n  float shadingShift;\n};\n\nfloat linearstep( float a, float b, float t ) {\n  return clamp( ( t - a ) / ( b - a ), 0.0, 1.0 );\n}\n\n/**\n * Convert NdotL into toon shading factor using shadingShift and shadingToony\n */\nfloat getShading(\n  const in float dotNL,\n  const in float shadow,\n  const in float shadingShift\n) {\n  float shading = dotNL;\n  shading = shading + shadingShift;\n  shading = linearstep( -1.0 + shadingToonyFactor, 1.0 - shadingToonyFactor, shading );\n  shading *= shadow;\n  return shading;\n}\n\n/**\n * Mix diffuseColor and shadeColor using shading factor and light color\n */\nvec3 getDiffuse(\n  const in MToonMaterial material,\n  const in float shading,\n  in vec3 lightColor\n) {\n  #ifdef DEBUG_LITSHADERATE\n    return vec3( BRDF_Lambert( shading * lightColor ) );\n  #endif\n\n  #if THREE_VRM_THREE_REVISION < 132\n    #ifndef PHYSICALLY_CORRECT_LIGHTS\n      lightColor *= PI;\n    #endif\n  #endif\n\n  vec3 col = lightColor * BRDF_Lambert( mix( material.shadeColor, material.diffuseColor, shading ) );\n\n  // The "comment out if you want to PBR absolutely" line\n  #ifdef V0_COMPAT_SHADE\n    col = min( col, material.diffuseColor );\n  #endif\n\n  return col;\n}\n\nvoid RE_Direct_MToon( const in IncidentLight directLight, const in GeometricContext geometry, const in MToonMaterial material, const in float shadow, inout ReflectedLight reflectedLight ) {\n  float dotNL = saturate( dot( geometry.normal, directLight.direction ) );\n  vec3 irradiance = directLight.color;\n\n  #if THREE_VRM_THREE_REVISION < 132\n    #ifndef PHYSICALLY_CORRECT_LIGHTS\n      irradiance *= PI;\n    #endif\n  #endif\n\n  // directSpecular will be used for rim lighting, not an actual specular\n  reflectedLight.directSpecular += irradiance;\n\n  irradiance *= dotNL;\n\n  float shading = getShading( dotNL, shadow, material.shadingShift );\n\n  // toon shaded diffuse\n  reflectedLight.directDiffuse += getDiffuse( material, shading, directLight.color );\n}\n\nvoid RE_IndirectDiffuse_MToon( const in vec3 irradiance, const in GeometricContext geometry, const in MToonMaterial material, inout ReflectedLight reflectedLight ) {\n  // indirect diffuse will use diffuseColor, no shadeColor involved\n  reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n\n  // directSpecular will be used for rim lighting, not an actual specular\n  reflectedLight.directSpecular += irradiance;\n}\n\n#define RE_Direct RE_Direct_MToon\n#define RE_IndirectDiffuse RE_IndirectDiffuse_MToon\n#define Material_LightProbeLOD( material ) (0)\n\n#include <shadowmap_pars_fragment>\n// #include <bumpmap_pars_fragment>\n\n// #include <normalmap_pars_fragment>\n#ifdef USE_NORMALMAP\n\n  uniform sampler2D normalMap;\n  uniform mat3 normalMapUvTransform;\n  uniform vec2 normalScale;\n\n#endif\n\n#ifdef OBJECTSPACE_NORMALMAP\n\n  uniform mat3 normalMatrix;\n\n#endif\n\n#if ! defined ( USE_TANGENT ) && defined ( TANGENTSPACE_NORMALMAP )\n\n  // Per-Pixel Tangent Space Normal Mapping\n  // http://hacksoflife.blogspot.ch/2009/11/per-pixel-tangent-space-normal-mapping.html\n\n  // three-vrm specific change: it requires `uv` as an input in order to support uv scrolls\n\n  // Temporary compat against shader change @ Three.js r126\n  // See: #21205, #21307, #21299\n  #if THREE_VRM_THREE_REVISION >= 126\n\n    vec3 perturbNormal2Arb( vec2 uv, vec3 eye_pos, vec3 surf_norm, vec3 mapN, float faceDirection ) {\n\n      vec3 q0 = vec3( dFdx( eye_pos.x ), dFdx( eye_pos.y ), dFdx( eye_pos.z ) );\n      vec3 q1 = vec3( dFdy( eye_pos.x ), dFdy( eye_pos.y ), dFdy( eye_pos.z ) );\n      vec2 st0 = dFdx( uv.st );\n      vec2 st1 = dFdy( uv.st );\n\n      vec3 N = normalize( surf_norm );\n\n      vec3 q1perp = cross( q1, N );\n      vec3 q0perp = cross( N, q0 );\n\n      vec3 T = q1perp * st0.x + q0perp * st1.x;\n      vec3 B = q1perp * st0.y + q0perp * st1.y;\n\n      // three-vrm specific change: Workaround for the issue that happens when delta of uv = 0.0\n      // TODO: Is this still required? Or shall I make a PR about it?\n      if ( length( T ) == 0.0 || length( B ) == 0.0 ) {\n        return surf_norm;\n      }\n\n      float det = max( dot( T, T ), dot( B, B ) );\n      float scale = ( det == 0.0 ) ? 0.0 : faceDirection * inversesqrt( det );\n\n      return normalize( T * ( mapN.x * scale ) + B * ( mapN.y * scale ) + N * mapN.z );\n\n    }\n\n  #else\n\n    vec3 perturbNormal2Arb( vec2 uv, vec3 eye_pos, vec3 surf_norm, vec3 mapN ) {\n\n      // Workaround for Adreno 3XX dFd*( vec3 ) bug. See #9988\n\n      vec3 q0 = vec3( dFdx( eye_pos.x ), dFdx( eye_pos.y ), dFdx( eye_pos.z ) );\n      vec3 q1 = vec3( dFdy( eye_pos.x ), dFdy( eye_pos.y ), dFdy( eye_pos.z ) );\n      vec2 st0 = dFdx( uv.st );\n      vec2 st1 = dFdy( uv.st );\n\n      float scale = sign( st1.t * st0.s - st0.t * st1.s ); // we do not care about the magnitude\n\n      vec3 S = ( q0 * st1.t - q1 * st0.t ) * scale;\n      vec3 T = ( - q0 * st1.s + q1 * st0.s ) * scale;\n\n      // three-vrm specific change: Workaround for the issue that happens when delta of uv = 0.0\n      // TODO: Is this still required? Or shall I make a PR about it?\n\n      if ( length( S ) == 0.0 || length( T ) == 0.0 ) {\n        return surf_norm;\n      }\n\n      S = normalize( S );\n      T = normalize( T );\n      vec3 N = normalize( surf_norm );\n\n      #ifdef DOUBLE_SIDED\n\n        // Workaround for Adreno GPUs gl_FrontFacing bug. See #15850 and #10331\n\n        bool frontFacing = dot( cross( S, T ), N ) > 0.0;\n\n        mapN.xy *= ( float( frontFacing ) * 2.0 - 1.0 );\n\n      #else\n\n        mapN.xy *= ( float( gl_FrontFacing ) * 2.0 - 1.0 );\n\n      #endif\n\n      mat3 tsn = mat3( S, T, N );\n      return normalize( tsn * mapN );\n\n    }\n\n  #endif\n\n#endif\n\n// #include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\n\n// == post correction ==========================================================\nvoid postCorrection() {\n  #include <tonemapping_fragment>\n  #include <encodings_fragment>\n  #include <fog_fragment>\n  #include <premultiplied_alpha_fragment>\n  #include <dithering_fragment>\n}\n\n// == main procedure ===========================================================\nvoid main() {\n  #include <clipping_planes_fragment>\n\n  vec2 uv = vec2(0.5, 0.5);\n\n  #if ( defined( MTOON_USE_UV ) && !defined( MTOON_UVS_VERTEX_ONLY ) )\n    uv = vUv;\n\n    float uvAnimMask = 1.0;\n    #ifdef USE_UVANIMATIONMASKTEXTURE\n      vec2 uvAnimationMaskTextureUv = ( uvAnimationMaskTextureUvTransform * vec3( uv, 1 ) ).xy;\n      uvAnimMask = texture2D( uvAnimationMaskTexture, uvAnimationMaskTextureUv ).b;\n    #endif\n\n    uv = uv + vec2( uvAnimationScrollXOffset, uvAnimationScrollYOffset ) * uvAnimMask;\n    float uvRotCos = cos( uvAnimationRotationPhase * uvAnimMask );\n    float uvRotSin = sin( uvAnimationRotationPhase * uvAnimMask );\n    uv = mat2( uvRotCos, -uvRotSin, uvRotSin, uvRotCos ) * ( uv - 0.5 ) + 0.5;\n  #endif\n\n  #ifdef DEBUG_UV\n    gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );\n    #if ( defined( MTOON_USE_UV ) && !defined( MTOON_UVS_VERTEX_ONLY ) )\n      gl_FragColor = vec4( uv, 0.0, 1.0 );\n    #endif\n    return;\n  #endif\n\n  vec4 diffuseColor = vec4( litFactor, opacity );\n  ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n  vec3 totalEmissiveRadiance = emissive * emissiveIntensity;\n\n  #include <logdepthbuf_fragment>\n\n  // #include <map_fragment>\n  #ifdef USE_MAP\n    vec2 mapUv = ( mapUvTransform * vec3( uv, 1 ) ).xy;\n    #if THREE_VRM_THREE_REVISION >= 137\n      vec4 sampledDiffuseColor = texture2D( map, mapUv );\n      #ifdef DECODE_VIDEO_TEXTURE\n        sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );\n      #endif\n      diffuseColor *= sampledDiffuseColor;\n    #else\n      // COMPAT: pre-r137\n      vec4 texelColor = texture2D( map, mapUv );\n      texelColor = mapTexelToLinear( texelColor );\n      diffuseColor *= texelColor;\n    #endif\n  #endif\n\n  // #include <color_fragment>\n  #if ( defined( USE_COLOR ) && !defined( IGNORE_VERTEX_COLOR ) )\n    diffuseColor.rgb *= vColor;\n  #endif\n\n  // #include <alphamap_fragment>\n\n  #include <alphatest_fragment>\n\n  // #include <specularmap_fragment>\n  #include <normal_fragment_begin>\n\n  #ifdef OUTLINE\n    normal *= -1.0;\n  #endif\n\n  // #include <normal_fragment_maps>\n\n  #ifdef OBJECTSPACE_NORMALMAP\n\n    vec2 normalMapUv = ( normalMapUvTransform * vec3( uv, 1 ) ).xy;\n    normal = texture2D( normalMap, normalMapUv ).xyz * 2.0 - 1.0; // overrides both flatShading and attribute normals\n\n    #ifdef FLIP_SIDED\n\n      normal = - normal;\n\n    #endif\n\n    #ifdef DOUBLE_SIDED\n\n      // Temporary compat against shader change @ Three.js r126\n      // See: #21205, #21307, #21299\n      #if THREE_VRM_THREE_REVISION >= 126\n\n        normal = normal * faceDirection;\n\n      #else\n\n        normal = normal * ( float( gl_FrontFacing ) * 2.0 - 1.0 );\n\n      #endif\n\n    #endif\n\n    normal = normalize( normalMatrix * normal );\n\n  #elif defined( TANGENTSPACE_NORMALMAP )\n\n    vec2 normalMapUv = ( normalMapUvTransform * vec3( uv, 1 ) ).xy;\n    vec3 mapN = texture2D( normalMap, normalMapUv ).xyz * 2.0 - 1.0;\n    mapN.xy *= normalScale;\n\n    #ifdef USE_TANGENT\n\n      normal = normalize( vTBN * mapN );\n\n    #else\n\n      // Temporary compat against shader change @ Three.js r126\n      // See: #21205, #21307, #21299\n      #if THREE_VRM_THREE_REVISION >= 126\n\n        normal = perturbNormal2Arb( uv, -vViewPosition, normal, mapN, faceDirection );\n\n      #else\n\n        normal = perturbNormal2Arb( uv, -vViewPosition, normal, mapN );\n\n      #endif\n\n    #endif\n\n  #endif\n\n  // #include <emissivemap_fragment>\n  #ifdef USE_EMISSIVEMAP\n    vec2 emissiveMapUv = ( emissiveMapUvTransform * vec3( uv, 1 ) ).xy;\n    #if THREE_VRM_THREE_REVISION >= 137\n      totalEmissiveRadiance *= texture2D( emissiveMap, emissiveMapUv ).rgb;\n    #else\n      // COMPAT: pre-r137\n      totalEmissiveRadiance *= emissiveMapTexelToLinear( texture2D( emissiveMap, emissiveMapUv ) ).rgb;\n    #endif\n  #endif\n\n  #ifdef DEBUG_NORMAL\n    gl_FragColor = vec4( 0.5 + 0.5 * normal, 1.0 );\n    return;\n  #endif\n\n  // -- MToon: lighting --------------------------------------------------------\n  // accumulation\n  // #include <lights_phong_fragment>\n  MToonMaterial material;\n\n  material.diffuseColor = diffuseColor.rgb;\n\n  material.shadeColor = shadeColorFactor;\n  #ifdef USE_SHADEMULTIPLYTEXTURE\n    vec2 shadeMultiplyTextureUv = ( shadeMultiplyTextureUvTransform * vec3( uv, 1 ) ).xy;\n    #if THREE_VRM_THREE_REVISION >= 137\n      material.shadeColor *= texture2D( shadeMultiplyTexture, shadeMultiplyTextureUv ).rgb;\n    #else\n      // COMPAT: pre-r137\n      material.shadeColor *= shadeMultiplyTextureTexelToLinear( texture2D( shadeMultiplyTexture, shadeMultiplyTextureUv) ).rgb;\n    #endif\n  #endif\n\n  #if ( defined( USE_COLOR ) && !defined( IGNORE_VERTEX_COLOR ) )\n    material.shadeColor.rgb *= vColor;\n  #endif\n\n  material.shadingShift = shadingShiftFactor;\n  #ifdef USE_SHADINGSHIFTTEXTURE\n    vec2 shadingShiftTextureUv = ( shadingShiftTextureUvTransform * vec3( uv, 1 ) ).xy;\n    material.shadingShift += texture2D( shadingShiftTexture, shadingShiftTextureUv ).r * shadingShiftTextureScale;\n  #endif\n\n  // #include <lights_fragment_begin>\n\n  // MToon Specific changes:\n  // Since we want to take shadows into account of shading instead of irradiance,\n  // we had to modify the codes that multiplies the results of shadowmap into color of direct lights.\n\n  GeometricContext geometry;\n\n  geometry.position = - vViewPosition;\n  geometry.normal = normal;\n  geometry.viewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );\n\n  #ifdef CLEARCOAT\n\n    geometry.clearcoatNormal = clearcoatNormal;\n\n  #endif\n\n  IncidentLight directLight;\n\n  // since these variables will be used in unrolled loop, we have to define in prior\n  float shadow;\n\n  #if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )\n\n    PointLight pointLight;\n    #if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0\n    PointLightShadow pointLightShadow;\n    #endif\n\n    #pragma unroll_loop_start\n    for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {\n\n      pointLight = pointLights[ i ];\n\n      #if THREE_VRM_THREE_REVISION >= 132\n        getPointLightInfo( pointLight, geometry, directLight );\n      #else\n        getPointDirectLightIrradiance( pointLight, geometry, directLight );\n      #endif\n\n      shadow = 1.0;\n      #if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )\n      pointLightShadow = pointLightShadows[ i ];\n      shadow = all( bvec2( directLight.visible, receiveShadow ) ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;\n      #endif\n\n      RE_Direct( directLight, geometry, material, shadow, reflectedLight );\n\n    }\n    #pragma unroll_loop_end\n\n  #endif\n\n  #if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )\n\n    SpotLight spotLight;\n    #if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0\n    SpotLightShadow spotLightShadow;\n    #endif\n\n    #pragma unroll_loop_start\n    for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {\n\n      spotLight = spotLights[ i ];\n\n      #if THREE_VRM_THREE_REVISION >= 132\n        getSpotLightInfo( spotLight, geometry, directLight );\n      #else\n        getSpotDirectLightIrradiance( spotLight, geometry, directLight );\n      #endif\n\n      shadow = 1.0;\n      #if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )\n      spotLightShadow = spotLightShadows[ i ];\n      shadow = all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotShadowCoord[ i ] ) : 1.0;\n      #endif\n\n      RE_Direct( directLight, geometry, material, shadow, reflectedLight );\n\n    }\n    #pragma unroll_loop_end\n\n  #endif\n\n  #if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )\n\n    DirectionalLight directionalLight;\n    #if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0\n    DirectionalLightShadow directionalLightShadow;\n    #endif\n\n    #pragma unroll_loop_start\n    for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {\n\n      directionalLight = directionalLights[ i ];\n\n      #if THREE_VRM_THREE_REVISION >= 132\n        getDirectionalLightInfo( directionalLight, geometry, directLight );\n      #else\n        getDirectionalDirectLightIrradiance( directionalLight, geometry, directLight );\n      #endif\n\n      shadow = 1.0;\n      #if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )\n      directionalLightShadow = directionalLightShadows[ i ];\n      shadow = all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;\n      #endif\n\n      RE_Direct( directLight, geometry, material, shadow, reflectedLight );\n\n    }\n    #pragma unroll_loop_end\n\n  #endif\n\n  // #if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )\n\n  //   RectAreaLight rectAreaLight;\n\n  //   #pragma unroll_loop_start\n  //   for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {\n\n  //     rectAreaLight = rectAreaLights[ i ];\n  //     RE_Direct_RectArea( rectAreaLight, geometry, material, reflectedLight );\n\n  //   }\n  //   #pragma unroll_loop_end\n\n  // #endif\n\n  #if defined( RE_IndirectDiffuse )\n\n    vec3 iblIrradiance = vec3( 0.0 );\n\n    vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );\n\n    #if THREE_VRM_THREE_REVISION >= 133\n      irradiance += getLightProbeIrradiance( lightProbe, geometry.normal );\n    #else\n      irradiance += getLightProbeIrradiance( lightProbe, geometry );\n    #endif\n\n    #if ( NUM_HEMI_LIGHTS > 0 )\n\n      #pragma unroll_loop_start\n      for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {\n\n        #if THREE_VRM_THREE_REVISION >= 133\n          irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry.normal );\n        #else\n          irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry );\n        #endif\n\n      }\n      #pragma unroll_loop_end\n\n    #endif\n\n  #endif\n\n  // #if defined( RE_IndirectSpecular )\n\n  //   vec3 radiance = vec3( 0.0 );\n  //   vec3 clearcoatRadiance = vec3( 0.0 );\n\n  // #endif\n\n  #include <lights_fragment_maps>\n  #include <lights_fragment_end>\n\n  // modulation\n  #include <aomap_fragment>\n\n  vec3 col = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;\n\n  #ifdef DEBUG_LITSHADERATE\n    gl_FragColor = vec4( col, diffuseColor.a );\n    postCorrection();\n    return;\n  #endif\n\n  // -- MToon: rim lighting -----------------------------------------\n  vec3 viewDir = normalize( vViewPosition );\n\n  #ifndef PHYSICALLY_CORRECT_LIGHTS\n    reflectedLight.directSpecular /= PI;\n  #endif\n  vec3 rimMix = mix( vec3( 1.0 ), reflectedLight.directSpecular, 1.0 );\n\n  vec3 rim = parametricRimColorFactor * pow( saturate( 1.0 - dot( viewDir, normal ) + parametricRimLiftFactor ), parametricRimFresnelPowerFactor );\n\n  #ifdef USE_MATCAPTEXTURE\n    {\n      vec3 x = normalize( vec3( viewDir.z, 0.0, -viewDir.x ) );\n      vec3 y = cross( viewDir, x ); // guaranteed to be normalized\n      vec2 sphereUv = 0.5 + 0.5 * vec2( dot( x, normal ), -dot( y, normal ) );\n      sphereUv = ( matcapTextureUvTransform * vec3( sphereUv, 1 ) ).xy;\n      #if THREE_VRM_THREE_REVISION >= 137\n        vec3 matcap = texture2D( matcapTexture, sphereUv ).rgb;\n      #else\n        // COMPAT: pre-r137\n        vec3 matcap = matcapTextureTexelToLinear( texture2D( matcapTexture, sphereUv ) ).rgb;\n      #endif\n      rim += matcapFactor * matcap;\n    }\n  #endif\n\n  #ifdef USE_RIMMULTIPLYTEXTURE\n    vec2 rimMultiplyTextureUv = ( rimMultiplyTextureUvTransform * vec3( uv, 1 ) ).xy;\n    #if THREE_VRM_THREE_REVISION >= 137\n      rim *= texture2D( rimMultiplyTexture, rimMultiplyTextureUv ).rgb;\n    #else\n      // COMPAT: pre-r137\n      rim *= rimMultiplyTextureTexelToLinear( texture2D( rimMultiplyTexture, rimMultiplyTextureUv ) ).rgb;\n    #endif\n  #endif\n\n  col += rimMix * rim;\n\n  // -- MToon: Emission --------------------------------------------------------\n  col += totalEmissiveRadiance;\n\n  // #include <envmap_fragment>\n\n  // -- Almost done! -----------------------------------------------------------\n  #if defined( OUTLINE )\n    col = outlineColorFactor.rgb * mix( vec3( 1.0 ), col, outlineLightingMixFactor );\n  #endif\n\n  gl_FragColor = vec4( col, diffuseColor.a );\n  postCorrection();\n}\n';
var MToonMaterialDebugMode = {
  /**
   * Render normally.
   */
  None: "none",
  /**
   * Visualize normals of the surface.
   */
  Normal: "normal",
  /**
   * Visualize lit/shade of the surface.
   */
  LitShadeRate: "litShadeRate",
  /**
   * Visualize UV of the surface.
   */
  UV: "uv"
};
var MToonMaterialOutlineWidthMode = {
  None: "none",
  WorldCoordinates: "worldCoordinates",
  ScreenCoordinates: "screenCoordinates"
};
var RGBEEncoding = 3002;
var RGBM7Encoding = 3004;
var RGBM16Encoding = 3005;
var RGBDEncoding = 3006;
var GammaEncoding = 3007;
var getEncodingComponents = (encoding) => {
  if (parseInt(REVISION, 10) >= 136) {
    switch (encoding) {
      case LinearEncoding:
        return ["Linear", "( value )"];
      case sRGBEncoding:
        return ["sRGB", "( value )"];
      default:
        console.warn("THREE.WebGLProgram: Unsupported encoding:", encoding);
        return ["Linear", "( value )"];
    }
  } else {
    switch (encoding) {
      case LinearEncoding:
        return ["Linear", "( value )"];
      case sRGBEncoding:
        return ["sRGB", "( value )"];
      case RGBEEncoding:
        return ["RGBE", "( value )"];
      case RGBM7Encoding:
        return ["RGBM", "( value, 7.0 )"];
      case RGBM16Encoding:
        return ["RGBM", "( value, 16.0 )"];
      case RGBDEncoding:
        return ["RGBD", "( value, 256.0 )"];
      case GammaEncoding:
        return ["Gamma", "( value, float( GAMMA_FACTOR ) )"];
      default:
        throw new Error("unsupported encoding: " + encoding);
    }
  }
};
var getTexelDecodingFunction = (functionName, encoding) => {
  const components = getEncodingComponents(encoding);
  return "vec4 " + functionName + "( vec4 value ) { return " + components[0] + "ToLinear" + components[1] + "; }";
};
function getTextureEncodingFromMap(map, isWebGL2) {
  let encoding;
  if (map && map.isTexture) {
    encoding = map.encoding;
  } else {
    encoding = LinearEncoding;
  }
  if (parseInt(REVISION, 10) >= 133) {
    if (isWebGL2 && map && map.isTexture && map.format === RGBAFormat && map.type === UnsignedByteType && map.encoding === sRGBEncoding) {
      encoding = LinearEncoding;
    }
  }
  return encoding;
}
var MToonMaterial = class extends ShaderMaterial {
  constructor(parameters = {}) {
    super({ vertexShader, fragmentShader });
    this.uvAnimationScrollXSpeedFactor = 0;
    this.uvAnimationScrollYSpeedFactor = 0;
    this.uvAnimationRotationSpeedFactor = 0;
    this.fog = true;
    this.normalMapType = TangentSpaceNormalMap;
    this._ignoreVertexColor = true;
    this._v0CompatShade = false;
    this._debugMode = MToonMaterialDebugMode.None;
    this._outlineWidthMode = MToonMaterialOutlineWidthMode.None;
    this._isOutline = false;
    if (parameters.transparentWithZWrite) {
      parameters.depthWrite = true;
    }
    delete parameters.transparentWithZWrite;
    parameters.fog = true;
    parameters.lights = true;
    parameters.clipping = true;
    if (parseInt(REVISION, 10) < 129) {
      parameters.skinning = parameters.skinning || false;
    }
    if (parseInt(REVISION, 10) < 131) {
      parameters.morphTargets = parameters.morphTargets || false;
      parameters.morphNormals = parameters.morphNormals || false;
    }
    this.uniforms = UniformsUtils.merge([
      UniformsLib.common,
      UniformsLib.normalmap,
      UniformsLib.emissivemap,
      UniformsLib.fog,
      UniformsLib.lights,
      {
        litFactor: { value: new Color(1, 1, 1) },
        mapUvTransform: { value: new Matrix3() },
        colorAlpha: { value: 1 },
        normalMapUvTransform: { value: new Matrix3() },
        shadeColorFactor: { value: new Color(0.97, 0.81, 0.86) },
        shadeMultiplyTexture: { value: null },
        shadeMultiplyTextureUvTransform: { value: new Matrix3() },
        shadingShiftFactor: { value: 0 },
        shadingShiftTexture: { value: null },
        shadingShiftTextureUvTransform: { value: new Matrix3() },
        shadingShiftTextureScale: { value: null },
        shadingToonyFactor: { value: 0.9 },
        giEqualizationFactor: { value: 0.9 },
        matcapFactor: { value: new Color(0, 0, 0) },
        matcapTexture: { value: null },
        matcapTextureUvTransform: { value: new Matrix3() },
        parametricRimColorFactor: { value: new Color(0, 0, 0) },
        rimMultiplyTexture: { value: null },
        rimMultiplyTextureUvTransform: { value: new Matrix3() },
        rimLightingMixFactor: { value: 0 },
        parametricRimFresnelPowerFactor: { value: 1 },
        parametricRimLiftFactor: { value: 0 },
        emissive: { value: new Color(0, 0, 0) },
        emissiveIntensity: { value: 1 },
        emissiveMapUvTransform: { value: new Matrix3() },
        outlineWidthMultiplyTexture: { value: null },
        outlineWidthMultiplyTextureUvTransform: { value: new Matrix3() },
        outlineWidthFactor: { value: 0.5 },
        outlineColorFactor: { value: new Color(0, 0, 0) },
        outlineLightingMixFactor: { value: 1 },
        uvAnimationMaskTexture: { value: null },
        uvAnimationMaskTextureUvTransform: { value: new Matrix3() },
        uvAnimationScrollXOffset: { value: 0 },
        uvAnimationScrollYOffset: { value: 0 },
        uvAnimationRotationPhase: { value: 0 }
      },
      parameters.uniforms
    ]);
    this.setValues(parameters);
    this._uploadUniformsWorkaround();
    this.customProgramCacheKey = () => [
      ...Object.entries(this._generateDefines()).map(([token, macro]) => `${token}:${macro}`),
      this.matcapTexture ? `matcapTextureEncoding:${this.matcapTexture.encoding}` : "",
      this.shadeMultiplyTexture ? `shadeMultiplyTextureEncoding:${this.shadeMultiplyTexture.encoding}` : "",
      this.rimMultiplyTexture ? `rimMultiplyTextureEncoding:${this.rimMultiplyTexture.encoding}` : ""
    ].join(",");
    this.onBeforeCompile = (shader, renderer) => {
      const isWebGL2 = renderer.capabilities.isWebGL2;
      const threeRevision = parseInt(REVISION, 10);
      const defines = Object.entries(Object.assign(Object.assign({}, this._generateDefines()), this.defines)).filter(([token, macro]) => !!macro).map(([token, macro]) => `#define ${token} ${macro}`).join("\n") + "\n";
      let encodings = "";
      if (parseInt(REVISION, 10) < 137) {
        encodings = (this.matcapTexture !== null ? getTexelDecodingFunction("matcapTextureTexelToLinear", getTextureEncodingFromMap(this.matcapTexture, isWebGL2)) + "\n" : "") + (this.shadeMultiplyTexture !== null ? getTexelDecodingFunction("shadeMultiplyTextureTexelToLinear", getTextureEncodingFromMap(this.shadeMultiplyTexture, isWebGL2)) + "\n" : "") + (this.rimMultiplyTexture !== null ? getTexelDecodingFunction("rimMultiplyTextureTexelToLinear", getTextureEncodingFromMap(this.rimMultiplyTexture, isWebGL2)) + "\n" : "");
      }
      shader.vertexShader = defines + shader.vertexShader;
      shader.fragmentShader = defines + encodings + shader.fragmentShader;
      if (threeRevision < 132) {
        shader.fragmentShader = shader.fragmentShader.replace("#include <normal_pars_fragment>", "");
        shader.fragmentShader = shader.fragmentShader.replace("#include <alphatest_pars_fragment>", "");
      }
    };
  }
  get color() {
    return this.uniforms.litFactor.value;
  }
  set color(value) {
    this.uniforms.litFactor.value = value;
  }
  get map() {
    return this.uniforms.map.value;
  }
  set map(value) {
    this.uniforms.map.value = value;
  }
  get normalMap() {
    return this.uniforms.normalMap.value;
  }
  set normalMap(value) {
    this.uniforms.normalMap.value = value;
  }
  get normalScale() {
    return this.uniforms.normalScale.value;
  }
  set normalScale(value) {
    this.uniforms.normalScale.value = value;
  }
  get emissive() {
    return this.uniforms.emissive.value;
  }
  set emissive(value) {
    this.uniforms.emissive.value = value;
  }
  get emissiveIntensity() {
    return this.uniforms.emissiveIntensity.value;
  }
  set emissiveIntensity(value) {
    this.uniforms.emissiveIntensity.value = value;
  }
  get emissiveMap() {
    return this.uniforms.emissiveMap.value;
  }
  set emissiveMap(value) {
    this.uniforms.emissiveMap.value = value;
  }
  get shadeColorFactor() {
    return this.uniforms.shadeColorFactor.value;
  }
  set shadeColorFactor(value) {
    this.uniforms.shadeColorFactor.value = value;
  }
  get shadeMultiplyTexture() {
    return this.uniforms.shadeMultiplyTexture.value;
  }
  set shadeMultiplyTexture(value) {
    this.uniforms.shadeMultiplyTexture.value = value;
  }
  get shadingShiftFactor() {
    return this.uniforms.shadingShiftFactor.value;
  }
  set shadingShiftFactor(value) {
    this.uniforms.shadingShiftFactor.value = value;
  }
  get shadingShiftTexture() {
    return this.uniforms.shadingShiftTexture.value;
  }
  set shadingShiftTexture(value) {
    this.uniforms.shadingShiftTexture.value = value;
  }
  get shadingShiftTextureScale() {
    return this.uniforms.shadingShiftTextureScale.value;
  }
  set shadingShiftTextureScale(value) {
    this.uniforms.shadingShiftTextureScale.value = value;
  }
  get shadingToonyFactor() {
    return this.uniforms.shadingToonyFactor.value;
  }
  set shadingToonyFactor(value) {
    this.uniforms.shadingToonyFactor.value = value;
  }
  get giEqualizationFactor() {
    return this.uniforms.giEqualizationFactor.value;
  }
  set giEqualizationFactor(value) {
    this.uniforms.giEqualizationFactor.value = value;
  }
  get matcapFactor() {
    return this.uniforms.matcapFactor.value;
  }
  set matcapFactor(value) {
    this.uniforms.matcapFactor.value = value;
  }
  get matcapTexture() {
    return this.uniforms.matcapTexture.value;
  }
  set matcapTexture(value) {
    this.uniforms.matcapTexture.value = value;
  }
  get parametricRimColorFactor() {
    return this.uniforms.parametricRimColorFactor.value;
  }
  set parametricRimColorFactor(value) {
    this.uniforms.parametricRimColorFactor.value = value;
  }
  get rimMultiplyTexture() {
    return this.uniforms.rimMultiplyTexture.value;
  }
  set rimMultiplyTexture(value) {
    this.uniforms.rimMultiplyTexture.value = value;
  }
  get rimLightingMixFactor() {
    return this.uniforms.rimLightingMixFactor.value;
  }
  set rimLightingMixFactor(value) {
    this.uniforms.rimLightingMixFactor.value = value;
  }
  get parametricRimFresnelPowerFactor() {
    return this.uniforms.parametricRimFresnelPowerFactor.value;
  }
  set parametricRimFresnelPowerFactor(value) {
    this.uniforms.parametricRimFresnelPowerFactor.value = value;
  }
  get parametricRimLiftFactor() {
    return this.uniforms.parametricRimLiftFactor.value;
  }
  set parametricRimLiftFactor(value) {
    this.uniforms.parametricRimLiftFactor.value = value;
  }
  get outlineWidthMultiplyTexture() {
    return this.uniforms.outlineWidthMultiplyTexture.value;
  }
  set outlineWidthMultiplyTexture(value) {
    this.uniforms.outlineWidthMultiplyTexture.value = value;
  }
  get outlineWidthFactor() {
    return this.uniforms.outlineWidthFactor.value;
  }
  set outlineWidthFactor(value) {
    this.uniforms.outlineWidthFactor.value = value;
  }
  get outlineColorFactor() {
    return this.uniforms.outlineColorFactor.value;
  }
  set outlineColorFactor(value) {
    this.uniforms.outlineColorFactor.value = value;
  }
  get outlineLightingMixFactor() {
    return this.uniforms.outlineLightingMixFactor.value;
  }
  set outlineLightingMixFactor(value) {
    this.uniforms.outlineLightingMixFactor.value = value;
  }
  get uvAnimationMaskTexture() {
    return this.uniforms.uvAnimationMaskTexture.value;
  }
  set uvAnimationMaskTexture(value) {
    this.uniforms.uvAnimationMaskTexture.value = value;
  }
  get uvAnimationScrollXOffset() {
    return this.uniforms.uvAnimationScrollXOffset.value;
  }
  set uvAnimationScrollXOffset(value) {
    this.uniforms.uvAnimationScrollXOffset.value = value;
  }
  get uvAnimationScrollYOffset() {
    return this.uniforms.uvAnimationScrollYOffset.value;
  }
  set uvAnimationScrollYOffset(value) {
    this.uniforms.uvAnimationScrollYOffset.value = value;
  }
  get uvAnimationRotationPhase() {
    return this.uniforms.uvAnimationRotationPhase.value;
  }
  set uvAnimationRotationPhase(value) {
    this.uniforms.uvAnimationRotationPhase.value = value;
  }
  /**
   * When this is `true`, vertex colors will be ignored.
   * `true` by default.
   */
  get ignoreVertexColor() {
    return this._ignoreVertexColor;
  }
  set ignoreVertexColor(value) {
    this._ignoreVertexColor = value;
    this.needsUpdate = true;
  }
  /**
   * There is a line of the shader called "comment out if you want to PBR absolutely" in VRM0.0 MToon.
   * When this is true, the material enables the line to make it compatible with the legacy rendering of VRM.
   * Usually not recommended to turn this on.
   * `false` by default.
   */
  get v0CompatShade() {
    return this._v0CompatShade;
  }
  /**
   * There is a line of the shader called "comment out if you want to PBR absolutely" in VRM0.0 MToon.
   * When this is true, the material enables the line to make it compatible with the legacy rendering of VRM.
   * Usually not recommended to turn this on.
   * `false` by default.
   */
  set v0CompatShade(v) {
    this._v0CompatShade = v;
    this.needsUpdate = true;
  }
  /**
   * Debug mode for the material.
   * You can visualize several components for diagnosis using debug mode.
   *
   * See: {@link MToonMaterialDebugMode}
   */
  get debugMode() {
    return this._debugMode;
  }
  /**
   * Debug mode for the material.
   * You can visualize several components for diagnosis using debug mode.
   *
   * See: {@link MToonMaterialDebugMode}
   */
  set debugMode(m) {
    this._debugMode = m;
    this.needsUpdate = true;
  }
  get outlineWidthMode() {
    return this._outlineWidthMode;
  }
  set outlineWidthMode(m) {
    this._outlineWidthMode = m;
    this.needsUpdate = true;
  }
  get isOutline() {
    return this._isOutline;
  }
  set isOutline(b) {
    this._isOutline = b;
    this.needsUpdate = true;
  }
  /**
   * Readonly boolean that indicates this is a [[MToonMaterial]].
   */
  get isMToonMaterial() {
    return true;
  }
  /**
   * Update this material.
   *
   * @param delta deltaTime since last update
   */
  update(delta) {
    this._uploadUniformsWorkaround();
    this._updateUVAnimation(delta);
  }
  copy(source) {
    super.copy(source);
    this.map = source.map;
    this.normalMap = source.normalMap;
    this.emissiveMap = source.emissiveMap;
    this.shadeMultiplyTexture = source.shadeMultiplyTexture;
    this.shadingShiftTexture = source.shadingShiftTexture;
    this.matcapTexture = source.matcapTexture;
    this.rimMultiplyTexture = source.rimMultiplyTexture;
    this.outlineWidthMultiplyTexture = source.outlineWidthMultiplyTexture;
    this.uvAnimationMaskTexture = source.uvAnimationMaskTexture;
    this.normalMapType = source.normalMapType;
    this.uvAnimationScrollXSpeedFactor = source.uvAnimationScrollXSpeedFactor;
    this.uvAnimationScrollYSpeedFactor = source.uvAnimationScrollYSpeedFactor;
    this.uvAnimationRotationSpeedFactor = source.uvAnimationRotationSpeedFactor;
    this.ignoreVertexColor = source.ignoreVertexColor;
    this.v0CompatShade = source.v0CompatShade;
    this.debugMode = source.debugMode;
    this.outlineWidthMode = source.outlineWidthMode;
    this.isOutline = source.isOutline;
    this.needsUpdate = true;
    return this;
  }
  /**
   * Update UV animation state.
   * Intended to be called via {@link update}.
   * @param delta deltaTime
   */
  _updateUVAnimation(delta) {
    this.uniforms.uvAnimationScrollXOffset.value += delta * this.uvAnimationScrollXSpeedFactor;
    this.uniforms.uvAnimationScrollYOffset.value += delta * this.uvAnimationScrollYSpeedFactor;
    this.uniforms.uvAnimationRotationPhase.value += delta * this.uvAnimationRotationSpeedFactor;
    this.uniformsNeedUpdate = true;
  }
  /**
   * Upload uniforms that need to upload but doesn't automatically because of reasons.
   * Intended to be called via {@link constructor} and {@link update}.
   */
  _uploadUniformsWorkaround() {
    this.uniforms.opacity.value = this.opacity;
    this._updateTextureMatrix(this.uniforms.map, this.uniforms.mapUvTransform);
    this._updateTextureMatrix(this.uniforms.normalMap, this.uniforms.normalMapUvTransform);
    this._updateTextureMatrix(this.uniforms.emissiveMap, this.uniforms.emissiveMapUvTransform);
    this._updateTextureMatrix(this.uniforms.shadeMultiplyTexture, this.uniforms.shadeMultiplyTextureUvTransform);
    this._updateTextureMatrix(this.uniforms.shadingShiftTexture, this.uniforms.shadingShiftTextureUvTransform);
    this._updateTextureMatrix(this.uniforms.matcapTexture, this.uniforms.matcapTextureUvTransform);
    this._updateTextureMatrix(this.uniforms.rimMultiplyTexture, this.uniforms.rimMultiplyTextureUvTransform);
    this._updateTextureMatrix(this.uniforms.outlineWidthMultiplyTexture, this.uniforms.outlineWidthMultiplyTextureUvTransform);
    this._updateTextureMatrix(this.uniforms.uvAnimationMaskTexture, this.uniforms.uvAnimationMaskTextureUvTransform);
    const threeRevision = parseInt(REVISION, 10);
    if (threeRevision >= 132) {
      this.uniforms.alphaTest.value = this.alphaTest;
    }
    this.uniformsNeedUpdate = true;
  }
  /**
   * Returns a map object of preprocessor token and macro of the shader program.
   */
  _generateDefines() {
    const threeRevision = parseInt(REVISION, 10);
    const useUvInVert = this.outlineWidthMultiplyTexture !== null;
    const useUvInFrag = this.map !== null || this.emissiveMap !== null || this.shadeMultiplyTexture !== null || this.shadingShiftTexture !== null || this.rimMultiplyTexture !== null || this.uvAnimationMaskTexture !== null;
    return {
      // Temporary compat against shader change @ Three.js r126
      // See: #21205, #21307, #21299
      THREE_VRM_THREE_REVISION: threeRevision,
      OUTLINE: this._isOutline,
      MTOON_USE_UV: useUvInVert || useUvInFrag,
      MTOON_UVS_VERTEX_ONLY: useUvInVert && !useUvInFrag,
      V0_COMPAT_SHADE: this._v0CompatShade,
      USE_SHADEMULTIPLYTEXTURE: this.shadeMultiplyTexture !== null,
      USE_SHADINGSHIFTTEXTURE: this.shadingShiftTexture !== null,
      USE_MATCAPTEXTURE: this.matcapTexture !== null,
      USE_RIMMULTIPLYTEXTURE: this.rimMultiplyTexture !== null,
      USE_OUTLINEWIDTHMULTIPLYTEXTURE: this._isOutline && this.outlineWidthMultiplyTexture !== null,
      USE_UVANIMATIONMASKTEXTURE: this.uvAnimationMaskTexture !== null,
      IGNORE_VERTEX_COLOR: this._ignoreVertexColor === true,
      DEBUG_NORMAL: this._debugMode === "normal",
      DEBUG_LITSHADERATE: this._debugMode === "litShadeRate",
      DEBUG_UV: this._debugMode === "uv",
      OUTLINE_WIDTH_WORLD: this._isOutline && this._outlineWidthMode === MToonMaterialOutlineWidthMode.WorldCoordinates,
      OUTLINE_WIDTH_SCREEN: this._isOutline && this._outlineWidthMode === MToonMaterialOutlineWidthMode.ScreenCoordinates
    };
  }
  _updateTextureMatrix(src, dst) {
    if (src.value) {
      if (src.value.matrixAutoUpdate) {
        src.value.updateMatrix();
      }
      dst.value.copy(src.value.matrix);
    }
  }
};
var GLTFMToonMaterialParamsAssignHelper = class {
  constructor(parser, materialParams) {
    this._parser = parser;
    this._materialParams = materialParams;
    this._pendings = [];
  }
  get pending() {
    return Promise.all(this._pendings);
  }
  assignPrimitive(key, value) {
    if (value != null) {
      this._materialParams[key] = value;
    }
  }
  assignColor(key, value, convertSRGBToLinear) {
    if (value != null) {
      this._materialParams[key] = new Color().fromArray(value);
      if (convertSRGBToLinear) {
        this._materialParams[key].convertSRGBToLinear();
      }
    }
  }
  assignTexture(key, texture, isColorTexture) {
    return __awaiter$4(this, void 0, void 0, function* () {
      const promise = (() => __awaiter$4(this, void 0, void 0, function* () {
        if (texture != null) {
          yield this._parser.assignTexture(this._materialParams, key, texture);
          if (isColorTexture) {
            this._materialParams[key].encoding = sRGBEncoding;
          }
        }
      }))();
      this._pendings.push(promise);
      return promise;
    });
  }
  assignTextureByIndex(key, textureIndex, isColorTexture) {
    return __awaiter$4(this, void 0, void 0, function* () {
      return this.assignTexture(key, textureIndex != null ? { index: textureIndex } : void 0, isColorTexture);
    });
  }
};
var POSSIBLE_SPEC_VERSIONS$2 = /* @__PURE__ */ new Set(["1.0", "1.0-beta"]);
var MToonMaterialLoaderPlugin = class {
  constructor(parser, options = {}) {
    var _a, _b, _c;
    this.parser = parser;
    this.renderOrderOffset = (_a = options.renderOrderOffset) !== null && _a !== void 0 ? _a : 0;
    this.v0CompatShade = (_b = options.v0CompatShade) !== null && _b !== void 0 ? _b : false;
    this.debugMode = (_c = options.debugMode) !== null && _c !== void 0 ? _c : "none";
    this._mToonMaterialSet = /* @__PURE__ */ new Set();
  }
  get name() {
    return MToonMaterialLoaderPlugin.EXTENSION_NAME;
  }
  beforeRoot() {
    return __awaiter$4(this, void 0, void 0, function* () {
      this._removeUnlitExtensionIfMToonExists();
    });
  }
  afterRoot(gltf) {
    return __awaiter$4(this, void 0, void 0, function* () {
      gltf.userData.vrmMToonMaterials = Array.from(this._mToonMaterialSet);
    });
  }
  getMaterialType(materialIndex) {
    const v1Extension = this._getMToonExtension(materialIndex);
    if (v1Extension) {
      return MToonMaterial;
    }
    return null;
  }
  extendMaterialParams(materialIndex, materialParams) {
    const extension = this._getMToonExtension(materialIndex);
    if (extension) {
      return this._extendMaterialParams(extension, materialParams);
    }
    return null;
  }
  loadMesh(meshIndex) {
    var _a;
    return __awaiter$4(this, void 0, void 0, function* () {
      const parser = this.parser;
      const json = parser.json;
      const meshDef = (_a = json.meshes) === null || _a === void 0 ? void 0 : _a[meshIndex];
      if (meshDef == null) {
        throw new Error(`MToonMaterialLoaderPlugin: Attempt to use meshes[${meshIndex}] of glTF but the mesh doesn't exist`);
      }
      const primitivesDef = meshDef.primitives;
      const meshOrGroup = yield parser.loadMesh(meshIndex);
      if (primitivesDef.length === 1) {
        const mesh = meshOrGroup;
        const materialIndex = primitivesDef[0].material;
        if (materialIndex != null) {
          this._setupPrimitive(mesh, materialIndex);
        }
      } else {
        const group = meshOrGroup;
        for (let i = 0; i < primitivesDef.length; i++) {
          const mesh = group.children[i];
          const materialIndex = primitivesDef[i].material;
          if (materialIndex != null) {
            this._setupPrimitive(mesh, materialIndex);
          }
        }
      }
      return meshOrGroup;
    });
  }
  /**
   * Delete use of `KHR_materials_unlit` from its `materials` if the material is using MToon.
   *
   * Since GLTFLoader have so many hardcoded procedure related to `KHR_materials_unlit`
   * we have to delete the extension before we start to parse the glTF.
   */
  _removeUnlitExtensionIfMToonExists() {
    const parser = this.parser;
    const json = parser.json;
    const materialDefs = json.materials;
    materialDefs === null || materialDefs === void 0 ? void 0 : materialDefs.map((materialDef, iMaterial) => {
      var _a;
      const extension = this._getMToonExtension(iMaterial);
      if (extension && ((_a = materialDef.extensions) === null || _a === void 0 ? void 0 : _a["KHR_materials_unlit"])) {
        delete materialDef.extensions["KHR_materials_unlit"];
      }
    });
  }
  _getMToonExtension(materialIndex) {
    var _a, _b;
    const parser = this.parser;
    const json = parser.json;
    const materialDef = (_a = json.materials) === null || _a === void 0 ? void 0 : _a[materialIndex];
    if (materialDef == null) {
      console.warn(`MToonMaterialLoaderPlugin: Attempt to use materials[${materialIndex}] of glTF but the material doesn't exist`);
      return void 0;
    }
    const extension = (_b = materialDef.extensions) === null || _b === void 0 ? void 0 : _b[MToonMaterialLoaderPlugin.EXTENSION_NAME];
    if (extension == null) {
      return void 0;
    }
    const specVersion = extension.specVersion;
    if (!POSSIBLE_SPEC_VERSIONS$2.has(specVersion)) {
      console.warn(`MToonMaterialLoaderPlugin: Unknown ${MToonMaterialLoaderPlugin.EXTENSION_NAME} specVersion "${specVersion}"`);
      return void 0;
    }
    return extension;
  }
  _extendMaterialParams(extension, materialParams) {
    var _a;
    return __awaiter$4(this, void 0, void 0, function* () {
      delete materialParams.metalness;
      delete materialParams.roughness;
      const assignHelper = new GLTFMToonMaterialParamsAssignHelper(this.parser, materialParams);
      assignHelper.assignPrimitive("transparentWithZWrite", extension.transparentWithZWrite);
      assignHelper.assignColor("shadeColorFactor", extension.shadeColorFactor);
      assignHelper.assignTexture("shadeMultiplyTexture", extension.shadeMultiplyTexture, true);
      assignHelper.assignPrimitive("shadingShiftFactor", extension.shadingShiftFactor);
      assignHelper.assignTexture("shadingShiftTexture", extension.shadingShiftTexture, true);
      assignHelper.assignPrimitive("shadingShiftTextureScale", (_a = extension.shadingShiftTexture) === null || _a === void 0 ? void 0 : _a.scale);
      assignHelper.assignPrimitive("shadingToonyFactor", extension.shadingToonyFactor);
      assignHelper.assignPrimitive("giEqualizationFactor", extension.giEqualizationFactor);
      assignHelper.assignColor("matcapFactor", extension.matcapFactor);
      assignHelper.assignTexture("matcapTexture", extension.matcapTexture, true);
      assignHelper.assignColor("parametricRimColorFactor", extension.parametricRimColorFactor);
      assignHelper.assignTexture("rimMultiplyTexture", extension.rimMultiplyTexture, true);
      assignHelper.assignPrimitive("rimLightingMixFactor", extension.rimLightingMixFactor);
      assignHelper.assignPrimitive("parametricRimFresnelPowerFactor", extension.parametricRimFresnelPowerFactor);
      assignHelper.assignPrimitive("parametricRimLiftFactor", extension.parametricRimLiftFactor);
      assignHelper.assignPrimitive("outlineWidthMode", extension.outlineWidthMode);
      assignHelper.assignPrimitive("outlineWidthFactor", extension.outlineWidthFactor);
      assignHelper.assignTexture("outlineWidthMultiplyTexture", extension.outlineWidthMultiplyTexture, false);
      assignHelper.assignColor("outlineColorFactor", extension.outlineColorFactor);
      assignHelper.assignPrimitive("outlineLightingMixFactor", extension.outlineLightingMixFactor);
      assignHelper.assignTexture("uvAnimationMaskTexture", extension.uvAnimationMaskTexture, false);
      assignHelper.assignPrimitive("uvAnimationScrollXSpeedFactor", extension.uvAnimationScrollXSpeedFactor);
      assignHelper.assignPrimitive("uvAnimationScrollYSpeedFactor", extension.uvAnimationScrollYSpeedFactor);
      assignHelper.assignPrimitive("uvAnimationRotationSpeedFactor", extension.uvAnimationRotationSpeedFactor);
      assignHelper.assignPrimitive("v0CompatShade", this.v0CompatShade);
      assignHelper.assignPrimitive("debugMode", this.debugMode);
      yield assignHelper.pending;
    });
  }
  /**
   * This will do two processes that is required to render MToon properly.
   *
   * - Set render order
   * - Generate outline
   *
   * @param mesh A target GLTF primitive
   * @param materialIndex The material index of the primitive
   */
  _setupPrimitive(mesh, materialIndex) {
    const extension = this._getMToonExtension(materialIndex);
    if (extension) {
      const renderOrder = this._parseRenderOrder(extension);
      mesh.renderOrder = renderOrder + this.renderOrderOffset;
      this._generateOutline(mesh);
      this._addToMaterialSet(mesh);
      return;
    }
  }
  /**
   * Generate outline for the given mesh, if it needs.
   *
   * @param mesh The target mesh
   */
  _generateOutline(mesh) {
    const surfaceMaterial = mesh.material;
    if (!(surfaceMaterial instanceof MToonMaterial)) {
      return;
    }
    if (surfaceMaterial.outlineWidthMode === "none" || surfaceMaterial.outlineWidthFactor <= 0) {
      return;
    }
    mesh.material = [surfaceMaterial];
    const outlineMaterial = surfaceMaterial.clone();
    outlineMaterial.name += " (Outline)";
    outlineMaterial.isOutline = true;
    outlineMaterial.side = BackSide;
    mesh.material.push(outlineMaterial);
    const geometry = mesh.geometry;
    const primitiveVertices = geometry.index ? geometry.index.count : geometry.attributes.position.count / 3;
    geometry.addGroup(0, primitiveVertices, 0);
    geometry.addGroup(0, primitiveVertices, 1);
  }
  _addToMaterialSet(mesh) {
    const materialOrMaterials = mesh.material;
    const materialSet = /* @__PURE__ */ new Set();
    if (Array.isArray(materialOrMaterials)) {
      materialOrMaterials.forEach((material) => materialSet.add(material));
    } else {
      materialSet.add(materialOrMaterials);
    }
    for (const material of materialSet) {
      if (material instanceof MToonMaterial) {
        this._mToonMaterialSet.add(material);
      }
    }
  }
  _parseRenderOrder(extension) {
    var _a;
    const enabledZWrite = extension.transparentWithZWrite;
    return (enabledZWrite ? 0 : 19) + ((_a = extension.renderQueueOffsetNumber) !== null && _a !== void 0 ? _a : 0);
  }
};
MToonMaterialLoaderPlugin.EXTENSION_NAME = "VRMC_materials_mtoon";
function __awaiter$3(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
var VRMMaterialsHDREmissiveMultiplierLoaderPlugin = class {
  constructor(parser) {
    this.parser = parser;
  }
  get name() {
    return VRMMaterialsHDREmissiveMultiplierLoaderPlugin.EXTENSION_NAME;
  }
  extendMaterialParams(materialIndex, materialParams) {
    return __awaiter$3(this, void 0, void 0, function* () {
      const extension = this._getHDREmissiveMultiplierExtension(materialIndex);
      if (extension == null) {
        return;
      }
      console.warn("VRMMaterialsHDREmissiveMultiplierLoaderPlugin: `VRMC_materials_hdr_emissiveMultiplier` is archived. Use `KHR_materials_emissive_strength` instead.");
      const emissiveMultiplier = extension.emissiveMultiplier;
      materialParams.emissiveIntensity = emissiveMultiplier;
    });
  }
  _getHDREmissiveMultiplierExtension(materialIndex) {
    var _a, _b;
    const parser = this.parser;
    const json = parser.json;
    const materialDef = (_a = json.materials) === null || _a === void 0 ? void 0 : _a[materialIndex];
    if (materialDef == null) {
      console.warn(`VRMMaterialsHDREmissiveMultiplierLoaderPlugin: Attempt to use materials[${materialIndex}] of glTF but the material doesn't exist`);
      return void 0;
    }
    const extension = (_b = materialDef.extensions) === null || _b === void 0 ? void 0 : _b[VRMMaterialsHDREmissiveMultiplierLoaderPlugin.EXTENSION_NAME];
    if (extension == null) {
      return void 0;
    }
    return extension;
  }
};
VRMMaterialsHDREmissiveMultiplierLoaderPlugin.EXTENSION_NAME = "VRMC_materials_hdr_emissiveMultiplier";
function __awaiter$2(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
function gammaEOTF(e) {
  return Math.pow(e, 2.2);
}
var VRMMaterialsV0CompatPlugin = class {
  constructor(parser) {
    var _a;
    this.parser = parser;
    this._renderQueueMapTransparent = /* @__PURE__ */ new Map();
    this._renderQueueMapTransparentZWrite = /* @__PURE__ */ new Map();
    const json = this.parser.json;
    json.extensionsUsed = (_a = json.extensionsUsed) !== null && _a !== void 0 ? _a : [];
    if (json.extensionsUsed.indexOf("KHR_texture_transform") === -1) {
      json.extensionsUsed.push("KHR_texture_transform");
    }
  }
  get name() {
    return "VRMMaterialsV0CompatPlugin";
  }
  beforeRoot() {
    var _a;
    return __awaiter$2(this, void 0, void 0, function* () {
      const json = this.parser.json;
      const v0VRMExtension = (_a = json.extensions) === null || _a === void 0 ? void 0 : _a["VRM"];
      const v0MaterialProperties = v0VRMExtension === null || v0VRMExtension === void 0 ? void 0 : v0VRMExtension.materialProperties;
      if (!v0MaterialProperties) {
        return;
      }
      this._populateRenderQueueMap(v0MaterialProperties);
      v0MaterialProperties.forEach((materialProperties, materialIndex) => {
        var _a2, _b;
        const materialDef = (_a2 = json.materials) === null || _a2 === void 0 ? void 0 : _a2[materialIndex];
        if (materialDef == null) {
          console.warn(`VRMMaterialsV0CompatPlugin: Attempt to use materials[${materialIndex}] of glTF but the material doesn't exist`);
          return;
        }
        if (materialProperties.shader === "VRM/MToon") {
          const material = this._parseV0MToonProperties(materialProperties, materialDef);
          json.materials[materialIndex] = material;
        } else if ((_b = materialProperties.shader) === null || _b === void 0 ? void 0 : _b.startsWith("VRM/Unlit")) {
          const material = this._parseV0UnlitProperties(materialProperties, materialDef);
          json.materials[materialIndex] = material;
        } else if (materialProperties.shader === "VRM_USE_GLTFSHADER")
          ;
        else {
          console.warn(`VRMMaterialsV0CompatPlugin: Unknown shader: ${materialProperties.shader}`);
        }
      });
    });
  }
  _parseV0MToonProperties(materialProperties, schemaMaterial) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19;
    const isTransparent = (_b = (_a = materialProperties.keywordMap) === null || _a === void 0 ? void 0 : _a["_ALPHABLEND_ON"]) !== null && _b !== void 0 ? _b : false;
    const enabledZWrite = ((_c = materialProperties.floatProperties) === null || _c === void 0 ? void 0 : _c["_ZWrite"]) === 1;
    const transparentWithZWrite = enabledZWrite && isTransparent;
    const renderQueueOffsetNumber = this._v0ParseRenderQueue(materialProperties);
    const isCutoff = (_e = (_d = materialProperties.keywordMap) === null || _d === void 0 ? void 0 : _d["_ALPHATEST_ON"]) !== null && _e !== void 0 ? _e : false;
    const alphaMode = isTransparent ? "BLEND" : isCutoff ? "MASK" : "OPAQUE";
    const alphaCutoff = isCutoff ? (_f = materialProperties.floatProperties) === null || _f === void 0 ? void 0 : _f["_Cutoff"] : void 0;
    const cullMode = (_h = (_g = materialProperties.floatProperties) === null || _g === void 0 ? void 0 : _g["_CullMode"]) !== null && _h !== void 0 ? _h : 2;
    const doubleSided = cullMode === 0;
    const textureTransformExt = this._portTextureTransform(materialProperties);
    const baseColorFactor = (_k = (_j = materialProperties.vectorProperties) === null || _j === void 0 ? void 0 : _j["_Color"]) === null || _k === void 0 ? void 0 : _k.map((v, i) => i === 3 ? v : gammaEOTF(v));
    const baseColorTextureIndex = (_l = materialProperties.textureProperties) === null || _l === void 0 ? void 0 : _l["_MainTex"];
    const baseColorTexture = baseColorTextureIndex != null ? {
      index: baseColorTextureIndex,
      extensions: Object.assign({}, textureTransformExt)
    } : void 0;
    const normalTextureScale = (_m = materialProperties.floatProperties) === null || _m === void 0 ? void 0 : _m["_BumpScale"];
    const normalTextureIndex = (_o = materialProperties.textureProperties) === null || _o === void 0 ? void 0 : _o["_BumpMap"];
    const normalTexture = normalTextureIndex != null ? {
      index: normalTextureIndex,
      scale: normalTextureScale,
      extensions: Object.assign({}, textureTransformExt)
    } : void 0;
    const emissiveFactor = (_q = (_p = materialProperties.vectorProperties) === null || _p === void 0 ? void 0 : _p["_EmissionColor"]) === null || _q === void 0 ? void 0 : _q.map(gammaEOTF);
    const emissiveTextureIndex = (_r = materialProperties.textureProperties) === null || _r === void 0 ? void 0 : _r["_EmissionMap"];
    const emissiveTexture = emissiveTextureIndex != null ? {
      index: emissiveTextureIndex,
      extensions: Object.assign({}, textureTransformExt)
    } : void 0;
    const shadeColorFactor = (_t = (_s = materialProperties.vectorProperties) === null || _s === void 0 ? void 0 : _s["_ShadeColor"]) === null || _t === void 0 ? void 0 : _t.map(gammaEOTF);
    const shadeMultiplyTextureIndex = (_u = materialProperties.textureProperties) === null || _u === void 0 ? void 0 : _u["_ShadeTexture"];
    const shadeMultiplyTexture = shadeMultiplyTextureIndex != null ? {
      index: shadeMultiplyTextureIndex,
      extensions: Object.assign({}, textureTransformExt)
    } : void 0;
    let shadingShiftFactor = (_w = (_v = materialProperties.floatProperties) === null || _v === void 0 ? void 0 : _v["_ShadeShift"]) !== null && _w !== void 0 ? _w : 0;
    let shadingToonyFactor = (_y = (_x = materialProperties.floatProperties) === null || _x === void 0 ? void 0 : _x["_ShadeToony"]) !== null && _y !== void 0 ? _y : 0.9;
    shadingToonyFactor = MathUtils.lerp(shadingToonyFactor, 1, 0.5 + 0.5 * shadingShiftFactor);
    shadingShiftFactor = -shadingShiftFactor - (1 - shadingToonyFactor);
    const giIntensityFactor = (_z = materialProperties.floatProperties) === null || _z === void 0 ? void 0 : _z["_IndirectLightIntensity"];
    const giEqualizationFactor = giIntensityFactor ? 1 - giIntensityFactor : void 0;
    const matcapTextureIndex = (_0 = materialProperties.textureProperties) === null || _0 === void 0 ? void 0 : _0["_SphereAdd"];
    const matcapFactor = matcapTextureIndex != null ? [1, 1, 1] : void 0;
    const matcapTexture = matcapTextureIndex != null ? {
      index: matcapTextureIndex
    } : void 0;
    const rimLightingMixFactor = (_1 = materialProperties.floatProperties) === null || _1 === void 0 ? void 0 : _1["_RimLightingMix"];
    const rimMultiplyTextureIndex = (_2 = materialProperties.textureProperties) === null || _2 === void 0 ? void 0 : _2["_RimTexture"];
    const rimMultiplyTexture = rimMultiplyTextureIndex != null ? {
      index: rimMultiplyTextureIndex,
      extensions: Object.assign({}, textureTransformExt)
    } : void 0;
    const parametricRimColorFactor = (_4 = (_3 = materialProperties.vectorProperties) === null || _3 === void 0 ? void 0 : _3["_RimColor"]) === null || _4 === void 0 ? void 0 : _4.map(gammaEOTF);
    const parametricRimFresnelPowerFactor = (_5 = materialProperties.floatProperties) === null || _5 === void 0 ? void 0 : _5["_RimFresnelPower"];
    const parametricRimLiftFactor = (_6 = materialProperties.floatProperties) === null || _6 === void 0 ? void 0 : _6["_RimLift"];
    const outlineWidthMode = ["none", "worldCoordinates", "screenCoordinates"][(_8 = (_7 = materialProperties.floatProperties) === null || _7 === void 0 ? void 0 : _7["_OutlineWidthMode"]) !== null && _8 !== void 0 ? _8 : 0];
    let outlineWidthFactor = (_10 = (_9 = materialProperties.floatProperties) === null || _9 === void 0 ? void 0 : _9["_OutlineWidth"]) !== null && _10 !== void 0 ? _10 : 0;
    outlineWidthFactor = 0.01 * outlineWidthFactor;
    const outlineWidthMultiplyTextureIndex = (_11 = materialProperties.textureProperties) === null || _11 === void 0 ? void 0 : _11["_OutlineWidthTexture"];
    const outlineWidthMultiplyTexture = outlineWidthMultiplyTextureIndex != null ? {
      index: outlineWidthMultiplyTextureIndex,
      extensions: Object.assign({}, textureTransformExt)
    } : void 0;
    const outlineColorFactor = (_13 = (_12 = materialProperties.vectorProperties) === null || _12 === void 0 ? void 0 : _12["_OutlineColor"]) === null || _13 === void 0 ? void 0 : _13.map(gammaEOTF);
    const outlineColorMode = (_14 = materialProperties.floatProperties) === null || _14 === void 0 ? void 0 : _14["_OutlineColorMode"];
    const outlineLightingMixFactor = outlineColorMode === 1 ? (_15 = materialProperties.floatProperties) === null || _15 === void 0 ? void 0 : _15["_OutlineLightingMix"] : 0;
    const uvAnimationMaskTextureIndex = (_16 = materialProperties.textureProperties) === null || _16 === void 0 ? void 0 : _16["_UvAnimMaskTexture"];
    const uvAnimationMaskTexture = uvAnimationMaskTextureIndex != null ? {
      index: uvAnimationMaskTextureIndex,
      extensions: Object.assign({}, textureTransformExt)
    } : void 0;
    const uvAnimationScrollXSpeedFactor = (_17 = materialProperties.floatProperties) === null || _17 === void 0 ? void 0 : _17["_UvAnimScrollX"];
    let uvAnimationScrollYSpeedFactor = (_18 = materialProperties.floatProperties) === null || _18 === void 0 ? void 0 : _18["_UvAnimScrollY"];
    if (uvAnimationScrollYSpeedFactor != null) {
      uvAnimationScrollYSpeedFactor = -uvAnimationScrollYSpeedFactor;
    }
    const uvAnimationRotationSpeedFactor = (_19 = materialProperties.floatProperties) === null || _19 === void 0 ? void 0 : _19["_UvAnimRotation"];
    const mtoonExtension = {
      specVersion: "1.0",
      transparentWithZWrite,
      renderQueueOffsetNumber,
      shadeColorFactor,
      shadeMultiplyTexture,
      shadingShiftFactor,
      shadingToonyFactor,
      giEqualizationFactor,
      matcapFactor,
      matcapTexture,
      rimLightingMixFactor,
      rimMultiplyTexture,
      parametricRimColorFactor,
      parametricRimFresnelPowerFactor,
      parametricRimLiftFactor,
      outlineWidthMode,
      outlineWidthFactor,
      outlineWidthMultiplyTexture,
      outlineColorFactor,
      outlineLightingMixFactor,
      uvAnimationMaskTexture,
      uvAnimationScrollXSpeedFactor,
      uvAnimationScrollYSpeedFactor,
      uvAnimationRotationSpeedFactor
    };
    return Object.assign(Object.assign({}, schemaMaterial), {
      pbrMetallicRoughness: {
        baseColorFactor,
        baseColorTexture
      },
      normalTexture,
      emissiveTexture,
      emissiveFactor,
      alphaMode,
      alphaCutoff,
      doubleSided,
      extensions: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        VRMC_materials_mtoon: mtoonExtension
      }
    });
  }
  _parseV0UnlitProperties(materialProperties, schemaMaterial) {
    var _a, _b, _c, _d;
    const isTransparentZWrite = materialProperties.shader === "VRM/UnlitTransparentZWrite";
    const isTransparent = materialProperties.shader === "VRM/UnlitTransparent" || isTransparentZWrite;
    const renderQueueOffsetNumber = this._v0ParseRenderQueue(materialProperties);
    const isCutoff = materialProperties.shader === "VRM/UnlitCutout";
    const alphaMode = isTransparent ? "BLEND" : isCutoff ? "MASK" : "OPAQUE";
    const alphaCutoff = isCutoff ? (_a = materialProperties.floatProperties) === null || _a === void 0 ? void 0 : _a["_Cutoff"] : void 0;
    const textureTransformExt = this._portTextureTransform(materialProperties);
    const baseColorFactor = (_c = (_b = materialProperties.vectorProperties) === null || _b === void 0 ? void 0 : _b["_Color"]) === null || _c === void 0 ? void 0 : _c.map(gammaEOTF);
    const baseColorTextureIndex = (_d = materialProperties.textureProperties) === null || _d === void 0 ? void 0 : _d["_MainTex"];
    const baseColorTexture = baseColorTextureIndex != null ? {
      index: baseColorTextureIndex,
      extensions: Object.assign({}, textureTransformExt)
    } : void 0;
    const mtoonExtension = {
      specVersion: "1.0",
      transparentWithZWrite: isTransparentZWrite,
      renderQueueOffsetNumber,
      shadeColorFactor: baseColorFactor,
      shadeMultiplyTexture: baseColorTexture
    };
    return Object.assign(Object.assign({}, schemaMaterial), {
      pbrMetallicRoughness: {
        baseColorFactor,
        baseColorTexture
      },
      alphaMode,
      alphaCutoff,
      extensions: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        VRMC_materials_mtoon: mtoonExtension
      }
    });
  }
  /**
   * Create a glTF `KHR_texture_transform` extension from v0 texture transform info.
   */
  _portTextureTransform(materialProperties) {
    var _a, _b, _c, _d, _e;
    const textureTransform = (_a = materialProperties.vectorProperties) === null || _a === void 0 ? void 0 : _a["_MainTex"];
    if (textureTransform == null) {
      return {};
    }
    const offset = [(_b = textureTransform === null || textureTransform === void 0 ? void 0 : textureTransform[0]) !== null && _b !== void 0 ? _b : 0, (_c = textureTransform === null || textureTransform === void 0 ? void 0 : textureTransform[1]) !== null && _c !== void 0 ? _c : 0];
    const scale = [(_d = textureTransform === null || textureTransform === void 0 ? void 0 : textureTransform[2]) !== null && _d !== void 0 ? _d : 1, (_e = textureTransform === null || textureTransform === void 0 ? void 0 : textureTransform[3]) !== null && _e !== void 0 ? _e : 1];
    offset[1] = scale[1] * (1 - offset[1]) % 1;
    return {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      KHR_texture_transform: { offset, scale }
    };
  }
  /**
   * Convert v0 render order into v1 render order.
   * This uses a map from v0 render queue to v1 compliant render queue offset which is generated in {@link _populateRenderQueueMap}.
   */
  _v0ParseRenderQueue(materialProperties) {
    var _a, _b, _c;
    const isTransparent = (_b = (_a = materialProperties.keywordMap) === null || _a === void 0 ? void 0 : _a["_ALPHABLEND_ON"]) !== null && _b !== void 0 ? _b : false;
    const enabledZWrite = ((_c = materialProperties.floatProperties) === null || _c === void 0 ? void 0 : _c["_ZWrite"]) === 1;
    let offset = 0;
    if (isTransparent) {
      const v0Queue = materialProperties.renderQueue;
      if (v0Queue != null) {
        if (enabledZWrite) {
          offset = this._renderQueueMapTransparentZWrite.get(v0Queue);
        } else {
          offset = this._renderQueueMapTransparent.get(v0Queue);
        }
      }
    }
    return offset;
  }
  /**
   * Create a map which maps v0 render queue to v1 compliant render queue offset.
   * This lists up all render queues the model use and creates a map to new render queue offsets in the same order.
   */
  _populateRenderQueueMap(materialPropertiesList) {
    const renderQueuesTransparent = /* @__PURE__ */ new Set();
    const renderQueuesTransparentZWrite = /* @__PURE__ */ new Set();
    materialPropertiesList.forEach((materialProperties) => {
      var _a, _b, _c;
      const isTransparent = (_b = (_a = materialProperties.keywordMap) === null || _a === void 0 ? void 0 : _a["_ALPHABLEND_ON"]) !== null && _b !== void 0 ? _b : false;
      const enabledZWrite = ((_c = materialProperties.floatProperties) === null || _c === void 0 ? void 0 : _c["_ZWrite"]) === 1;
      if (isTransparent) {
        const v0Queue = materialProperties.renderQueue;
        if (v0Queue != null) {
          if (enabledZWrite) {
            renderQueuesTransparentZWrite.add(v0Queue);
          } else {
            renderQueuesTransparent.add(v0Queue);
          }
        }
      }
    });
    if (renderQueuesTransparent.size > 10) {
      console.warn(`VRMMaterialsV0CompatPlugin: This VRM uses ${renderQueuesTransparent.size} render queues for Transparent materials while VRM 1.0 only supports up to 10 render queues. The model might not be rendered correctly.`);
    }
    if (renderQueuesTransparentZWrite.size > 10) {
      console.warn(`VRMMaterialsV0CompatPlugin: This VRM uses ${renderQueuesTransparentZWrite.size} render queues for TransparentZWrite materials while VRM 1.0 only supports up to 10 render queues. The model might not be rendered correctly.`);
    }
    Array.from(renderQueuesTransparent).sort().forEach((queue, i) => {
      const newQueueOffset = Math.min(Math.max(i - renderQueuesTransparent.size + 1, -9), 0);
      this._renderQueueMapTransparent.set(queue, newQueueOffset);
    });
    Array.from(renderQueuesTransparentZWrite).sort().forEach((queue, i) => {
      const newQueueOffset = Math.min(Math.max(i, 0), 9);
      this._renderQueueMapTransparentZWrite.set(queue, newQueueOffset);
    });
  }
};
var _v3A$3$1 = new Vector3();
var VRMNodeConstraintHelper = class extends Group {
  constructor(constraint) {
    super();
    this._attrPosition = new BufferAttribute(new Float32Array([0, 0, 0, 0, 0, 0]), 3);
    this._attrPosition.setUsage(DynamicDrawUsage);
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", this._attrPosition);
    const material = new LineBasicMaterial({
      color: 16711935,
      depthTest: false,
      depthWrite: false
    });
    this._line = new Line(geometry, material);
    this.add(this._line);
    this.constraint = constraint;
  }
  updateMatrixWorld(force) {
    _v3A$3$1.setFromMatrixPosition(this.constraint.destination.matrixWorld);
    this._attrPosition.setXYZ(0, _v3A$3$1.x, _v3A$3$1.y, _v3A$3$1.z);
    if (this.constraint.source) {
      _v3A$3$1.setFromMatrixPosition(this.constraint.source.matrixWorld);
    }
    this._attrPosition.setXYZ(1, _v3A$3$1.x, _v3A$3$1.y, _v3A$3$1.z);
    this._attrPosition.needsUpdate = true;
    super.updateMatrixWorld(force);
  }
};
function decomposePosition(matrix, target) {
  return target.set(matrix.elements[12], matrix.elements[13], matrix.elements[14]);
}
var _v3A$2$1 = new Vector3();
var _v3B$1$1 = new Vector3();
function decomposeRotation(matrix, target) {
  matrix.decompose(_v3A$2$1, target, _v3B$1$1);
  return target;
}
function quatInvertCompat(target) {
  if (target.invert) {
    target.invert();
  } else {
    target.inverse();
  }
  return target;
}
var VRMNodeConstraint = class {
  /**
   * @param destination The destination object
   * @param source The source object
   */
  constructor(destination, source) {
    this.destination = destination;
    this.source = source;
    this.weight = 1;
  }
};
var _v3A$1$1 = new Vector3();
var _v3B$2 = new Vector3();
var _v3C$1 = new Vector3();
var _quatA$2 = new Quaternion();
var _quatB$2 = new Quaternion();
var _quatC = new Quaternion();
var VRMAimConstraint = class extends VRMNodeConstraint {
  constructor(destination, source) {
    super(destination, source);
    this._aimAxis = "PositiveX";
    this._v3AimAxis = new Vector3(1, 0, 0);
    this._dstRestQuat = new Quaternion();
  }
  /**
   * The aim axis of the constraint.
   */
  get aimAxis() {
    return this._aimAxis;
  }
  /**
   * The aim axis of the constraint.
   */
  set aimAxis(aimAxis) {
    this._aimAxis = aimAxis;
    this._v3AimAxis.set(aimAxis === "PositiveX" ? 1 : aimAxis === "NegativeX" ? -1 : 0, aimAxis === "PositiveY" ? 1 : aimAxis === "NegativeY" ? -1 : 0, aimAxis === "PositiveZ" ? 1 : aimAxis === "NegativeZ" ? -1 : 0);
  }
  get dependencies() {
    const set = /* @__PURE__ */ new Set([this.source]);
    if (this.destination.parent) {
      set.add(this.destination.parent);
    }
    return set;
  }
  setInitState() {
    this._dstRestQuat.copy(this.destination.quaternion);
  }
  update() {
    this.destination.updateWorldMatrix(true, false);
    this.source.updateWorldMatrix(true, false);
    const dstParentWorldQuat = _quatA$2.identity();
    const invDstParentWorldQuat = _quatB$2.identity();
    if (this.destination.parent) {
      decomposeRotation(this.destination.parent.matrixWorld, dstParentWorldQuat);
      quatInvertCompat(invDstParentWorldQuat.copy(dstParentWorldQuat));
    }
    const a0 = _v3A$1$1.copy(this._v3AimAxis).applyQuaternion(this._dstRestQuat).applyQuaternion(dstParentWorldQuat);
    const a1 = decomposePosition(this.source.matrixWorld, _v3B$2).sub(decomposePosition(this.destination.matrixWorld, _v3C$1)).normalize();
    const targetQuat = _quatC.setFromUnitVectors(a0, a1).premultiply(invDstParentWorldQuat).multiply(dstParentWorldQuat).multiply(this._dstRestQuat);
    this.destination.quaternion.copy(this._dstRestQuat).slerp(targetQuat, this.weight);
  }
};
function __awaiter$1(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
function traverseAncestorsFromRoot$1(object, callback) {
  const ancestors = [object];
  let head = object.parent;
  while (head !== null) {
    ancestors.unshift(head);
    head = head.parent;
  }
  ancestors.forEach((ancestor) => {
    callback(ancestor);
  });
}
var VRMNodeConstraintManager = class {
  constructor() {
    this._constraints = /* @__PURE__ */ new Set();
    this._objectConstraintsMap = /* @__PURE__ */ new Map();
  }
  get constraints() {
    return this._constraints;
  }
  addConstraint(constraint) {
    this._constraints.add(constraint);
    let objectSet = this._objectConstraintsMap.get(constraint.destination);
    if (objectSet == null) {
      objectSet = /* @__PURE__ */ new Set();
      this._objectConstraintsMap.set(constraint.destination, objectSet);
    }
    objectSet.add(constraint);
  }
  deleteConstraint(constraint) {
    this._constraints.delete(constraint);
    const objectSet = this._objectConstraintsMap.get(constraint.destination);
    objectSet.delete(constraint);
  }
  setInitState() {
    const constraintsTried = /* @__PURE__ */ new Set();
    const constraintsDone = /* @__PURE__ */ new Set();
    for (const constraint of this._constraints) {
      this._processConstraint(constraint, constraintsTried, constraintsDone, (constraint2) => constraint2.setInitState());
    }
  }
  update() {
    const constraintsTried = /* @__PURE__ */ new Set();
    const constraintsDone = /* @__PURE__ */ new Set();
    for (const constraint of this._constraints) {
      this._processConstraint(constraint, constraintsTried, constraintsDone, (constraint2) => constraint2.update());
    }
  }
  /**
   * Update a constraint.
   * If there are other constraints that are dependant, it will try to update them recursively.
   * It might throw an error if there are circular dependencies.
   *
   * Intended to be used in {@link update} and {@link _processConstraint} itself recursively.
   *
   * @param constraint A constraint you want to update
   * @param constraintsTried Set of constraints that are already tried to be updated
   * @param constraintsDone Set of constraints that are already up to date
   */
  _processConstraint(constraint, constraintsTried, constraintsDone, callback) {
    if (constraintsDone.has(constraint)) {
      return;
    }
    if (constraintsTried.has(constraint)) {
      throw new Error("VRMNodeConstraintManager: Circular dependency detected while updating constraints");
    }
    constraintsTried.add(constraint);
    const depObjects = constraint.dependencies;
    for (const depObject of depObjects) {
      traverseAncestorsFromRoot$1(depObject, (depObjectAncestor) => {
        const objectSet = this._objectConstraintsMap.get(depObjectAncestor);
        if (objectSet) {
          for (const depConstraint of objectSet) {
            this._processConstraint(depConstraint, constraintsTried, constraintsDone, callback);
          }
        }
      });
    }
    callback(constraint);
    constraintsDone.add(constraint);
  }
};
var _quatA$1 = new Quaternion();
var _quatB$1 = new Quaternion();
var VRMRotationConstraint = class extends VRMNodeConstraint {
  constructor(destination, source) {
    super(destination, source);
    this._dstRestQuat = new Quaternion();
    this._invSrcRestQuat = new Quaternion();
  }
  get dependencies() {
    return /* @__PURE__ */ new Set([this.source]);
  }
  setInitState() {
    this._dstRestQuat.copy(this.destination.quaternion);
    quatInvertCompat(this._invSrcRestQuat.copy(this.source.quaternion));
  }
  update() {
    const srcDeltaQuat = _quatA$1.copy(this._invSrcRestQuat).multiply(this.source.quaternion);
    const targetQuat = _quatB$1.copy(this._dstRestQuat).multiply(srcDeltaQuat);
    this.destination.quaternion.copy(this._dstRestQuat).slerp(targetQuat, this.weight);
  }
};
var _v3A$5 = new Vector3();
var _quatA$3 = new Quaternion();
var _quatB = new Quaternion();
var VRMRollConstraint = class extends VRMNodeConstraint {
  constructor(destination, source) {
    super(destination, source);
    this._rollAxis = "X";
    this._v3RollAxis = new Vector3(1, 0, 0);
    this._dstRestQuat = new Quaternion();
    this._invDstRestQuat = new Quaternion();
    this._invSrcRestQuatMulDstRestQuat = new Quaternion();
  }
  /**
   * The roll axis of the constraint.
   */
  get rollAxis() {
    return this._rollAxis;
  }
  /**
   * The roll axis of the constraint.
   */
  set rollAxis(rollAxis) {
    this._rollAxis = rollAxis;
    this._v3RollAxis.set(rollAxis === "X" ? 1 : 0, rollAxis === "Y" ? 1 : 0, rollAxis === "Z" ? 1 : 0);
  }
  get dependencies() {
    return /* @__PURE__ */ new Set([this.source]);
  }
  setInitState() {
    this._dstRestQuat.copy(this.destination.quaternion);
    quatInvertCompat(this._invDstRestQuat.copy(this._dstRestQuat));
    quatInvertCompat(this._invSrcRestQuatMulDstRestQuat.copy(this.source.quaternion)).multiply(this._dstRestQuat);
  }
  update() {
    const quatDelta = _quatA$3.copy(this._invDstRestQuat).multiply(this.source.quaternion).multiply(this._invSrcRestQuatMulDstRestQuat);
    const n1 = _v3A$5.copy(this._v3RollAxis).applyQuaternion(quatDelta);
    const quatFromTo = _quatB.setFromUnitVectors(n1, this._v3RollAxis);
    const targetQuat = quatFromTo.premultiply(this._dstRestQuat).multiply(quatDelta);
    this.destination.quaternion.copy(this._dstRestQuat).slerp(targetQuat, this.weight);
  }
};
var POSSIBLE_SPEC_VERSIONS$1 = /* @__PURE__ */ new Set(["1.0", "1.0-beta"]);
var VRMNodeConstraintLoaderPlugin = class {
  constructor(parser, options) {
    this.parser = parser;
    this.helperRoot = options === null || options === void 0 ? void 0 : options.helperRoot;
  }
  get name() {
    return VRMNodeConstraintLoaderPlugin.EXTENSION_NAME;
  }
  afterRoot(gltf) {
    return __awaiter$1(this, void 0, void 0, function* () {
      gltf.userData.vrmNodeConstraintManager = yield this._import(gltf);
    });
  }
  /**
   * Import constraints from a GLTF and returns a {@link VRMNodeConstraintManager}.
   * It might return `null` instead when it does not need to be created or something go wrong.
   *
   * @param gltf A parsed result of GLTF taken from GLTFLoader
   */
  _import(gltf) {
    var _a;
    return __awaiter$1(this, void 0, void 0, function* () {
      const json = this.parser.json;
      const isConstraintsUsed = ((_a = json.extensionsUsed) === null || _a === void 0 ? void 0 : _a.indexOf(VRMNodeConstraintLoaderPlugin.EXTENSION_NAME)) !== -1;
      if (!isConstraintsUsed) {
        return null;
      }
      const manager = new VRMNodeConstraintManager();
      const threeNodes = yield this.parser.getDependencies("node");
      threeNodes.forEach((node, nodeIndex) => {
        var _a2;
        const schemaNode = json.nodes[nodeIndex];
        const extension = (_a2 = schemaNode === null || schemaNode === void 0 ? void 0 : schemaNode.extensions) === null || _a2 === void 0 ? void 0 : _a2[VRMNodeConstraintLoaderPlugin.EXTENSION_NAME];
        if (extension == null) {
          return;
        }
        const specVersion = extension.specVersion;
        if (!POSSIBLE_SPEC_VERSIONS$1.has(specVersion)) {
          console.warn(`VRMNodeConstraintLoaderPlugin: Unknown ${VRMNodeConstraintLoaderPlugin.EXTENSION_NAME} specVersion "${specVersion}"`);
          return;
        }
        const constraintDef = extension.constraint;
        if (constraintDef.roll != null) {
          const constraint = this._importRollConstraint(node, threeNodes, constraintDef.roll);
          manager.addConstraint(constraint);
        } else if (constraintDef.aim != null) {
          const constraint = this._importAimConstraint(node, threeNodes, constraintDef.aim);
          manager.addConstraint(constraint);
        } else if (constraintDef.rotation != null) {
          const constraint = this._importRotationConstraint(node, threeNodes, constraintDef.rotation);
          manager.addConstraint(constraint);
        }
      });
      gltf.scene.updateMatrixWorld();
      manager.setInitState();
      return manager;
    });
  }
  _importRollConstraint(destination, nodes, rollConstraintDef) {
    const { source: sourceIndex, rollAxis, weight } = rollConstraintDef;
    const source = nodes[sourceIndex];
    const constraint = new VRMRollConstraint(destination, source);
    if (rollAxis != null) {
      constraint.rollAxis = rollAxis;
    }
    if (weight != null) {
      constraint.weight = weight;
    }
    if (this.helperRoot) {
      const helper = new VRMNodeConstraintHelper(constraint);
      this.helperRoot.add(helper);
    }
    return constraint;
  }
  _importAimConstraint(destination, nodes, aimConstraintDef) {
    const { source: sourceIndex, aimAxis, weight } = aimConstraintDef;
    const source = nodes[sourceIndex];
    const constraint = new VRMAimConstraint(destination, source);
    if (aimAxis != null) {
      constraint.aimAxis = aimAxis;
    }
    if (weight != null) {
      constraint.weight = weight;
    }
    if (this.helperRoot) {
      const helper = new VRMNodeConstraintHelper(constraint);
      this.helperRoot.add(helper);
    }
    return constraint;
  }
  _importRotationConstraint(destination, nodes, rotationConstraintDef) {
    const { source: sourceIndex, weight } = rotationConstraintDef;
    const source = nodes[sourceIndex];
    const constraint = new VRMRotationConstraint(destination, source);
    if (weight != null) {
      constraint.weight = weight;
    }
    if (this.helperRoot) {
      const helper = new VRMNodeConstraintHelper(constraint);
      this.helperRoot.add(helper);
    }
    return constraint;
  }
};
VRMNodeConstraintLoaderPlugin.EXTENSION_NAME = "VRMC_node_constraint";
var VRMSpringBoneColliderShape = class {
};
var _v3A$4 = new Vector3();
var _v3B$1 = new Vector3();
var VRMSpringBoneColliderShapeCapsule = class extends VRMSpringBoneColliderShape {
  constructor(params) {
    var _a, _b, _c;
    super();
    this.offset = (_a = params === null || params === void 0 ? void 0 : params.offset) !== null && _a !== void 0 ? _a : new Vector3(0, 0, 0);
    this.tail = (_b = params === null || params === void 0 ? void 0 : params.tail) !== null && _b !== void 0 ? _b : new Vector3(0, 0, 0);
    this.radius = (_c = params === null || params === void 0 ? void 0 : params.radius) !== null && _c !== void 0 ? _c : 0;
  }
  get type() {
    return "capsule";
  }
  calculateCollision(colliderMatrix, objectPosition, objectRadius, target) {
    _v3A$4.copy(this.offset).applyMatrix4(colliderMatrix);
    _v3B$1.copy(this.tail).applyMatrix4(colliderMatrix);
    _v3B$1.sub(_v3A$4);
    const lengthSqCapsule = _v3B$1.lengthSq();
    target.copy(objectPosition).sub(_v3A$4);
    const dot = _v3B$1.dot(target);
    if (dot <= 0)
      ;
    else if (lengthSqCapsule <= dot) {
      target.sub(_v3B$1);
    } else {
      _v3B$1.multiplyScalar(dot / lengthSqCapsule);
      target.sub(_v3B$1);
    }
    const radius = objectRadius + this.radius;
    const distance = target.length() - radius;
    target.normalize();
    return distance;
  }
};
var VRMSpringBoneColliderShapeSphere = class extends VRMSpringBoneColliderShape {
  constructor(params) {
    var _a, _b;
    super();
    this.offset = (_a = params === null || params === void 0 ? void 0 : params.offset) !== null && _a !== void 0 ? _a : new Vector3(0, 0, 0);
    this.radius = (_b = params === null || params === void 0 ? void 0 : params.radius) !== null && _b !== void 0 ? _b : 0;
  }
  get type() {
    return "sphere";
  }
  calculateCollision(colliderMatrix, objectPosition, objectRadius, target) {
    target.copy(this.offset).applyMatrix4(colliderMatrix);
    target.negate().add(objectPosition);
    const radius = objectRadius + this.radius;
    const distance = target.length() - radius;
    target.normalize();
    return distance;
  }
};
var _v3A$3 = new Vector3();
var ColliderShapeCapsuleBufferGeometry = class extends BufferGeometry {
  constructor(shape) {
    super();
    this.worldScale = 1;
    this._currentRadius = 0;
    this._currentOffset = new Vector3();
    this._currentTail = new Vector3();
    this._shape = shape;
    this._attrPos = new BufferAttribute(new Float32Array(396), 3);
    this.setAttribute("position", this._attrPos);
    this._attrIndex = new BufferAttribute(new Uint16Array(264), 1);
    this.setIndex(this._attrIndex);
    this._buildIndex();
    this.update();
  }
  update() {
    let shouldUpdateGeometry = false;
    const radius = this._shape.radius / this.worldScale;
    if (this._currentRadius !== radius) {
      this._currentRadius = radius;
      shouldUpdateGeometry = true;
    }
    if (!this._currentOffset.equals(this._shape.offset)) {
      this._currentOffset.copy(this._shape.offset);
      shouldUpdateGeometry = true;
    }
    const tail = _v3A$3.copy(this._shape.tail).divideScalar(this.worldScale);
    if (this._currentTail.distanceToSquared(tail) > 1e-10) {
      this._currentTail.copy(tail);
      shouldUpdateGeometry = true;
    }
    if (shouldUpdateGeometry) {
      this._buildPosition();
    }
  }
  _buildPosition() {
    _v3A$3.copy(this._currentTail).sub(this._currentOffset);
    const l = _v3A$3.length() / this._currentRadius;
    for (let i = 0; i <= 16; i++) {
      const t = i / 16 * Math.PI;
      this._attrPos.setXYZ(i, -Math.sin(t), -Math.cos(t), 0);
      this._attrPos.setXYZ(17 + i, l + Math.sin(t), Math.cos(t), 0);
      this._attrPos.setXYZ(34 + i, -Math.sin(t), 0, -Math.cos(t));
      this._attrPos.setXYZ(51 + i, l + Math.sin(t), 0, Math.cos(t));
    }
    for (let i = 0; i < 32; i++) {
      const t = i / 16 * Math.PI;
      this._attrPos.setXYZ(68 + i, 0, Math.sin(t), Math.cos(t));
      this._attrPos.setXYZ(100 + i, l, Math.sin(t), Math.cos(t));
    }
    const theta = Math.atan2(_v3A$3.y, Math.sqrt(_v3A$3.x * _v3A$3.x + _v3A$3.z * _v3A$3.z));
    const phi = -Math.atan2(_v3A$3.z, _v3A$3.x);
    this.rotateZ(theta);
    this.rotateY(phi);
    this.scale(this._currentRadius, this._currentRadius, this._currentRadius);
    this.translate(this._currentOffset.x, this._currentOffset.y, this._currentOffset.z);
    this._attrPos.needsUpdate = true;
  }
  _buildIndex() {
    for (let i = 0; i < 34; i++) {
      const i1 = (i + 1) % 34;
      this._attrIndex.setXY(i * 2, i, i1);
      this._attrIndex.setXY(68 + i * 2, 34 + i, 34 + i1);
    }
    for (let i = 0; i < 32; i++) {
      const i1 = (i + 1) % 32;
      this._attrIndex.setXY(136 + i * 2, 68 + i, 68 + i1);
      this._attrIndex.setXY(200 + i * 2, 100 + i, 100 + i1);
    }
    this._attrIndex.needsUpdate = true;
  }
};
var ColliderShapeSphereBufferGeometry = class extends BufferGeometry {
  constructor(shape) {
    super();
    this.worldScale = 1;
    this._currentRadius = 0;
    this._currentOffset = new Vector3();
    this._shape = shape;
    this._attrPos = new BufferAttribute(new Float32Array(32 * 3 * 3), 3);
    this.setAttribute("position", this._attrPos);
    this._attrIndex = new BufferAttribute(new Uint16Array(64 * 3), 1);
    this.setIndex(this._attrIndex);
    this._buildIndex();
    this.update();
  }
  update() {
    let shouldUpdateGeometry = false;
    const radius = this._shape.radius / this.worldScale;
    if (this._currentRadius !== radius) {
      this._currentRadius = radius;
      shouldUpdateGeometry = true;
    }
    if (!this._currentOffset.equals(this._shape.offset)) {
      this._currentOffset.copy(this._shape.offset);
      shouldUpdateGeometry = true;
    }
    if (shouldUpdateGeometry) {
      this._buildPosition();
    }
  }
  _buildPosition() {
    for (let i = 0; i < 32; i++) {
      const t = i / 16 * Math.PI;
      this._attrPos.setXYZ(i, Math.cos(t), Math.sin(t), 0);
      this._attrPos.setXYZ(32 + i, 0, Math.cos(t), Math.sin(t));
      this._attrPos.setXYZ(64 + i, Math.sin(t), 0, Math.cos(t));
    }
    this.scale(this._currentRadius, this._currentRadius, this._currentRadius);
    this.translate(this._currentOffset.x, this._currentOffset.y, this._currentOffset.z);
    this._attrPos.needsUpdate = true;
  }
  _buildIndex() {
    for (let i = 0; i < 32; i++) {
      const i1 = (i + 1) % 32;
      this._attrIndex.setXY(i * 2, i, i1);
      this._attrIndex.setXY(64 + i * 2, 32 + i, 32 + i1);
      this._attrIndex.setXY(128 + i * 2, 64 + i, 64 + i1);
    }
    this._attrIndex.needsUpdate = true;
  }
};
var _v3A$2 = new Vector3();
var VRMSpringBoneColliderHelper = class extends Group {
  constructor(collider) {
    super();
    this.matrixAutoUpdate = false;
    this.collider = collider;
    if (this.collider.shape instanceof VRMSpringBoneColliderShapeSphere) {
      this._geometry = new ColliderShapeSphereBufferGeometry(this.collider.shape);
    } else if (this.collider.shape instanceof VRMSpringBoneColliderShapeCapsule) {
      this._geometry = new ColliderShapeCapsuleBufferGeometry(this.collider.shape);
    } else {
      throw new Error("VRMSpringBoneColliderHelper: Unknown collider shape type detected");
    }
    const material = new LineBasicMaterial({
      color: 16711935,
      depthTest: false,
      depthWrite: false
    });
    this._line = new LineSegments(this._geometry, material);
    this.add(this._line);
  }
  dispose() {
    this._geometry.dispose();
  }
  updateMatrixWorld(force) {
    this.collider.updateWorldMatrix(true, false);
    this.matrix.copy(this.collider.matrixWorld);
    const matrixWorldElements = this.matrix.elements;
    this._geometry.worldScale = _v3A$2.set(matrixWorldElements[0], matrixWorldElements[1], matrixWorldElements[2]).length();
    this._geometry.update();
    super.updateMatrixWorld(force);
  }
};
var SpringBoneBufferGeometry = class extends BufferGeometry {
  constructor(springBone) {
    super();
    this.worldScale = 1;
    this._currentRadius = 0;
    this._currentTail = new Vector3();
    this._springBone = springBone;
    this._attrPos = new BufferAttribute(new Float32Array(294), 3);
    this.setAttribute("position", this._attrPos);
    this._attrIndex = new BufferAttribute(new Uint16Array(194), 1);
    this.setIndex(this._attrIndex);
    this._buildIndex();
    this.update();
  }
  update() {
    let shouldUpdateGeometry = false;
    const radius = this._springBone.settings.hitRadius / this.worldScale;
    if (this._currentRadius !== radius) {
      this._currentRadius = radius;
      shouldUpdateGeometry = true;
    }
    if (!this._currentTail.equals(this._springBone.initialLocalChildPosition)) {
      this._currentTail.copy(this._springBone.initialLocalChildPosition);
      shouldUpdateGeometry = true;
    }
    if (shouldUpdateGeometry) {
      this._buildPosition();
    }
  }
  _buildPosition() {
    for (let i = 0; i < 32; i++) {
      const t = i / 16 * Math.PI;
      this._attrPos.setXYZ(i, Math.cos(t), Math.sin(t), 0);
      this._attrPos.setXYZ(32 + i, 0, Math.cos(t), Math.sin(t));
      this._attrPos.setXYZ(64 + i, Math.sin(t), 0, Math.cos(t));
    }
    this.scale(this._currentRadius, this._currentRadius, this._currentRadius);
    this.translate(this._currentTail.x, this._currentTail.y, this._currentTail.z);
    this._attrPos.setXYZ(96, 0, 0, 0);
    this._attrPos.setXYZ(97, this._currentTail.x, this._currentTail.y, this._currentTail.z);
    this._attrPos.needsUpdate = true;
  }
  _buildIndex() {
    for (let i = 0; i < 32; i++) {
      const i1 = (i + 1) % 32;
      this._attrIndex.setXY(i * 2, i, i1);
      this._attrIndex.setXY(64 + i * 2, 32 + i, 32 + i1);
      this._attrIndex.setXY(128 + i * 2, 64 + i, 64 + i1);
    }
    this._attrIndex.setXY(192, 96, 97);
    this._attrIndex.needsUpdate = true;
  }
};
var _v3A$1 = new Vector3();
var VRMSpringBoneJointHelper = class extends Group {
  constructor(springBone) {
    super();
    this.matrixAutoUpdate = false;
    this.springBone = springBone;
    this._geometry = new SpringBoneBufferGeometry(this.springBone);
    const material = new LineBasicMaterial({
      color: 16776960,
      depthTest: false,
      depthWrite: false
    });
    this._line = new LineSegments(this._geometry, material);
    this.add(this._line);
  }
  dispose() {
    this._geometry.dispose();
  }
  updateMatrixWorld(force) {
    this.springBone.bone.updateWorldMatrix(true, false);
    this.matrix.copy(this.springBone.bone.matrixWorld);
    const matrixWorldElements = this.matrix.elements;
    this._geometry.worldScale = _v3A$1.set(matrixWorldElements[0], matrixWorldElements[1], matrixWorldElements[2]).length();
    this._geometry.update();
    super.updateMatrixWorld(force);
  }
};
var VRMSpringBoneCollider = class extends Object3D {
  constructor(shape) {
    super();
    this.shape = shape;
  }
};
var _matA$1 = new Matrix4();
function mat4InvertCompat(target) {
  if (target.invert) {
    target.invert();
  } else {
    target.getInverse(_matA$1.copy(target));
  }
  return target;
}
var Matrix4InverseCache = class {
  constructor(matrix) {
    this._inverseCache = new Matrix4();
    this._shouldUpdateInverse = true;
    this.matrix = matrix;
    const handler = {
      set: (obj, prop, newVal) => {
        this._shouldUpdateInverse = true;
        obj[prop] = newVal;
        return true;
      }
    };
    this._originalElements = matrix.elements;
    matrix.elements = new Proxy(matrix.elements, handler);
  }
  /**
   * Inverse of given matrix.
   * Note that it will return its internal private instance.
   * Make sure copying this before mutate this.
   */
  get inverse() {
    if (this._shouldUpdateInverse) {
      this._inverseCache.copy(this.matrix);
      mat4InvertCompat(this._inverseCache);
      this._shouldUpdateInverse = false;
    }
    return this._inverseCache;
  }
  revert() {
    this.matrix.elements = this._originalElements;
  }
};
var IDENTITY_MATRIX4 = new Matrix4();
var _v3A = new Vector3();
var _v3B = new Vector3();
var _v3C = new Vector3();
var _worldSpacePosition = new Vector3();
var _centerSpacePosition = new Vector3();
var _nextTail = new Vector3();
var _quatA = new Quaternion();
var _matA = new Matrix4();
var _matB = new Matrix4();
var VRMSpringBoneJoint = class {
  /**
   * Create a new VRMSpringBone.
   *
   * @param bone An Object3D that will be attached to this bone
   * @param child An Object3D that will be used as a tail of this spring bone. It can be null when the spring bone is imported from VRM 0.0
   * @param settings Several parameters related to behavior of the spring bone
   * @param colliderGroups Collider groups that will be collided with this spring bone
   */
  constructor(bone, child, settings = {}, colliderGroups = []) {
    var _a, _b, _c, _d, _e, _f;
    this._currentTail = new Vector3();
    this._prevTail = new Vector3();
    this._boneAxis = new Vector3();
    this._worldSpaceBoneLength = 0;
    this._center = null;
    this._initialLocalMatrix = new Matrix4();
    this._initialLocalRotation = new Quaternion();
    this._initialLocalChildPosition = new Vector3();
    this.bone = bone;
    this.bone.matrixAutoUpdate = false;
    this.child = child;
    this.settings = {
      hitRadius: (_a = settings.hitRadius) !== null && _a !== void 0 ? _a : 0,
      stiffness: (_b = settings.stiffness) !== null && _b !== void 0 ? _b : 1,
      gravityPower: (_c = settings.gravityPower) !== null && _c !== void 0 ? _c : 0,
      gravityDir: (_e = (_d = settings.gravityDir) === null || _d === void 0 ? void 0 : _d.clone()) !== null && _e !== void 0 ? _e : new Vector3(0, -1, 0),
      dragForce: (_f = settings.dragForce) !== null && _f !== void 0 ? _f : 0.4
    };
    this.colliderGroups = colliderGroups;
  }
  get center() {
    return this._center;
  }
  set center(center) {
    var _a;
    if ((_a = this._center) === null || _a === void 0 ? void 0 : _a.userData.inverseCacheProxy) {
      this._center.userData.inverseCacheProxy.revert();
      delete this._center.userData.inverseCacheProxy;
    }
    this._center = center;
    if (this._center) {
      if (!this._center.userData.inverseCacheProxy) {
        this._center.userData.inverseCacheProxy = new Matrix4InverseCache(this._center.matrixWorld);
      }
    }
  }
  get initialLocalChildPosition() {
    return this._initialLocalChildPosition;
  }
  /**
   * Returns the world matrix of its parent object.
   * Note that it returns a reference to the matrix. Don't mutate this directly!
   */
  get _parentMatrixWorld() {
    return this.bone.parent ? this.bone.parent.matrixWorld : IDENTITY_MATRIX4;
  }
  /**
   * Set the initial state of this spring bone.
   * You might want to call {@link VRMSpringBoneManager.setInitState} instead.
   */
  setInitState() {
    this._initialLocalMatrix.copy(this.bone.matrix);
    this._initialLocalRotation.copy(this.bone.quaternion);
    if (this.child) {
      this._initialLocalChildPosition.copy(this.child.position);
    } else {
      this._initialLocalChildPosition.copy(this.bone.position).normalize().multiplyScalar(0.07);
    }
    const matrixWorldToCenter = this._getMatrixWorldToCenter(_matA);
    this.bone.localToWorld(this._currentTail.copy(this._initialLocalChildPosition)).applyMatrix4(matrixWorldToCenter);
    this._prevTail.copy(this._currentTail);
    this._boneAxis.copy(this._initialLocalChildPosition).normalize();
  }
  /**
   * Reset the state of this bone.
   * You might want to call [[VRMSpringBoneManager.reset]] instead.
   */
  reset() {
    this.bone.quaternion.copy(this._initialLocalRotation);
    this.bone.updateMatrix();
    this.bone.matrixWorld.multiplyMatrices(this._parentMatrixWorld, this.bone.matrix);
    const matrixWorldToCenter = this._getMatrixWorldToCenter(_matA);
    this.bone.localToWorld(this._currentTail.copy(this._initialLocalChildPosition)).applyMatrix4(matrixWorldToCenter);
    this._prevTail.copy(this._currentTail);
  }
  /**
   * Update the state of this bone.
   * You might want to call [[VRMSpringBoneManager.update]] instead.
   *
   * @param delta deltaTime
   */
  update(delta) {
    if (delta <= 0)
      return;
    this._calcWorldSpaceBoneLength();
    _worldSpacePosition.setFromMatrixPosition(this.bone.matrixWorld);
    let matrixWorldToCenter = this._getMatrixWorldToCenter(_matA);
    _centerSpacePosition.copy(_worldSpacePosition).applyMatrix4(matrixWorldToCenter);
    const quatWorldToCenter = _quatA.setFromRotationMatrix(matrixWorldToCenter);
    const centerSpaceParentMatrix = _matB.copy(matrixWorldToCenter).multiply(this._parentMatrixWorld);
    const centerSpaceBoneAxis = _v3B.copy(this._boneAxis).applyMatrix4(this._initialLocalMatrix).applyMatrix4(centerSpaceParentMatrix).sub(_centerSpacePosition).normalize();
    const centerSpaceGravity = _v3C.copy(this.settings.gravityDir).applyQuaternion(quatWorldToCenter).normalize();
    const matrixCenterToWorld = this._getMatrixCenterToWorld(_matA);
    _nextTail.copy(this._currentTail).add(_v3A.copy(this._currentTail).sub(this._prevTail).multiplyScalar(1 - this.settings.dragForce)).add(_v3A.copy(centerSpaceBoneAxis).multiplyScalar(this.settings.stiffness * delta)).add(_v3A.copy(centerSpaceGravity).multiplyScalar(this.settings.gravityPower * delta)).applyMatrix4(matrixCenterToWorld);
    _nextTail.sub(_worldSpacePosition).normalize().multiplyScalar(this._worldSpaceBoneLength).add(_worldSpacePosition);
    this._collision(_nextTail);
    matrixWorldToCenter = this._getMatrixWorldToCenter(_matA);
    this._prevTail.copy(this._currentTail);
    this._currentTail.copy(_v3A.copy(_nextTail).applyMatrix4(matrixWorldToCenter));
    const worldSpaceInitialMatrixInv = mat4InvertCompat(_matA.copy(this._parentMatrixWorld).multiply(this._initialLocalMatrix));
    const applyRotation = _quatA.setFromUnitVectors(this._boneAxis, _v3A.copy(_nextTail).applyMatrix4(worldSpaceInitialMatrixInv).normalize());
    this.bone.quaternion.copy(this._initialLocalRotation).multiply(applyRotation);
    this.bone.updateMatrix();
    this.bone.matrixWorld.multiplyMatrices(this._parentMatrixWorld, this.bone.matrix);
  }
  /**
   * Do collision math against every colliders attached to this bone.
   *
   * @param tail The tail you want to process
   */
  _collision(tail) {
    this.colliderGroups.forEach((colliderGroup) => {
      colliderGroup.colliders.forEach((collider) => {
        const dist = collider.shape.calculateCollision(collider.matrixWorld, tail, this.settings.hitRadius, _v3A);
        if (dist < 0) {
          tail.add(_v3A.multiplyScalar(-dist));
          tail.sub(_worldSpacePosition).normalize().multiplyScalar(this._worldSpaceBoneLength).add(_worldSpacePosition);
        }
      });
    });
  }
  /**
   * Calculate the {@link _worldSpaceBoneLength}.
   * Intended to be used in {@link update}.
   */
  _calcWorldSpaceBoneLength() {
    _v3A.setFromMatrixPosition(this.bone.matrixWorld);
    if (this.child) {
      _v3B.setFromMatrixPosition(this.child.matrixWorld);
    } else {
      _v3B.copy(this._initialLocalChildPosition);
      _v3B.applyMatrix4(this.bone.matrixWorld);
    }
    this._worldSpaceBoneLength = _v3A.sub(_v3B).length();
  }
  /**
   * Create a matrix that converts center space into world space.
   * @param target Target matrix
   */
  _getMatrixCenterToWorld(target) {
    if (this._center) {
      target.copy(this._center.matrixWorld);
    } else {
      target.identity();
    }
    return target;
  }
  /**
   * Create a matrix that converts world space into center space.
   * @param target Target matrix
   */
  _getMatrixWorldToCenter(target) {
    if (this._center) {
      target.copy(this._center.userData.inverseCacheProxy.inverse);
    } else {
      target.identity();
    }
    return target;
  }
};
function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
function traverseAncestorsFromRoot(object, callback) {
  const ancestors = [];
  let head = object;
  while (head !== null) {
    ancestors.unshift(head);
    head = head.parent;
  }
  ancestors.forEach((ancestor) => {
    callback(ancestor);
  });
}
function traverseChildrenUntilConditionMet(object, callback) {
  object.children.forEach((child) => {
    const result = callback(child);
    if (!result) {
      traverseChildrenUntilConditionMet(child, callback);
    }
  });
}
var VRMSpringBoneManager = class {
  constructor() {
    this._joints = /* @__PURE__ */ new Set();
    this._objectSpringBonesMap = /* @__PURE__ */ new Map();
  }
  get joints() {
    return this._joints;
  }
  /**
   * @deprecated Use {@link joints} instead.
   */
  get springBones() {
    console.warn("VRMSpringBoneManager: springBones is deprecated. use joints instead.");
    return this._joints;
  }
  get colliderGroups() {
    const set = /* @__PURE__ */ new Set();
    this._joints.forEach((springBone) => {
      springBone.colliderGroups.forEach((colliderGroup) => {
        set.add(colliderGroup);
      });
    });
    return Array.from(set);
  }
  get colliders() {
    const set = /* @__PURE__ */ new Set();
    this.colliderGroups.forEach((colliderGroup) => {
      colliderGroup.colliders.forEach((collider) => {
        set.add(collider);
      });
    });
    return Array.from(set);
  }
  addJoint(joint) {
    this._joints.add(joint);
    let objectSet = this._objectSpringBonesMap.get(joint.bone);
    if (objectSet == null) {
      objectSet = /* @__PURE__ */ new Set();
      this._objectSpringBonesMap.set(joint.bone, objectSet);
    }
    objectSet.add(joint);
  }
  /**
   * @deprecated Use {@link addJoint} instead.
   */
  addSpringBone(joint) {
    console.warn("VRMSpringBoneManager: addSpringBone() is deprecated. use addJoint() instead.");
    this.addJoint(joint);
  }
  deleteJoint(joint) {
    this._joints.delete(joint);
    const objectSet = this._objectSpringBonesMap.get(joint.bone);
    objectSet.delete(joint);
  }
  /**
   * @deprecated Use {@link deleteJoint} instead.
   */
  deleteSpringBone(joint) {
    console.warn("VRMSpringBoneManager: deleteSpringBone() is deprecated. use deleteJoint() instead.");
    this.deleteJoint(joint);
  }
  setInitState() {
    const springBonesTried = /* @__PURE__ */ new Set();
    const springBonesDone = /* @__PURE__ */ new Set();
    const objectUpdated = /* @__PURE__ */ new Set();
    for (const springBone of this._joints) {
      this._processSpringBone(springBone, springBonesTried, springBonesDone, objectUpdated, (springBone2) => springBone2.setInitState());
    }
  }
  reset() {
    const springBonesTried = /* @__PURE__ */ new Set();
    const springBonesDone = /* @__PURE__ */ new Set();
    const objectUpdated = /* @__PURE__ */ new Set();
    for (const springBone of this._joints) {
      this._processSpringBone(springBone, springBonesTried, springBonesDone, objectUpdated, (springBone2) => springBone2.reset());
    }
  }
  update(delta) {
    const springBonesTried = /* @__PURE__ */ new Set();
    const springBonesDone = /* @__PURE__ */ new Set();
    const objectUpdated = /* @__PURE__ */ new Set();
    for (const springBone of this._joints) {
      this._processSpringBone(springBone, springBonesTried, springBonesDone, objectUpdated, (springBone2) => springBone2.update(delta));
      traverseChildrenUntilConditionMet(springBone.bone, (object) => {
        var _a, _b;
        if (((_b = (_a = this._objectSpringBonesMap.get(object)) === null || _a === void 0 ? void 0 : _a.size) !== null && _b !== void 0 ? _b : 0) > 0) {
          return true;
        }
        object.updateWorldMatrix(false, false);
        return false;
      });
    }
  }
  /**
   * Update a spring bone.
   * If there are other spring bone that are dependant, it will try to update them recursively.
   * It updates matrixWorld of all ancestors and myself.
   * It might throw an error if there are circular dependencies.
   *
   * Intended to be used in {@link update} and {@link _processSpringBone} itself recursively.
   *
   * @param springBone A springBone you want to update
   * @param springBonesTried Set of springBones that are already tried to be updated
   * @param springBonesDone Set of springBones that are already up to date
   * @param objectUpdated Set of object3D whose matrixWorld is updated
   */
  _processSpringBone(springBone, springBonesTried, springBonesDone, objectUpdated, callback) {
    if (springBonesDone.has(springBone)) {
      return;
    }
    if (springBonesTried.has(springBone)) {
      throw new Error("VRMSpringBoneManager: Circular dependency detected while updating springbones");
    }
    springBonesTried.add(springBone);
    const depObjects = this._getDependencies(springBone);
    for (const depObject of depObjects) {
      traverseAncestorsFromRoot(depObject, (depObjectAncestor) => {
        const objectSet = this._objectSpringBonesMap.get(depObjectAncestor);
        if (objectSet) {
          for (const depSpringBone of objectSet) {
            this._processSpringBone(depSpringBone, springBonesTried, springBonesDone, objectUpdated, callback);
          }
        } else if (!objectUpdated.has(depObjectAncestor)) {
          depObjectAncestor.updateWorldMatrix(false, false);
          objectUpdated.add(depObjectAncestor);
        }
      });
    }
    springBone.bone.updateMatrix();
    springBone.bone.updateWorldMatrix(false, false);
    callback(springBone);
    objectUpdated.add(springBone.bone);
    springBonesDone.add(springBone);
  }
  /**
   * Return a set of objects that are dependant of given spring bone.
   * @param springBone A spring bone
   * @return A set of objects that are dependant of given spring bone
   */
  _getDependencies(springBone) {
    const set = /* @__PURE__ */ new Set();
    const parent = springBone.bone.parent;
    if (parent) {
      set.add(parent);
    }
    springBone.colliderGroups.forEach((colliderGroup) => {
      colliderGroup.colliders.forEach((collider) => {
        set.add(collider);
      });
    });
    return set;
  }
};
var POSSIBLE_SPEC_VERSIONS = /* @__PURE__ */ new Set(["1.0", "1.0-beta"]);
var VRMSpringBoneLoaderPlugin = class {
  constructor(parser, options) {
    this.parser = parser;
    this.jointHelperRoot = options === null || options === void 0 ? void 0 : options.jointHelperRoot;
    this.colliderHelperRoot = options === null || options === void 0 ? void 0 : options.colliderHelperRoot;
  }
  get name() {
    return VRMSpringBoneLoaderPlugin.EXTENSION_NAME;
  }
  afterRoot(gltf) {
    return __awaiter(this, void 0, void 0, function* () {
      gltf.userData.vrmSpringBoneManager = yield this._import(gltf);
    });
  }
  /**
   * Import spring bones from a GLTF and return a {@link VRMSpringBoneManager}.
   * It might return `null` instead when it does not need to be created or something go wrong.
   *
   * @param gltf A parsed result of GLTF taken from GLTFLoader
   */
  _import(gltf) {
    return __awaiter(this, void 0, void 0, function* () {
      const v1Result = yield this._v1Import(gltf);
      if (v1Result != null) {
        return v1Result;
      }
      const v0Result = yield this._v0Import(gltf);
      if (v0Result != null) {
        return v0Result;
      }
      return null;
    });
  }
  _v1Import(gltf) {
    var _a, _b, _c, _d, _e;
    return __awaiter(this, void 0, void 0, function* () {
      const json = gltf.parser.json;
      const isSpringBoneUsed = ((_a = json.extensionsUsed) === null || _a === void 0 ? void 0 : _a.indexOf(VRMSpringBoneLoaderPlugin.EXTENSION_NAME)) !== -1;
      if (!isSpringBoneUsed) {
        return null;
      }
      const manager = new VRMSpringBoneManager();
      const threeNodes = yield gltf.parser.getDependencies("node");
      const extension = (_b = json.extensions) === null || _b === void 0 ? void 0 : _b[VRMSpringBoneLoaderPlugin.EXTENSION_NAME];
      if (!extension) {
        return null;
      }
      const specVersion = extension.specVersion;
      if (!POSSIBLE_SPEC_VERSIONS.has(specVersion)) {
        console.warn(`VRMSpringBoneLoaderPlugin: Unknown ${VRMSpringBoneLoaderPlugin.EXTENSION_NAME} specVersion "${specVersion}"`);
        return null;
      }
      const colliders = (_c = extension.colliders) === null || _c === void 0 ? void 0 : _c.map((schemaCollider, iCollider) => {
        var _a2, _b2, _c2, _d2, _e2;
        const node = threeNodes[schemaCollider.node];
        const schemaShape = schemaCollider.shape;
        if (schemaShape.sphere) {
          return this._importSphereCollider(node, {
            offset: new Vector3().fromArray((_a2 = schemaShape.sphere.offset) !== null && _a2 !== void 0 ? _a2 : [0, 0, 0]),
            radius: (_b2 = schemaShape.sphere.radius) !== null && _b2 !== void 0 ? _b2 : 0
          });
        } else if (schemaShape.capsule) {
          return this._importCapsuleCollider(node, {
            offset: new Vector3().fromArray((_c2 = schemaShape.capsule.offset) !== null && _c2 !== void 0 ? _c2 : [0, 0, 0]),
            radius: (_d2 = schemaShape.capsule.radius) !== null && _d2 !== void 0 ? _d2 : 0,
            tail: new Vector3().fromArray((_e2 = schemaShape.capsule.tail) !== null && _e2 !== void 0 ? _e2 : [0, 0, 0])
          });
        }
        throw new Error(`VRMSpringBoneLoaderPlugin: The collider #${iCollider} has no valid shape`);
      });
      const colliderGroups = (_d = extension.colliderGroups) === null || _d === void 0 ? void 0 : _d.map((schemaColliderGroup, iColliderGroup) => {
        var _a2;
        const cols = ((_a2 = schemaColliderGroup.colliders) !== null && _a2 !== void 0 ? _a2 : []).map((iCollider) => {
          const col = colliders === null || colliders === void 0 ? void 0 : colliders[iCollider];
          if (col == null) {
            throw new Error(`VRMSpringBoneLoaderPlugin: The colliderGroup #${iColliderGroup} attempted to use a collider #${iCollider} but not found`);
          }
          return col;
        });
        return {
          colliders: cols,
          name: schemaColliderGroup.name
        };
      });
      (_e = extension.springs) === null || _e === void 0 ? void 0 : _e.forEach((schemaSpring, iSpring) => {
        var _a2;
        const schemaJoints = schemaSpring.joints;
        const colliderGroupsForSpring = (_a2 = schemaSpring.colliderGroups) === null || _a2 === void 0 ? void 0 : _a2.map((iColliderGroup) => {
          const group = colliderGroups === null || colliderGroups === void 0 ? void 0 : colliderGroups[iColliderGroup];
          if (group == null) {
            throw new Error(`VRMSpringBoneLoaderPlugin: The spring #${iSpring} attempted to use a colliderGroup ${iColliderGroup} but not found`);
          }
          return group;
        });
        const center = schemaSpring.center != null ? threeNodes[schemaSpring.center] : void 0;
        let prevSchemaJoint;
        schemaJoints.forEach((schemaJoint) => {
          if (prevSchemaJoint) {
            const nodeIndex = prevSchemaJoint.node;
            const node = threeNodes[nodeIndex];
            const childIndex = schemaJoint.node;
            const child = threeNodes[childIndex];
            const setting = {
              hitRadius: prevSchemaJoint.hitRadius,
              dragForce: prevSchemaJoint.dragForce,
              gravityPower: prevSchemaJoint.gravityPower,
              stiffness: prevSchemaJoint.stiffness,
              gravityDir: prevSchemaJoint.gravityDir != null ? new Vector3().fromArray(prevSchemaJoint.gravityDir) : void 0
            };
            const joint = this._importJoint(node, child, setting, colliderGroupsForSpring);
            if (center) {
              joint.center = center;
            }
            manager.addJoint(joint);
          }
          prevSchemaJoint = schemaJoint;
        });
      });
      manager.setInitState();
      return manager;
    });
  }
  _v0Import(gltf) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
      const json = gltf.parser.json;
      const isVRMUsed = ((_a = json.extensionsUsed) === null || _a === void 0 ? void 0 : _a.indexOf("VRM")) !== -1;
      if (!isVRMUsed) {
        return null;
      }
      const extension = (_b = json.extensions) === null || _b === void 0 ? void 0 : _b["VRM"];
      const schemaSecondaryAnimation = extension === null || extension === void 0 ? void 0 : extension.secondaryAnimation;
      if (!schemaSecondaryAnimation) {
        return null;
      }
      const schemaBoneGroups = schemaSecondaryAnimation === null || schemaSecondaryAnimation === void 0 ? void 0 : schemaSecondaryAnimation.boneGroups;
      if (!schemaBoneGroups) {
        return null;
      }
      const manager = new VRMSpringBoneManager();
      const threeNodes = yield gltf.parser.getDependencies("node");
      const colliderGroups = (_c = schemaSecondaryAnimation.colliderGroups) === null || _c === void 0 ? void 0 : _c.map((schemaColliderGroup) => {
        var _a2;
        const node = threeNodes[schemaColliderGroup.node];
        const colliders = ((_a2 = schemaColliderGroup.colliders) !== null && _a2 !== void 0 ? _a2 : []).map((schemaCollider, iCollider) => {
          var _a3, _b2, _c2;
          const offset = new Vector3(0, 0, 0);
          if (schemaCollider.offset) {
            offset.set((_a3 = schemaCollider.offset.x) !== null && _a3 !== void 0 ? _a3 : 0, (_b2 = schemaCollider.offset.y) !== null && _b2 !== void 0 ? _b2 : 0, schemaCollider.offset.z ? -schemaCollider.offset.z : 0);
          }
          return this._importSphereCollider(node, {
            offset,
            radius: (_c2 = schemaCollider.radius) !== null && _c2 !== void 0 ? _c2 : 0
          });
        });
        return { colliders };
      });
      schemaBoneGroups === null || schemaBoneGroups === void 0 ? void 0 : schemaBoneGroups.forEach((schemaBoneGroup, iBoneGroup) => {
        const rootIndices = schemaBoneGroup.bones;
        if (!rootIndices) {
          return;
        }
        rootIndices.forEach((rootIndex) => {
          var _a2, _b2, _c2, _d;
          const root = threeNodes[rootIndex];
          const gravityDir = new Vector3();
          if (schemaBoneGroup.gravityDir) {
            gravityDir.set((_a2 = schemaBoneGroup.gravityDir.x) !== null && _a2 !== void 0 ? _a2 : 0, (_b2 = schemaBoneGroup.gravityDir.y) !== null && _b2 !== void 0 ? _b2 : 0, (_c2 = schemaBoneGroup.gravityDir.z) !== null && _c2 !== void 0 ? _c2 : 0);
          } else {
            gravityDir.set(0, -1, 0);
          }
          const center = schemaBoneGroup.center != null ? threeNodes[schemaBoneGroup.center] : void 0;
          const setting = {
            hitRadius: schemaBoneGroup.hitRadius,
            dragForce: schemaBoneGroup.dragForce,
            gravityPower: schemaBoneGroup.gravityPower,
            stiffness: schemaBoneGroup.stiffiness,
            gravityDir
          };
          const colliderGroupsForSpring = (_d = schemaBoneGroup.colliderGroups) === null || _d === void 0 ? void 0 : _d.map((iColliderGroup) => {
            const group = colliderGroups === null || colliderGroups === void 0 ? void 0 : colliderGroups[iColliderGroup];
            if (group == null) {
              throw new Error(`VRMSpringBoneLoaderPlugin: The spring #${iBoneGroup} attempted to use a colliderGroup ${iColliderGroup} but not found`);
            }
            return group;
          });
          root.traverse((node) => {
            var _a3;
            const child = (_a3 = node.children[0]) !== null && _a3 !== void 0 ? _a3 : null;
            const joint = this._importJoint(node, child, setting, colliderGroupsForSpring);
            if (center) {
              joint.center = center;
            }
            manager.addJoint(joint);
          });
        });
      });
      gltf.scene.updateMatrixWorld();
      manager.setInitState();
      return manager;
    });
  }
  _importJoint(node, child, setting, colliderGroupsForSpring) {
    const springBone = new VRMSpringBoneJoint(node, child, setting, colliderGroupsForSpring);
    if (this.jointHelperRoot) {
      const helper = new VRMSpringBoneJointHelper(springBone);
      this.jointHelperRoot.add(helper);
      helper.renderOrder = this.jointHelperRoot.renderOrder;
    }
    return springBone;
  }
  _importSphereCollider(destination, params) {
    const { offset, radius } = params;
    const shape = new VRMSpringBoneColliderShapeSphere({ offset, radius });
    const collider = new VRMSpringBoneCollider(shape);
    destination.add(collider);
    if (this.colliderHelperRoot) {
      const helper = new VRMSpringBoneColliderHelper(collider);
      this.colliderHelperRoot.add(helper);
      helper.renderOrder = this.colliderHelperRoot.renderOrder;
    }
    return collider;
  }
  _importCapsuleCollider(destination, params) {
    const { offset, radius, tail } = params;
    const shape = new VRMSpringBoneColliderShapeCapsule({ offset, radius, tail });
    const collider = new VRMSpringBoneCollider(shape);
    destination.add(collider);
    if (this.colliderHelperRoot) {
      const helper = new VRMSpringBoneColliderHelper(collider);
      this.colliderHelperRoot.add(helper);
      helper.renderOrder = this.colliderHelperRoot.renderOrder;
    }
    return collider;
  }
};
VRMSpringBoneLoaderPlugin.EXTENSION_NAME = "VRMC_springBone";
var VRMLoaderPlugin = class {
  constructor(parser, options) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    this.parser = parser;
    const helperRoot = options === null || options === void 0 ? void 0 : options.helperRoot;
    const autoUpdateHumanBones = options === null || options === void 0 ? void 0 : options.autoUpdateHumanBones;
    this.expressionPlugin = (_a = options === null || options === void 0 ? void 0 : options.expressionPlugin) !== null && _a !== void 0 ? _a : new VRMExpressionLoaderPlugin(parser);
    this.firstPersonPlugin = (_b = options === null || options === void 0 ? void 0 : options.firstPersonPlugin) !== null && _b !== void 0 ? _b : new VRMFirstPersonLoaderPlugin(parser);
    this.humanoidPlugin = (_c = options === null || options === void 0 ? void 0 : options.humanoidPlugin) !== null && _c !== void 0 ? _c : new VRMHumanoidLoaderPlugin(parser, {
      helperRoot,
      autoUpdateHumanBones
    });
    this.lookAtPlugin = (_d = options === null || options === void 0 ? void 0 : options.lookAtPlugin) !== null && _d !== void 0 ? _d : new VRMLookAtLoaderPlugin(parser, { helperRoot });
    this.metaPlugin = (_e = options === null || options === void 0 ? void 0 : options.metaPlugin) !== null && _e !== void 0 ? _e : new VRMMetaLoaderPlugin(parser);
    this.mtoonMaterialPlugin = (_f = options === null || options === void 0 ? void 0 : options.mtoonMaterialPlugin) !== null && _f !== void 0 ? _f : new MToonMaterialLoaderPlugin(parser);
    this.materialsHDREmissiveMultiplierPlugin = (_g = options === null || options === void 0 ? void 0 : options.materialsHDREmissiveMultiplierPlugin) !== null && _g !== void 0 ? _g : new VRMMaterialsHDREmissiveMultiplierLoaderPlugin(parser);
    this.materialsV0CompatPlugin = (_h = options === null || options === void 0 ? void 0 : options.materialsV0CompatPlugin) !== null && _h !== void 0 ? _h : new VRMMaterialsV0CompatPlugin(parser);
    this.springBonePlugin = (_j = options === null || options === void 0 ? void 0 : options.springBonePlugin) !== null && _j !== void 0 ? _j : new VRMSpringBoneLoaderPlugin(parser, {
      colliderHelperRoot: helperRoot,
      jointHelperRoot: helperRoot
    });
    this.nodeConstraintPlugin = (_k = options === null || options === void 0 ? void 0 : options.nodeConstraintPlugin) !== null && _k !== void 0 ? _k : new VRMNodeConstraintLoaderPlugin(parser, { helperRoot });
  }
  get name() {
    return "VRMLoaderPlugin";
  }
  beforeRoot() {
    return __awaiter$5(this, void 0, void 0, function* () {
      yield this.materialsV0CompatPlugin.beforeRoot();
      yield this.mtoonMaterialPlugin.beforeRoot();
    });
  }
  loadMesh(meshIndex) {
    return __awaiter$5(this, void 0, void 0, function* () {
      return yield this.mtoonMaterialPlugin.loadMesh(meshIndex);
    });
  }
  getMaterialType(materialIndex) {
    const mtoonType = this.mtoonMaterialPlugin.getMaterialType(materialIndex);
    if (mtoonType != null) {
      return mtoonType;
    }
    return null;
  }
  extendMaterialParams(materialIndex, materialParams) {
    return __awaiter$5(this, void 0, void 0, function* () {
      yield this.materialsHDREmissiveMultiplierPlugin.extendMaterialParams(materialIndex, materialParams);
      yield this.mtoonMaterialPlugin.extendMaterialParams(materialIndex, materialParams);
    });
  }
  afterRoot(gltf) {
    return __awaiter$5(this, void 0, void 0, function* () {
      yield this.metaPlugin.afterRoot(gltf);
      yield this.humanoidPlugin.afterRoot(gltf);
      yield this.expressionPlugin.afterRoot(gltf);
      yield this.lookAtPlugin.afterRoot(gltf);
      yield this.firstPersonPlugin.afterRoot(gltf);
      yield this.springBonePlugin.afterRoot(gltf);
      yield this.nodeConstraintPlugin.afterRoot(gltf);
      yield this.mtoonMaterialPlugin.afterRoot(gltf);
      const meta = gltf.userData.vrmMeta;
      const humanoid = gltf.userData.vrmHumanoid;
      if (meta && humanoid) {
        const vrm = new VRM({
          scene: gltf.scene,
          expressionManager: gltf.userData.vrmExpressionManager,
          firstPerson: gltf.userData.vrmFirstPerson,
          humanoid,
          lookAt: gltf.userData.vrmLookAt,
          meta,
          materials: gltf.userData.vrmMToonMaterials,
          springBoneManager: gltf.userData.vrmSpringBoneManager,
          nodeConstraintManager: gltf.userData.vrmNodeConstraintManager
        });
        gltf.userData.vrm = vrm;
      }
    });
  }
};
function disposeMaterial(material) {
  Object.values(material).forEach((value) => {
    if (value === null || value === void 0 ? void 0 : value.isTexture) {
      const texture = value;
      texture.dispose();
    }
  });
  if (material.isShaderMaterial) {
    const uniforms = material.uniforms;
    if (uniforms) {
      Object.values(uniforms).forEach((uniform) => {
        const value = uniform.value;
        if (value === null || value === void 0 ? void 0 : value.isTexture) {
          const texture = value;
          texture.dispose();
        }
      });
    }
  }
  material.dispose();
}
function dispose(object3D) {
  const geometry = object3D.geometry;
  if (geometry) {
    geometry.dispose();
  }
  const skeleton = object3D.skeleton;
  if (skeleton) {
    skeleton.dispose();
  }
  const material = object3D.material;
  if (material) {
    if (Array.isArray(material)) {
      material.forEach((material2) => disposeMaterial(material2));
    } else if (material) {
      disposeMaterial(material);
    }
  }
}
function deepDispose(object3D) {
  object3D.traverse(dispose);
}
function removeUnnecessaryJoints(root) {
  const skeletonList = /* @__PURE__ */ new Map();
  root.traverse((obj) => {
    if (obj.type !== "SkinnedMesh") {
      return;
    }
    const mesh = obj;
    const geometry = mesh.geometry;
    const attribute = geometry.getAttribute("skinIndex");
    let skeleton = skeletonList.get(attribute);
    if (!skeleton) {
      const bones = [];
      const boneInverses = [];
      const boneIndexMap = {};
      const array = attribute.array;
      for (let i = 0; i < array.length; i++) {
        const index = array[i];
        if (boneIndexMap[index] === void 0) {
          boneIndexMap[index] = bones.length;
          bones.push(mesh.skeleton.bones[index]);
          boneInverses.push(mesh.skeleton.boneInverses[index]);
        }
        array[i] = boneIndexMap[index];
      }
      attribute.copyArray(array);
      attribute.needsUpdate = true;
      skeleton = new Skeleton(bones, boneInverses);
      skeletonList.set(attribute, skeleton);
    }
    mesh.bind(skeleton, new Matrix4());
  });
}
function removeUnnecessaryVertices(root) {
  const geometryMap = /* @__PURE__ */ new Map();
  root.traverse((obj) => {
    var _a, _b, _c, _d;
    if (!obj.isMesh) {
      return;
    }
    const mesh = obj;
    const geometry = mesh.geometry;
    const origianlIndex = geometry.index;
    if (origianlIndex == null) {
      return;
    }
    const newGeometryAlreadyExisted = geometryMap.get(geometry);
    if (newGeometryAlreadyExisted != null) {
      mesh.geometry = newGeometryAlreadyExisted;
      return;
    }
    const newGeometry = new BufferGeometry();
    newGeometry.name = geometry.name;
    newGeometry.morphTargetsRelative = geometry.morphTargetsRelative;
    geometry.groups.forEach((group) => {
      newGeometry.addGroup(group.start, group.count, group.materialIndex);
    });
    newGeometry.boundingBox = (_b = (_a = geometry.boundingBox) === null || _a === void 0 ? void 0 : _a.clone()) !== null && _b !== void 0 ? _b : null;
    newGeometry.boundingSphere = (_d = (_c = geometry.boundingSphere) === null || _c === void 0 ? void 0 : _c.clone()) !== null && _d !== void 0 ? _d : null;
    newGeometry.setDrawRange(geometry.drawRange.start, geometry.drawRange.count);
    newGeometry.userData = geometry.userData;
    geometryMap.set(geometry, newGeometry);
    const originalIndexNewIndexMap = [];
    const newIndexOriginalIndexMap = [];
    {
      const originalIndexArray = origianlIndex.array;
      const newIndexArray = new originalIndexArray.constructor(originalIndexArray.length);
      let indexHead = 0;
      for (let i = 0; i < originalIndexArray.length; i++) {
        const originalIndex = originalIndexArray[i];
        let newIndex = originalIndexNewIndexMap[originalIndex];
        if (newIndex == null) {
          originalIndexNewIndexMap[originalIndex] = indexHead;
          newIndexOriginalIndexMap[indexHead] = originalIndex;
          newIndex = indexHead;
          indexHead++;
        }
        newIndexArray[i] = newIndex;
      }
      newGeometry.setIndex(new BufferAttribute(newIndexArray, 1, false));
    }
    Object.keys(geometry.attributes).forEach((attributeName) => {
      const originalAttribute = geometry.attributes[attributeName];
      if (originalAttribute.isInterleavedBufferAttribute) {
        throw new Error("removeUnnecessaryVertices: InterleavedBufferAttribute is not supported");
      }
      const originalAttributeArray = originalAttribute.array;
      const { itemSize, normalized } = originalAttribute;
      const newAttributeArray = new originalAttributeArray.constructor(newIndexOriginalIndexMap.length * itemSize);
      newIndexOriginalIndexMap.forEach((originalIndex, i) => {
        for (let j = 0; j < itemSize; j++) {
          newAttributeArray[i * itemSize + j] = originalAttributeArray[originalIndex * itemSize + j];
        }
      });
      newGeometry.setAttribute(attributeName, new BufferAttribute(newAttributeArray, itemSize, normalized));
    });
    let isNullMorph = true;
    Object.keys(geometry.morphAttributes).forEach((attributeName) => {
      newGeometry.morphAttributes[attributeName] = [];
      const morphs = geometry.morphAttributes[attributeName];
      for (let iMorph = 0; iMorph < morphs.length; iMorph++) {
        const originalAttribute = morphs[iMorph];
        if (originalAttribute.isInterleavedBufferAttribute) {
          throw new Error("removeUnnecessaryVertices: InterleavedBufferAttribute is not supported");
        }
        const originalAttributeArray = originalAttribute.array;
        const { itemSize, normalized } = originalAttribute;
        const newAttributeArray = new originalAttributeArray.constructor(newIndexOriginalIndexMap.length * itemSize);
        newIndexOriginalIndexMap.forEach((originalIndex, i) => {
          for (let j = 0; j < itemSize; j++) {
            newAttributeArray[i * itemSize + j] = originalAttributeArray[originalIndex * itemSize + j];
          }
        });
        isNullMorph = isNullMorph && newAttributeArray.every((v) => v === 0);
        newGeometry.morphAttributes[attributeName][iMorph] = new BufferAttribute(newAttributeArray, itemSize, normalized);
      }
    });
    if (isNullMorph) {
      newGeometry.morphAttributes = {};
    }
    mesh.geometry = newGeometry;
  });
  Array.from(geometryMap.keys()).forEach((originalGeometry) => {
    originalGeometry.dispose();
  });
}
function rotateVRM0(vrm) {
  var _a;
  if (((_a = vrm.meta) === null || _a === void 0 ? void 0 : _a.metaVersion) === "0") {
    vrm.scene.rotation.y = Math.PI;
  }
}
var VRMUtils = class {
  constructor() {
  }
};
VRMUtils.deepDispose = deepDispose;
VRMUtils.removeUnnecessaryJoints = removeUnnecessaryJoints;
VRMUtils.removeUnnecessaryVertices = removeUnnecessaryVertices;
VRMUtils.rotateVRM0 = rotateVRM0;
export {
  MToonMaterial,
  MToonMaterialDebugMode,
  MToonMaterialLoaderPlugin,
  MToonMaterialOutlineWidthMode,
  VRM,
  VRMAimConstraint,
  VRMCore,
  VRMCoreLoaderPlugin,
  VRMExpression,
  VRMExpressionLoaderPlugin,
  VRMExpressionManager,
  VRMExpressionMaterialColorType,
  VRMExpressionOverrideType,
  VRMExpressionPresetName,
  VRMFirstPerson,
  VRMFirstPersonLoaderPlugin,
  VRMFirstPersonMeshAnnotationType,
  VRMHumanBoneList,
  VRMHumanBoneName,
  VRMHumanBoneParentMap,
  VRMHumanoid,
  VRMHumanoidHelper,
  VRMHumanoidLoaderPlugin,
  VRMLoaderPlugin,
  VRMLookAt,
  VRMLookAtBoneApplier,
  VRMLookAtExpressionApplier,
  VRMLookAtHelper,
  VRMLookAtLoaderPlugin,
  VRMLookAtRangeMap,
  VRMLookAtTypeName,
  VRMMetaLoaderPlugin,
  VRMNodeConstraint,
  VRMNodeConstraintHelper,
  VRMNodeConstraintLoaderPlugin,
  VRMNodeConstraintManager,
  VRMRequiredHumanBoneName,
  VRMRollConstraint,
  VRMRotationConstraint,
  VRMSpringBoneCollider,
  VRMSpringBoneColliderHelper,
  VRMSpringBoneColliderShape,
  VRMSpringBoneColliderShapeCapsule,
  VRMSpringBoneColliderShapeSphere,
  VRMSpringBoneJoint,
  VRMSpringBoneJointHelper,
  VRMSpringBoneLoaderPlugin,
  VRMSpringBoneManager,
  VRMUtils
};
/*! Bundled license information:

@pixiv/three-vrm/lib/three-vrm.module.js:
  (*!
   * @pixiv/three-vrm v1.0.9
   * VRM file loader for three.js.
   *
   * Copyright (c) 2019-2023 pixiv Inc.
   * @pixiv/three-vrm is distributed under MIT License
   * https://github.com/pixiv/three-vrm/blob/release/LICENSE
   *)
  (*!
   * @pixiv/three-vrm-core v1.0.9
   * The implementation of core features of VRM, for @pixiv/three-vrm
   *
   * Copyright (c) 2020-2023 pixiv Inc.
   * @pixiv/three-vrm-core is distributed under MIT License
   * https://github.com/pixiv/three-vrm/blob/release/LICENSE
   *)
  (*!
   * @pixiv/three-vrm-materials-mtoon v1.0.9
   * MToon (toon material) module for @pixiv/three-vrm
   *
   * Copyright (c) 2020-2023 pixiv Inc.
   * @pixiv/three-vrm-materials-mtoon is distributed under MIT License
   * https://github.com/pixiv/three-vrm/blob/release/LICENSE
   *)
  (*!
   * @pixiv/three-vrm-materials-hdr-emissive-multiplier v1.0.9
   * Support VRMC_hdr_emissiveMultiplier for @pixiv/three-vrm
   *
   * Copyright (c) 2020-2023 pixiv Inc.
   * @pixiv/three-vrm-materials-hdr-emissive-multiplier is distributed under MIT License
   * https://github.com/pixiv/three-vrm/blob/release/LICENSE
   *)
  (*!
   * @pixiv/three-vrm-materials-v0compat v1.0.9
   * VRM0.0 materials compatibility layer plugin for @pixiv/three-vrm
   *
   * Copyright (c) 2020-2023 pixiv Inc.
   * @pixiv/three-vrm-materials-v0compat is distributed under MIT License
   * https://github.com/pixiv/three-vrm/blob/release/LICENSE
   *)
  (*!
   * @pixiv/three-vrm-node-constraint v1.0.9
   * Node constraint module for @pixiv/three-vrm
   *
   * Copyright (c) 2020-2023 pixiv Inc.
   * @pixiv/three-vrm-node-constraint is distributed under MIT License
   * https://github.com/pixiv/three-vrm/blob/release/LICENSE
   *)
  (*!
   * @pixiv/three-vrm-springbone v1.0.9
   * Spring bone module for @pixiv/three-vrm
   *
   * Copyright (c) 2020-2023 pixiv Inc.
   * @pixiv/three-vrm-springbone is distributed under MIT License
   * https://github.com/pixiv/three-vrm/blob/release/LICENSE
   *)
*/
//# sourceMappingURL=@pixiv_three-vrm.js.map
