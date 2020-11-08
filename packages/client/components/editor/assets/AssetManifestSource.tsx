
import Fuse from "fuse.js";
import { proxiedUrlFor } from "../Api";
import { BaseSource } from "./sources";
import { ItemTypes } from "../dnd";
import ImageNode from "@xr3ngine/engine/src/editor/nodes/ImageNode";
import VideoNode from "@xr3ngine/engine/src/editor/nodes/VideoNode";
import ModelNode from "@xr3ngine/engine/src/editor/nodes/ModelNode";
function hasTags(result, tags) {
  for (const { value } of tags) {
    if (result.tags.indexOf(value) === -1) {
      return false;
    }
  }
  return true;
}
const assetTypeToNodeClass = {
  [ItemTypes.Audio]: AudioNode,
  [ItemTypes.Image]: ImageNode,
  [ItemTypes.Video]: VideoNode,
  [ItemTypes.Model]: ModelNode
};
export default class AssetManifestSource extends BaseSource {
  editor: any;
  id: any;
  name: any;
  manifestUrl: any;
  assets: any[];
  tags: any[];
  loaded: boolean;
  searchDebounceTimeout: number;
  searchPlaceholder: any;
  fuse: Fuse<any>;
  constructor(editor, name, manifestUrl) {
    super();
    this.editor = editor;
    this.id = manifestUrl;
    this.name = name;
    this.manifestUrl = proxiedUrlFor(
      new URL(manifestUrl, (window as any).location).href
    );
    this.assets = [];
    this.tags = [];
    this.loaded = false;
    this.searchDebounceTimeout = 0;
  }
  async load() {
    const response = await this.editor.api.fetchUrl(this.manifestUrl);
    const manifest = await response.json().catch(err => {
      console.log(err);
    });
    if (manifest.searchPlaceholder) {
      this.searchPlaceholder = manifest.searchPlaceholder;
    }
    for (const asset of manifest.assets) {
      const assetUrl = proxiedUrlFor(new URL(asset.url, this.manifestUrl).href);
      const nodeClass = assetTypeToNodeClass[asset.type];
      const nodeEditor = this.editor.nodeEditors.get(nodeClass);
      this.assets.push({
        id: asset.id,
        label: asset.label,
        url: assetUrl,
        tags: asset.tags || [],
        type: asset.type,
        iconComponent: nodeEditor.iconComponent,
        nodeClass,
        initialProps: {
          name: asset.label,
          src: assetUrl
        }
      });
    }
    this.tags = manifest.tags;
    const options = {
      shouldSort: true,
      threshold: 0.6,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: ["label", "tags"]
    };
    this.fuse = new Fuse(this.assets, options);
    this.loaded = true;
  }
  /* @ts-ignore */
  async search(params, _cursor, _abortSignal) {
    if (!this.loaded) {
      await this.load();
    }
    let results = this.assets;
    if (params.tags && params.tags.length > 0) {
      results = results.filter(result => hasTags(result, params.tags));
    }
    if (params.query) {
      results = this.fuse.search(params.query);
    }
    return {
      results,
      hasMore: false
    };
  }
}
