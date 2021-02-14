import EventEmitter from "eventemitter3";
export class BaseSource extends EventEmitter {
  id: string;
  name: string;
  iconComponent: any;
  assetPanelComponent: any;
  requiresAuthentication: boolean;
  uploadSource: boolean;
  searchDebounceTimeout: number;
  constructor() {
    super();
    this.id = "";
    this.name = "";
    this.iconComponent = undefined;
    this.assetPanelComponent = undefined;
    this.requiresAuthentication = false;
    this.uploadSource = false;
    this.searchDebounceTimeout = 500;
  }
  async search(_params, _cursor?, _abortSignal?) {
    return {
      results: [],
      suggestions: [],
      nextCursor: 0,
      hasMore: false
    };
  }
}
