import Fuse from "fuse.js";
import { BaseSource } from "./index";
import { ItemTypes } from "../../dnd";
import MediaSourcePanel from "../MediaSourcePanel";
import Editor from "../../Editor";


/**
 * [
 * ElementsSource component used to provide a container for EditorNodes
 * Here we can use search elements using search bar
 *   ]
 * @type {class component}
 */
export default class ElementsSource extends BaseSource {
  component: typeof MediaSourcePanel;
  editor: Editor;
  id: string;
  name: string;
  disableUrl: boolean;
  searchDebounceTimeout: number;

  //initializing variables for this component
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

  //function to emit if there is any change in settings.
  onSettingsChanged = () => {
    this.emit("resultsChanged");
  };

  //function to emit if there is any change in sceneGraph
  onSceneGraphChanged = () => {
    this.emit("resultsChanged");
  };
  // function to hanlde the search and to call API if there is any change in search input.
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
