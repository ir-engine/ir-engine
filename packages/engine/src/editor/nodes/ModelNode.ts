import { Box3, Sphere, PropertyBinding, BufferGeometry, MathUtils, Matrix4, Quaternion, Vector3 } from "three";
import Model from "../../scene/classes/Model";
import EditorNodeMixin from "./EditorNodeMixin";
import { setStaticMode, StaticModes } from "../functions/StaticMode";
import cloneObject3D from "../functions/cloneObject3D";
import { RethrownError } from "../functions/errors";
import {
  getObjectPerfIssues,
  maybeAddLargeFileIssue
} from "../functions/performance";
import { getGeometry } from '../../physics/classes/three-to-cannon';
import { plusParameter } from '../../scene/constants/SceneObjectLoadingSchema';
import { LoadGLTF } from "../../assets/functions/LoadGLTF";
export default class ModelNode extends EditorNodeMixin(Model) {
  static nodeName = "Model";
  static legacyComponentName = "gltf-model";
  static initialElementProps = {
    initialScale: "fit",
    src: ""
  };

  meshColliders = []

  static async deserialize(editor, json, loadAsync, onError) {
    const node = await super.deserialize(editor, json);
    loadAsync(
      (async () => {
        const { src, attribution } = json.components.find(
          c => c.name === "gltf-model"
        ).props;

        await node.load(src, onError);
        // Legacy, might be a raw string left over before switch to JSON.
        if (attribution && typeof attribution === "string") {
          const [name, author] = attribution.split(" by ");
          node.attribution = { name, author };
        } else {
          node.attribution = attribution;
        }
        node.collidable = !!json.components.find(c => c.name === "collidable");
        node.saveColliders = !!json.components.find(c => c.name === "mesh-collider-0");
        node.walkable = !!json.components.find(c => c.name === "walkable");
        const loopAnimationComponent = json.components.find(
          c => c.name === "loop-animation"
        );
        if (loopAnimationComponent && loopAnimationComponent.props) {
          const { clip, activeClipIndex } = loopAnimationComponent.props;
          if (activeClipIndex !== undefined) {
            node.activeClipIndex = loopAnimationComponent.props.activeClipIndex;
          } else if (
            clip !== undefined &&
            node.model &&
            node.model.animations
          ) {
            // DEPRECATED: Old loop-animation component stored the clip name rather than the clip index
            // node.activeClipIndex = node.model.animations.findIndex(
            //   animation => animation.name === clip
            // );
            const clipIndex = node.model.animations.findIndex(animation => animation.name === clip);

            if (clipIndex !== -1) {
              node.activeClipIndices = [clipIndex];
            }
          }
        }
        const shadowComponent = json.components.find(c => c.name === "shadow");
        if (shadowComponent) {
          node.castShadow = shadowComponent.props.cast;
          node.receiveShadow = shadowComponent.props.receive;
        }
        const ineractableComponent = json.components.find(c => c.name === "interact");

        if(ineractableComponent){
          node.interactable = ineractableComponent.props.interactable;
          node.interactionType = ineractableComponent.props.interactionType;
          node.interactionText = ineractableComponent.props.interactionText;
          node.payloadName = ineractableComponent.props.payloadName;
          node.payloadUrl = ineractableComponent.props.payloadUrl;
          node.payloadBuyUrl = ineractableComponent.props.payloadBuyUrl;
          node.payloadLearnMoreUrl = ineractableComponent.props.payloadLearnMoreUrl;
          node.payloadHtmlContent = ineractableComponent.props.payloadHtmlContent;
          node.payloadUrl = ineractableComponent.props.payloadUrl;
        }
      })()
    );
    return node;
  }
  constructor(editor) {
    super(editor);
    this.attribution = null;
    this._canonicalUrl = "";
    this.collidable = true;
    this.saveColliders = false;
    this.walkable = true;
    this.initialScale = 1;
    this.boundingBox = new Box3();
    this.boundingSphere = new Sphere();
    this.gltfJson = null;
  }
  // Overrides Model's src property and stores the original (non-resolved) url.
  get src(): string {
    return this._canonicalUrl;
  }
  // When getters are overridden you must also override the setter.
  set src(value: string) {
    this.load(value).catch(console.error);
  }
  // Overrides Model's loadGLTF method and uses the Editor's gltf cache.
  async loadGLTF(src) {
    const loadPromise = this.editor.gltfCache.get(src);
    const{ scene, json} = await loadPromise;
    this.gltfJson = json;
    const clonedScene = cloneObject3D(scene);
    return clonedScene;
  }
  // Overrides Model's load method and resolves the src url before loading.
  async load(src, onError?) {
    if(src.startsWith('/')) {
      src = window.location.origin + src;
    }
    const nextSrc = src || "";
    if (nextSrc === this._canonicalUrl && nextSrc !== "") {
      return;
    }
    this._canonicalUrl = nextSrc;
    this.attribution = null;
    this.issues = [];
    this.gltfJson = null;
    if (this.model) {
      this.editor.renderer.removeBatchedObject(this.model);
      this.remove(this.model);
      this.model = null;
    }
    this.hideErrorIcon();
    try {
      console.log("Try");

      const { accessibleUrl, files } = await this.editor.api.resolveMedia(src);
      if (this.model) {
        this.editor.renderer.removeBatchedObject(this.model);
      }
      await super.load(accessibleUrl);

      if (this.initialScale === "fit") {
        this.scale.set(1, 1, 1);
        if (this.model) {
          this.updateMatrixWorld();
          this.boundingBox.setFromObject(this.model);
          this.boundingBox.getBoundingSphere(this.boundingSphere);
          const diameter = this.boundingSphere.radius * 2;
          if ((diameter > 1000 || diameter < 0.1) && diameter !== 0) {
            // Scale models that are too big or to small to fit in a 1m bounding sphere.
            const scaleFactor = 1 / diameter;
            this.scale.set(scaleFactor, scaleFactor, scaleFactor);
          } else if (diameter > 20) {
            // If the bounding sphere of a model is over 20m in diameter, assume that the model was
            // exported with units as centimeters and convert to meters.
            this.scale.set(0.01, 0.01, 0.01);
          }
        }
        // Clear scale to fit property so that the swapped model maintains the same scale.
        this.initialScale = 1;
      } else {
        this.scale.multiplyScalar(this.initialScale);
        this.initialScale = 1;
      }
      if (this.model) {
        this.model.traverse(object => {
          if (object.material && object.material.isMeshStandardMaterial) {
            object.material.envMap = this.editor.scene.environmentMap;
            object.material.needsUpdate = true;
          }
        });
        this.issues = getObjectPerfIssues(this.model);
      }
      this.updateStaticModes();
    } catch (error) {
      this.showErrorIcon();
      const modelError = new RethrownError(
        `Error loading model "${this._canonicalUrl}"`,
        error
      );
      if (onError) {
        onError(this, modelError);
      }
      console.error(modelError);
      this.issues.push({ severity: "error", message: "Error loading model." });
      this._canonicalUrl = "";
    }
    this.editor.emit("objectsChanged", [this]);
    this.editor.emit("selectionChanged");
    // this.hideLoadingCube();
    return this;
  }
  onAdd() {
    if (this.model) {
      this.editor.renderer.addBatchedObject(this.model);
    }
  }
  onRemove() {
    if (this.model) {
      this.editor.renderer.removeBatchedObject(this.model);
    }
  }
  onPlay() {
    this.playAnimation();
  }
  onPause() {
    this.stopAnimation();
  }
  onUpdate(dt) {
    super.onUpdate(dt);
    if (this.editor.playing) {
      this.update(dt);
    }
  }



  parseAndSaveColliders(components) {
    if (this.model) {
      // Set up colliders
      const colliders = []

        const parseGroupColliders = ( group ) => {
          if (group.userData.data === 'physics' || group.userData.data === 'dynamic' || group.userData.data === 'vehicle') {
            if (group.type == 'Group') {
              for (let i = 0; i < group.children.length; i++) {
                parseColliders(group.userData.type, group.position, group.quaternion, group.scale, group.children[i] );
              }
            } else if (group.type == 'Mesh') {
              parseColliders(group.userData.type, group.position, group.quaternion, group.scale, group );
            }
          }
        }

        const parseColliders = ( type, position, quaternion, scale, mesh ) => {

          let geometry = null;
           if(type == "trimesh") {
             geometry = getGeometry(mesh);
            }
            const meshCollider = {
                type: type,
                position: {
                  x: position.x,
                  y: position.y,
                  z: position.z
                },
                quaternion: {
                  x: quaternion.x,
                  y: quaternion.y,
                  z: quaternion.z,
                  w: quaternion.w
                },

                scale: {
                  x: scale.x,
                  y: scale.y,
                  z: scale.z
                },
                vertices: (geometry != null ? Array.from(geometry.attributes.position.array).map((v: number) => parseFloat((Math.round(v * 10000)/10000).toFixed(4))): null),
                indices: (geometry != null && geometry.index ? Array.from(geometry.index.array): null)
              }
              colliders.push(meshCollider);

        }
        this.model.traverse( parseGroupColliders );
        this.meshColliders = colliders;
        this.editor.renderer.addBatchedObject(this.model);
      }

    for(let i = 0; i < this.meshColliders.length; i++) {
      components[`mesh-collider-${i}`] = this.addEditorParametersToCollider(this.meshColliders[i]);
    }
  }
  addEditorParametersToCollider(collider) {
    const [position, quaternion, scale] = plusParameter(
      collider.position,
      collider.quaternion,
      collider.scale,
      this.position,
      this.quaternion,
      this.scale
    );
    collider.position.x = position.x;
    collider.position.y = position.y;
    collider.position.z = position.z;
    collider.quaternion.x = quaternion.x;
    collider.quaternion.y = quaternion.y;
    collider.quaternion.z = quaternion.z;
    collider.quaternion.w = quaternion.w;
    collider.scale.x = scale.x;
    collider.scale.y = scale.y;
    collider.scale.z = scale.z;
    return collider;
  }
  updateStaticModes() {
    if (!this.model) return;
    setStaticMode(this.model, StaticModes.Static);
    if (this.model.animations && this.model.animations.length > 0) {
      for (const animation of this.model.animations) {
        for (const track of animation.tracks) {
          const { nodeName: uuid } = PropertyBinding.parseTrackName(track.name);
          const animatedNode = this.model.getObjectByProperty("uuid", uuid);
          if (!animatedNode) {
            throw new Error(
              `Model.updateStaticModes: model with url "${
                this._canonicalUrl
              }" has an invalid animation "${animation.name}"`
            );
          }
          setStaticMode(animatedNode, StaticModes.Dynamic);
        }
      }
    }
  }
  serialize() {
    const components = {
      "gltf-model": {
        src: this._canonicalUrl,
        attribution: this.attribution,
        parseColliders: !this.saveColliders
      },
      shadow: {
        cast: this.castShadow,
        receive: this.receiveShadow
      },
      interact: {
        interactable: this.interactable,
        interactionType : this.interactionType,
        interactionText : this.interactionText,
        payloadName : this.payloadName,
        payloadUrl : this.payloadUrl,
        payloadBuyUrl : this.payloadBuyUrl,
        payloadLearnMoreUrl : this.payloadLearnMoreUrl,
        payloadHtmlContent : this.payloadHtmlContent,
        payloadModelUrl : this._canonicalUrl,
      }
    };
    if (this.saveColliders) {
      this.parseAndSaveColliders(components);
    }
    if (this.activeClipIndex !== -1) {
      components["loop-animation"] = {
        activeClipIndex: this.activeClipIndex
      };
    }
    if (this.collidable) {
      components["collidable"] = {};
    }
    if (this.walkable) {
      components["walkable"] = {};
    }
    return super.serialize(components);
  }
  copy(source, recursive = true) {
    super.copy(source, recursive);
    if (source.loadingCube) {
      this.initialScale = source.initialScale;
      this.load(source.src);
    } else {
      this.updateStaticModes();
      this.gltfJson = source.gltfJson;
      this._canonicalUrl = source._canonicalUrl;
    }
    this.attribution = source.attribution;
    this.collidable = source.collidable;
    this.saveColliders = source.saveColliders;
    this.walkable = source.walkable;
    return this;
  }
  // @ts-ignore
  prepareForExport(ctx) {
    super.prepareForExport();
    this.addGLTFComponent("shadow", {
      cast: this.castShadow,
      receive: this.receiveShadow
    });
    // TODO: Support exporting more than one active clip.
    if (this.activeClip) {
      const activeClipIndex = ctx.animations.indexOf(this.activeClip);
      if (activeClipIndex === -1) {
        throw new Error(
          `Error exporting model "${this.name}" with url "${
            this._canonicalUrl
          }". Animation could not be found.`
        );
      } else {
        this.addGLTFComponent("loop-animation", {
          activeClipIndex: activeClipIndex
        });
      }
    }
  }
}
