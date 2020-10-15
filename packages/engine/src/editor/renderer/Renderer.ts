import {
  Color,
  Layers,
  MeshBasicMaterial,
  MeshNormalMaterial,
  Vector2
} from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import ScenePreviewCameraNode from "../nodes/ScenePreviewCameraNode";
import { getCanvasBlob } from "../../common/utils/thumbnails";
import makeRenderer from "./makeRenderer";
import OutlinePass from "./OutlinePass";
/**
 * @author mrdoob / http://mrdoob.com/
 */
class RenderMode {
  name: string;
  renderer: any;
  editor: any;
  passes: any[];
  enableShadows: boolean;
  constructor(renderer, editor) {
    this.name = "Default";
    this.renderer = renderer;
    this.editor = editor;
    this.passes = [];
    this.enableShadows = false;
  }
  render(dt?) {}
}
class UnlitRenderMode extends RenderMode {
  effectComposer: EffectComposer;
  renderPass: RenderPass;
  renderHelpersPass: RenderPass;
  outlinePass: any;
  enabledBatchedObjectLayers: Layers;
  disabledBatchedObjectLayers: Layers;
  hiddenLayers: Layers;
  disableBatching: boolean;
  editorRenderer: any;
  constructor(renderer, editor, editorRenderer) {
    super(renderer, editor);
    this.name = "Unlit";
    this.effectComposer = new EffectComposer(renderer);
    this.renderPass = new RenderPass(editor.scene, editor.camera);
    this.effectComposer.addPass(this.renderPass);
    this.renderHelpersPass = new RenderPass(editor.helperScene, editor.camera);
    this.renderHelpersPass.clear = false;
    this.effectComposer.addPass(this.renderHelpersPass);
    const canvasParent = renderer.domElement.parentElement;
    this.outlinePass = new OutlinePass(
      new Vector2(canvasParent.offsetWidth, canvasParent.offsetHeight),
      editor.scene,
      editor.camera,
      editor.selectedTransformRoots,
      editorRenderer
    ) as any;
    this.outlinePass.edgeColor = new Color("#006EFF");
    this.outlinePass.renderToScreen = true;
    this.effectComposer.addPass(this.outlinePass);
    this.enableShadows = false;
    this.enabledBatchedObjectLayers = new Layers();
    this.disabledBatchedObjectLayers = new Layers();
    this.disabledBatchedObjectLayers.disable(0);
    this.disabledBatchedObjectLayers.enable(2);
    this.hiddenLayers = new Layers();
    this.hiddenLayers.set(1);
    this.disableBatching = false;
    this.editorRenderer = editorRenderer;
  }
  onSceneSet() {
    this.renderer.shadowMap.enabled = this.enableShadows;
    this.editor.scene.traverse(object => {
      if (object.setShadowsEnabled) {
        object.setShadowsEnabled(this.enableShadows);
      }
      if (
        this.disableBatching &&
        object.isMesh &&
        !object.layers.test(this.enabledBatchedObjectLayers) &&
        !object.layers.test(this.hiddenLayers)
      ) {
        object.layers.enable(0);
        object.layers.enable(2);
      } else if (
        !this.disableBatching &&
        object.isMesh &&
        object.layers.test(this.disabledBatchedObjectLayers) &&
        !object.layers.test(this.hiddenLayers)
      ) {
        object.layers.disable(0);
        object.layers.disable(2);
      }
    });
    this.renderPass.scene = this.editor.scene;
    this.renderPass.camera = this.editor.camera;
    this.outlinePass.renderScene = this.editor.scene;
    this.outlinePass.renderCamera = this.editor.camera;
  }
  onResize() {
    const canvasParent = this.renderer.domElement.parentElement;
    this.renderer.setSize(
      canvasParent.offsetWidth,
      canvasParent.offsetHeight,
      false
    );
  }
  render(dt) {
    this.effectComposer.render(dt);
  }
}
class LitRenderMode extends UnlitRenderMode {
  constructor(renderer, editor, editorRenderer) {
    super(renderer, editor, editorRenderer);
    this.name = "Lit";
    this.enableShadows = false;
    this.disableBatching = true;
  }
}
class ShadowsRenderMode extends UnlitRenderMode {
  constructor(renderer, editor, editorRenderer) {
    super(renderer, editor, editorRenderer);
    this.name = "Shadows";
    this.disableBatching = true;
    this.enableShadows = true;
  }
}
class WireframeRenderMode extends UnlitRenderMode {
  constructor(renderer, editor, editorRenderer) {
    super(renderer, editor, editorRenderer);
    this.name = "Wireframe";
    this.enableShadows = false;
    this.disableBatching = true;
    this.renderPass.overrideMaterial = new MeshBasicMaterial({
      wireframe: true
    });
  }
}
class NormalsRenderMode extends UnlitRenderMode {
  constructor(renderer, editor, editorRenderer) {
    super(renderer, editor, editorRenderer);
    this.name = "Normals";
    this.enableShadows = false;
    this.disableBatching = true;
    this.renderPass.overrideMaterial = new MeshNormalMaterial();
  }
}
export default class Renderer {
  editor: any;
  canvas: any;
  renderer: any;
  renderMode: LitRenderMode;
  shadowsRenderMode: ShadowsRenderMode;
  renderModes: any[];
  screenshotRenderer: any;
  camera: any;
  onUpdateStats: any;
  constructor(editor, canvas) {
    this.editor = editor;
    this.canvas = canvas;
    const renderer = makeRenderer(
      canvas.parentElement.parentElement.offsetWidth,
      canvas.parentElement.parentElement.offsetHeight,
      {
        canvas
      }
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.info.autoReset = false;
    this.renderer = renderer;
    this.renderMode = new LitRenderMode(renderer, editor, this);
    this.shadowsRenderMode = new ShadowsRenderMode(renderer, editor, this);
    this.renderModes = [];
    if (this.renderer.capabilities.isWebGL2) {
      this.renderModes.push(new UnlitRenderMode(renderer, editor, this));
    }
    this.renderModes.push(
      this.renderMode,
      this.shadowsRenderMode,
      new WireframeRenderMode(renderer, editor, this),
      new NormalsRenderMode(renderer, editor, this)
    );
    this.screenshotRenderer = makeRenderer(1920, 1080);
    const camera = editor.camera;
    this.camera = camera;
  }
  update(dt, _time) {
    this.renderer.info.reset();
    this.renderMode.render(dt);
    if (this.onUpdateStats) {
      this.renderer.info.render.fps = 1 / dt;
      this.renderer.info.render.frameTime = dt * 1000;
      this.onUpdateStats(this.renderer.info);
    }
  }
  setRenderMode(mode) {
    this.renderMode = mode;
    this.renderMode.onSceneSet();
    this.renderMode.onResize();
  }
  onSceneSet = () => {
    this.renderMode.onSceneSet();
  };
  addBatchedObject(object) {
    console.log("Not handling batched object");
  }
  removeBatchedObject(object) {
    console.log("Not handling batched object");
  }
  onResize = () => {
    const camera = this.camera;
    const canvas = this.canvas;
    const containerEl = canvas.parentElement.parentElement;
    camera.aspect = containerEl.offsetWidth / containerEl.offsetHeight;
    camera.updateProjectionMatrix();
    this.renderer.setSize(
      containerEl.offsetWidth,
      containerEl.offsetHeight,
      false
    );
    this.renderMode.onResize();
  };
  takeScreenshot = async (width = 1920, height = 1080) => {
    const { screenshotRenderer, camera } = this;
    const originalRenderer = this.renderer;
    this.renderer = screenshotRenderer;
    this.editor.disableUpdate = true;
    let scenePreviewCamera = this.editor.scene.findNodeByType(
      ScenePreviewCameraNode
    );
    if (!scenePreviewCamera) {
      scenePreviewCamera = new ScenePreviewCameraNode(this.editor);
      camera.matrix.decompose(
        scenePreviewCamera.position,
        scenePreviewCamera.rotation,
        scenePreviewCamera.scale
      );
      this.editor.addObject(scenePreviewCamera);
    }
    const prevAspect = scenePreviewCamera.aspect;
    scenePreviewCamera.aspect = width / height;
    scenePreviewCamera.updateProjectionMatrix();
    scenePreviewCamera.layers.disable(1);
    screenshotRenderer.setSize(width, height, true);
    this.editor.scene.traverse(child => {
      if (child.isNode) {
        child.onRendererChanged();
      }
    });
    if (this.renderMode !== this.shadowsRenderMode) {
      this.shadowsRenderMode.onSceneSet();
    }
    screenshotRenderer.render(this.editor.scene, scenePreviewCamera);
    const blob = await getCanvasBlob(screenshotRenderer.domElement);
    scenePreviewCamera.aspect = prevAspect;
    scenePreviewCamera.updateProjectionMatrix();
    scenePreviewCamera.layers.enable(1);
    this.editor.disableUpdate = false;
    this.renderer = originalRenderer;
    this.renderMode.onSceneSet();
    this.editor.scene.traverse(child => {
      if (child.isNode) {
        child.onRendererChanged();
      }
    });
    return blob;
  };
  dispose() {
    this.renderer.dispose();
    this.screenshotRenderer.dispose();
  }
}
