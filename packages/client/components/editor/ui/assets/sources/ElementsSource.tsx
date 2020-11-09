import Fuse from "fuse.js";
import { BaseSource } from "./index";
import { ItemTypes } from "../../dnd";
import MediaSourcePanel from "../MediaSourcePanel";
import Editor from "../../../Editor";
export default class ElementsSource extends BaseSource {
  component: typeof MediaSourcePanel;
  editor: Editor;
  id: string;
  name: string;
  disableUrl: boolean;
  searchDebounceTimeout: number;
  constructor(editor: Editor) {
    super();
    this.component = MediaSourcePanel;
    this.editor = editor;
    this.id = "elements";
    this.name = "Elements";
    this.editor.addListener("settingsChanged", this.onSettingsChanged);
    this.editor.addListener("sceneGraphChanged", this.onSceneGraphChanged);
    this.disableUrl = true;
    this.searchDebounceTimeout = 0;
  }
  onSettingsChanged = () => {
    this.emit("resultsChanged");
  };
  onSceneGraphChanged = () => {
    this.emit("resultsChanged");
  };
  // @ts-ignore
  async search(params) {
    const editor = this.editor;
    let results = Array.from(editor.nodeTypes).reduce((acc: any, nodeType: any) => {
      if (!nodeType.canAddNode(editor)) {
        return acc;
      }
      if (nodeType.hideInElementsPanel) {
        return acc;
      }
      const nodeEditor = editor.nodeEditors.get(nodeType);
      acc.push({
        id: nodeType.nodeName,
        iconComponent: nodeEditor.iconComponent,
        label: nodeType.nodeName,
        description: nodeEditor.description,
        type: ItemTypes.Element,
        nodeClass: nodeType,
        initialProps: nodeType.initialElementProps
      });
      return acc;
    }, []);
    if (params.query) {
      const options = {
        shouldSort: true,
        threshold: 0.6,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: ["label"]
      };
      const fuse = new Fuse(results as any, options);
      results = fuse.search(params.query);
    }
    return {
      results,
      hasMore: false
    };
  }
}
