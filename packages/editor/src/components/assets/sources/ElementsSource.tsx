import Fuse from 'fuse.js'
import { BaseSource, SearchResult } from './index'
import { ItemTypes } from '../../../constants/AssetTypes'
import MediaSourcePanel from '../MediaSourcePanel'
import i18n from 'i18next'
import EditorEvents from '../../../constants/EditorEvents'
import { NodeManager } from '../../../managers/NodeManager'
import { CommandManager } from '../../../managers/CommandManager'

/**
 * ElementsSource component used to provide a container for EditorNodes.
 * Here we can use search elements using search bar.
 *
 * @author Robert Long
 * @type {class component}
 */
export class ElementsSource extends BaseSource {
  declare component: typeof MediaSourcePanel
  disableUrl: boolean

  //initializing variables for this component
  constructor() {
    super()
    this.component = MediaSourcePanel
    this.id = 'elements'
    this.name = i18n.t('editor:sources.element.name')
    this.addListener(EditorEvents.SETTINGS_CHANGED.toString(), this.onSettingsChanged)
    this.addListener(EditorEvents.SCENE_GRAPH_CHANGED.toString(), this.onSceneGraphChanged)
    this.disableUrl = true
    this.searchDebounceTimeout = 0
  }

  //function to emit if there is any change in settings.
  onSettingsChanged = () => {
    CommandManager.instance.emitEvent(EditorEvents.RESULTS_CHANGED)
  }

  //function to emit if there is any change in sceneGraph
  onSceneGraphChanged = () => {
    CommandManager.instance.emitEvent(EditorEvents.RESULTS_CHANGED)
  }

  // function to hanlde the search and to call API if there is any change in search input.
  async search(params): Promise<SearchResult> {
    let results = Array.from<any>(NodeManager.instance.nodeTypes).reduce((acc: any, nodeType: any) => {
      if (nodeType.hideInElementsPanel) {
        return acc
      }
      const nodeEditor = NodeManager.instance.getEditorFromClass(nodeType)
      acc.push({
        id: nodeType.nodeName,
        iconComponent: nodeEditor.WrappedComponent
          ? nodeEditor.WrappedComponent.iconComponent
          : nodeEditor.iconComponent,
        label: nodeType.nodeName,
        description: nodeEditor.WrappedComponent ? nodeEditor.WrappedComponent.description : nodeEditor.description,
        type: ItemTypes.Element,
        nodeClass: nodeType,
        initialProps: nodeType.initialElementProps
      })
      return acc
    }, [])
    if (params.query) {
      const options = {
        shouldSort: true,
        threshold: 0.6,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: ['label']
      }
      const fuse = new Fuse(results as any, options)
      results = fuse.search(params.query)
    }
    return {
      results,
      hasMore: false
    }
  }
}

export default ElementsSource
