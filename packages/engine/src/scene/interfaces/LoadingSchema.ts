export interface LoadingSchema {
  [key: string]: {
    components?: Array<{
      type: any;
      values?: any;
    }>;
    behaviors?: Array<{
      behavior: any;
      args?: any;
      values?: any;
      onLoaded?: [];
    }>;
  };
}
