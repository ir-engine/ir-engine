import { Application, feathers } from '@feathersjs/feathers'
import rest from '@feathersjs/rest-client'
import { Config } from '@xrengine/common/src/config'
import TransformGizmo from '@xrengine/engine/src/scene/classes/TransformGizmo'
import { MultiError } from '@xrengine/engine/src/scene/functions/errors'
import { loadEnvironmentMap } from '../components/EnvironmentMap'
import ErrorIcon from '../classes/ErrorIcon'
import EditorCommands from '../constants/EditorCommands'
import EditorEvents from '../constants/EditorEvents'
import { CacheManager } from './CacheManager'
import { CommandManager } from './CommandManager'
import { NodeManager } from './NodeManager'
import { SceneManager } from './SceneManager'
import { values } from 'lodash'

export class ProjectManager {
  static instance: ProjectManager

  settings: any
  project: any
  projectLoaded: boolean
  initializing: boolean
  initialized: boolean

  feathersClient: Application<any, any>
  ownedFileIds: {} //contain file ids of the files that are also stored in Db as ownedFiles
  currentOwnedFileIds: {}
  projectStructure: any[]
  dir:{}
  static buildProjectManager(settings?: any) {
    this.instance = new ProjectManager(settings)
  }

  constructor(settings = {}) {
    this.settings = settings
    this.project = null

    this.projectLoaded = false

    this.initializing = false
    this.initialized = false

    this.ownedFileIds = {}
    this.currentOwnedFileIds = {}
    this.projectStructure=[]//{"/":{children:[],files:[]}}
    const pro=[]
    this.dir={}
    const respo=fetch("https://127.0.0.1:8642/mymedia/").then((r)=>{

      r.text().then(text=>{
        const parser=new DOMParser()
        const doc=parser.parseFromString(text,'text/html')
        const lis=doc.querySelectorAll('.display-name')
        //const aa=element.querySelector('a')
        
        const fold="https://localhost:3000fsdfasdf/mymedia/therere/ThisisTheMedia.jpeg"
        
        const folderStructure=/(\/)([a-z A-Z 0-9]+)/g
        const asnn=fold.match(folderStructure)
        if(asnn.length<2) return
        asnn.forEach((value)=>{
          pro.push(value)
        })
        console.log("PRoject Structure is:"+pro)
    })


    this.setupProjectDir(pro)
  })
}

  setupProjectDir=(pro:any[])=>{
    this.dir["root"]={
      folders:[],
      files:[],
      name:"Root",
    }

    this.dir["root"].files.push({
      url:"FileURl",
      name:"FileName",
    })

    this.dir["root"].folders.push({
      folders:[],
      files:[],
      name:"FolderName",
    })

  }


  /**
   * A Function to Initialize the FeathersClient with the auth token
   * @author Abhishek Pathak
   */
  initializeFeathersClient(token) {
    this.feathersClient = feathers()
    const headers = {
      authorization: `Bearer ${token}`
    }
    const restClient = rest(Config.publicRuntimeConfig.apiServer).fetch(window.fetch.bind(window), { headers })
    this.feathersClient.configure(restClient)
  }

  /**
   * init called when component get initialized.
   *
   * @author Robert Long
   * @return {Promise}         [void]
   */
  async init(): Promise<void> {
    // check if component is already initialized then return
    if (this.initialized || this.initializing) return

    this.initializing = true

    const tasks = [loadEnvironmentMap(), ErrorIcon.load(), TransformGizmo.load()]

    for (const NodeConstructor of NodeManager.instance.nodeTypes) {
      tasks.push(NodeConstructor.load())
    }

    await Promise.all(tasks)

    this.initialized = true
  }

  /**
   * Function loadProject used to load the scene.
   *
   * @author Robert Long
   * @param  {any}  projectFile [contains scene data]
   * @return {Promise}             [scene to render]
   */
  async loadProject(projectFile) {
    await ProjectManager.instance.init()


    CommandManager.instance.removeListener(
      EditorEvents.OBJECTS_CHANGED.toString(),
      SceneManager.instance.onEmitSceneModified
    )
    CommandManager.instance.removeListener(
      EditorEvents.SCENE_GRAPH_CHANGED.toString(),
      SceneManager.instance.onEmitSceneModified
    )

    CacheManager.clearCaches()

    const errors = await SceneManager.instance.initializeScene(projectFile)

    CommandManager.instance.executeCommand(EditorCommands.ADD_OBJECTS, SceneManager.instance.scene)
    CommandManager.instance.executeCommand(EditorCommands.REPLACE_SELECTION, [])
    CommandManager.instance.history.clear()

    CommandManager.instance.emitEvent(EditorEvents.PROJECT_LOADED)
    CommandManager.instance.emitEvent(EditorEvents.SCENE_GRAPH_CHANGED)

    CommandManager.instance.addListener(
      EditorEvents.OBJECTS_CHANGED.toString(),
      SceneManager.instance.onEmitSceneModified
    )
    CommandManager.instance.addListener(
      EditorEvents.SCENE_GRAPH_CHANGED.toString(),
      SceneManager.instance.onEmitSceneModified
    )

    if (errors && errors.length > 0) {
      const error = new MultiError('Errors loading project', errors)
      CommandManager.instance.emitEvent(EditorEvents.ERROR, error)
      throw error
    }
  }

  dispose() {
    CacheManager.clearCaches()

    if (SceneManager.instance.renderer) {
      SceneManager.instance.renderer.dispose()
    }
  }
}
