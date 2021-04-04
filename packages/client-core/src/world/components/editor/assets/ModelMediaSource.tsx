import { BaseSource } from "./sources";
import { ItemTypes } from "../dnd";
import ModelSourcePanel from "./ModelSourcePanel";
import ModelNode from "@xr3ngine/engine/src/editor/nodes/ModelNode";
import Api from "../Api";

/**
 * [ModelMediaSource used to provide model media by calling api]
 * @type {class component}
 */
export default class ModelMediaSource extends BaseSource {

  //declairing component type of ModelSourcePanel
  component: typeof ModelSourcePanel;

  //declairing api using Api class
  api: Api;

  //initializing component properties
  constructor(api) {
    super();
    this.component = ModelSourcePanel;
    this.api = api;
  }

  // used to call api for searching media
  async search(params, cursor, abortSignal) {

    //initializing additional node properties object containing initialScale property
    const additionalNodeProps = {
      initialScale: "fit"
    };

    // declairing additionalItemProps
    const additionalItemProps = {};

    // initializing query using params
    const queryParams = {
      query: params.query
    };

    // check if params contains tags and tags contains length greator then sizeRandomness
    // then initializing variable tags, paramsKey
    if (params.tags && params.tags.length > 0) {
      const tag = params.tags[0];
      const paramsKey = tag.paramsKey !== undefined ? tag.paramsKey : "filter";
      queryParams[paramsKey] = tag.value;

      // check if tag contains initialNodeProps then initializing additionalNodeProps
      if (tag.initialNodeProps) {
        Object.assign(additionalNodeProps, tag.initialNodeProps);
      }

      // check if tag contains itemProps then assign to additionalItemProps
      if (tag.itemProps) {
        Object.assign(additionalItemProps, tag.itemProps);
      }
    }

    // initializing results, suggestions, nextCursor by calling api
    const { results, suggestions, nextCursor } = await this.api.searchMedia(
      this.id,
      queryParams,
      cursor,
      abortSignal
    );

    // retuning media search results
    return {
      results: results.map(result => ({
        id: result.id,
        thumbnailUrl:
          result &&
          result.images &&
          result.images.preview &&
          result.images.preview.url,
        attributions: result.attributions,
        label: result.name,
        type: ItemTypes.Model,
        url: result.url,
        nodeClass: ModelNode,
        initialProps: {
          name: result.name,
          ...additionalNodeProps,
          src: result.url
        },
        ...additionalItemProps
      })),
      suggestions,
      nextCursor,
      hasMore: !!nextCursor
    };
  }
}
