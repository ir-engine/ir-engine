import { AssetClass } from '../enum/AssetClass'

export type AssetId = string

export class Dependency {
  assets: Asset[]
  loadCondition?: () => boolean
  unloadCondition?: () => boolean
  loaded: boolean
  constructor(_assets: Asset[], _loadCondition?: () => boolean, _unloadCondition?: () => boolean) {
    this.assets = _assets
    if (_loadCondition) this.loadCondition = _loadCondition
    if (_unloadCondition) this.unloadCondition = _unloadCondition
    this.loaded = false
  }
}

export class Asset {
  id: AssetId
  metadata: { author?: any; license?: any }
  assetClass: AssetClass
  dependencies: Dependency[]

  checkDependencies(): { loading: Promise<any>[]; unloading: Promise<any>[] } {
    const result = { loading: new Array(), unloading: new Array() }
    for (const dep of this.dependencies) {
      if (dep.loaded && dep.unloadCondition?.call(dep)) {
        const promises = new Array<Promise<any>>()
        dep.assets.forEach((asset) => promises.push(asset.unload()))
        result.unloading.push(Promise.all(promises).then(() => (dep.loaded = false)))
      } else if (!dep.loaded && dep.loadCondition?.call(dep)) {
        const promises = new Array<Promise<any>>()
        dep.assets.forEach((asset) => promises.push(asset.load()))
        result.loading.push(Promise.all(promises).then(() => (dep.loaded = true)))
      }
    }
    return result
  }

  load: () => Promise<any>
  unload: () => Promise<any>
}
