import Api from "../../editor/api/Api";

export default class Plugin {
  static displayName = '';
  static version = '1.0.0';
  static defaultData = '';

  static commands = {};
  static descriptions = {};
  static shortcuts = {};
  commands = {};
  descriptions = {};
  shortcuts = {};

  api: Api;
  config: {};
  updateApi: (newApi: any) => void;
  getPublicMethods: () => {};
  readStdOut: () => boolean;

  constructor(api, config = {}) {
    this.api = api;
    this.config = config;
    this.commands = {};
    this.descriptions = {};
    this.shortcuts = {};

    this.updateApi = (newApi) => { this.api = newApi; };
    this.getPublicMethods = () => ({});
    this.readStdOut = () => true;
  }
}
