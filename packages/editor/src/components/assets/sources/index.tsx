import EventEmitter from 'eventemitter3'

export type SearchResult = {
  results: any[]
  suggestions?: any[]
  nextCursor?: number
  hasMore?: boolean
}

/**
 * BaseSource Parent class for all source classes.
 *
 * @author Robert Long
 */
export class BaseSource extends EventEmitter {
  id: string
  name: string
  component: any
  iconComponent: any
  assetPanelComponent: any
  requiresAuthentication: boolean
  uploadSource: boolean
  searchDebounceTimeout: number
  constructor() {
    super()
    this.id = ''
    this.name = ''
    this.iconComponent = undefined
    this.assetPanelComponent = undefined
    this.requiresAuthentication = false
    this.uploadSource = false
    this.searchDebounceTimeout = 500
  }
  async search(_params, _cursor?, _abortSignal?): Promise<SearchResult> {
    return {
      results: [],
      suggestions: [],
      nextCursor: 0,
      hasMore: false
    }
  }
}
