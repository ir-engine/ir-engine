import {
  BufferGeometry,
  Camera,
  Group,
  IUniform,
  LineBasicMaterial,
  LineDashedMaterial,
  Material,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshDepthMaterial,
  MeshDistanceMaterial,
  MeshLambertMaterial,
  MeshMatcapMaterial,
  MeshNormalMaterial,
  MeshPhongMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  MeshToonMaterial,
  Object3D,
  OrthographicCamera,
  PointsMaterial,
  RawShaderMaterial,
  Scene,
  Shader,
  ShaderMaterial,
  ShadowMaterial,
  SkinnedMesh,
  SpriteMaterial,
  Uniform,
  WebGLRenderer
} from 'three'

// Converted to typescript from Fyrestar https://mevedia.com (https://github.com/Fyrestar/MaterialPlugin)

let frameIndex = -1

const tempCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)

type ContextType = {
  callbacks: PluginType[]
  renderer?: WebGLRenderer
  scene?: Scene
  camera?: Camera
  material?: CustomMaterial
  geometry?: BufferGeometry
  group?: Group
  gl?: WebGLRenderingContext
}

const context = {
  callbacks: []
} as ContextType

const Materials = [
  ShadowMaterial,
  SpriteMaterial,
  RawShaderMaterial,
  ShaderMaterial,
  PointsMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  MeshPhongMaterial,
  MeshToonMaterial,
  MeshNormalMaterial,
  MeshLambertMaterial,
  MeshDepthMaterial,
  MeshDistanceMaterial,
  MeshBasicMaterial,
  MeshMatcapMaterial,
  LineDashedMaterial,
  LineBasicMaterial,
  Material
  // MeshFaceMaterial,
  // MultiMaterial,
  // PointCloudMaterial,
  // ParticleBasicMaterial,
  // ParticleSystemMaterial
]

type ArrayElement<A> = A extends readonly (infer T)[] ? T : never
type MaterialType = ArrayElement<typeof Materials>

type CustomMaterial = MaterialType & {
  defines: { VERSION: number }
  version: number
  addPlugin: (plugin: PluginType) => void
  removePlugin: (plugin: PluginType) => void
  hasPlugin: (plugin: PluginType) => boolean
  invalidate: () => void
  plugins?: PluginType[]
  callbacks?: PluginType[]
  _onBeforeCompile: (shader) => void
  onBeforeCompile: typeof Material.prototype.onBeforeCompile | PluginType
  needsUpdate: boolean
}

export type PluginType = {
  used: number
  priority: number
  frame: (context: ContextType) => void
  render: (object: any, shader: Shader, context: ContextType) => void
  compile: typeof Material.prototype.onBeforeCompile
}

export type BeforeCompilePluginType = Omit<PluginType, 'used' | 'priority'>

function addPlugin(this: CustomMaterial, plugin: PluginType): void {
  this.onBeforeCompile = plugin
}

function removePlugin(this: CustomMaterial, plugin: PluginType): void {
  if (plugin.compile instanceof Function && this.plugins) {
    const index = this.plugins.indexOf(plugin)
    if (index > -1) this.plugins.splice(index, 1)
    this.plugins.sort(sortPriority)
  }

  if (plugin.render instanceof Function && this.callbacks) {
    const index = this.callbacks.indexOf(plugin)
    if (index > -1) this.callbacks.splice(index, 1)
  }

  plugin.used--

  if (plugin.used === 0 && plugin.frame instanceof Function) {
    const index = context.callbacks.indexOf(plugin)
    if (index > -1) context.callbacks.splice(index, 1)
  }
}

function hasPlugin(this: CustomMaterial, plugin: PluginType): boolean {
  return this.plugins ? this.plugins.indexOf(plugin) > -1 : false
}

function invalidate(this: CustomMaterial): void {
  this.defines = this.defines || {}
  this.defines.VERSION = this.version++
  this.needsUpdate = true
}

function sortPriority(a: PluginType, b: PluginType): number {
  return b.priority - a.priority
}

const onBeforeCompile = {
  get: function (this: CustomMaterial) {
    if (!this._onBeforeCompile.toString) {
      const self = this

      this._onBeforeCompile.toString = function () {
        let code = ''

        if (self.plugins) {
          for (let i = 0, l = self.plugins.length; i < l; i++) {
            const plugin = self.plugins[i]
            code += plugin instanceof Function ? plugin.toString() : plugin.compile.toString()
          }
        }

        return code
      }
    }

    return this._onBeforeCompile
  },
  set: function (this: CustomMaterial, plugins: PluginType | PluginType[]) {
    if (plugins === null) {
      if (this.plugins) {
        while (this.plugins.length) this.removePlugin(this.plugins[0])
      }

      delete this.callbacks
    } else if (plugins instanceof Array) {
      for (let i = 0, l = plugins.length; i < l; i++) this.onBeforeCompile = plugins[i]
    } else if (plugins instanceof Function || plugins instanceof Object) {
      const plugin = plugins

      if (this.hasPlugin(plugin)) return
      // if (plugin.requires instanceof Array) this.addPlugin(plugin.requires)
      if (!this.plugins) this.plugins = []

      plugin.used = plugin.used || 0
      plugin.priority = plugin.priority || 0

      this.plugins.unshift(plugin)
      this.plugins.sort(sortPriority)

      if (plugin.used === 0 && plugin.frame instanceof Function) context.callbacks.push(plugin)

      plugin.used++

      if (plugin.render instanceof Function) {
        if (!this.callbacks) this.callbacks = []
        this.callbacks.push(plugin)
      }
    } else {
      console.error('Invalid type "%s" assigned to onBeforeCompile', typeof plugins)
    }
  }
}

for (let i = 0, l = Materials.length; i < l; i++) {
  const Material = Materials[i] as CustomMaterial

  if (Material) {
    Material.prototype._onBeforeCompile = function (shader, renderer) {
      if (this.plugins) {
        for (let i = 0, l = this.plugins.length; i < l; i++) {
          const plugin = this.plugins[i]
          ;(plugin instanceof Function ? plugin : plugin.compile).call(this, shader, renderer)
        }
      }
    }
    Material.prototype._onBeforeCompile.toString = null!

    Object.assign(Material.prototype, {
      addPlugin,
      removePlugin,
      hasPlugin,
      invalidate,

      version: 1
    })

    const dispose = Material.prototype.dispose

    Material.prototype.dispose = function () {
      this.onBeforeCompile = null
      dispose.call(this)
    }

    Object.defineProperty(Material.prototype, 'onBeforeCompile', onBeforeCompile)
  }
}

export const MaterialPlugin = function (object) {
  this.uuid = MathUtils.generateUUID()
  Object.assign(this, object)
}

// Material callbacks
const onBeforeRender = function (
  renderer: WebGLRenderer,
  scene: Scene,
  camera: Camera,
  geometry: BufferGeometry,
  material: CustomMaterial,
  group: Group
) {
  if (!material.callbacks) return

  if (renderer.info.render.frame !== frameIndex) {
    context.scene = scene
    context.camera = camera
    context.renderer = renderer
    context.gl = renderer.getContext()
    frameIndex = renderer.info.render.frame

    if (onBeforeRender.auto !== false) onBeforeRender.frame()
  }

  context.material = material
  context.geometry = geometry
  context.group = group

  let shader,
    program,
    mat = renderer.properties.get(material)

  if (!mat.currentProgram) renderer.compile(scene, tempCamera)

  if (mat.shader === undefined) {
    shader = mat
    program = mat.currentProgram
  } else {
    shader = mat.shader
    program = shader.program
  }

  // if (program) context.gl?.useProgram(program.program)

  for (let i = 0, l = material.callbacks.length; i < l; i++) material.callbacks[i].render(this, shader, context)
}

onBeforeRender.auto = false
onBeforeRender.frame = function () {
  for (let i = 0, l = context.callbacks.length; i < l; i++) context.callbacks[i].frame(context)
}
onBeforeRender.use = function () {
  Mesh.prototype.onBeforeRender = onBeforeRender as any
  SkinnedMesh.prototype.onBeforeRender = onBeforeRender as any
}

export const MaterialCallback = onBeforeRender
