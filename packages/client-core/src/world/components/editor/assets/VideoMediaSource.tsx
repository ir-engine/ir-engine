import { BaseSource } from "./sources";
import { ItemTypes } from "../dnd";
import VideoSourcePanel from "./VideoSourcePanel";
import VideoNode from "@xr3ngine/engine/src/editor/nodes/VideoNode";
import Api from "../Api";

/**
 * [VideoMediaSource used as parent class for Videos Source components like BingVideosSource]
 * @type {class component}
 */
export default class VideoMediaSource extends BaseSource {
  component: typeof VideoSourcePanel;
  api: Api;
  constructor(api) {
    super();
    this.component = VideoSourcePanel;
    this.api = api;
  }

  /**
   * [search used to search media source by calling Api]
   * @param  {object}  params
   * @param  {[type]}  cursor
   * @param  {[type]}  abortSignal
   * @return {Promise}             
   */
  async search(params, cursor, abortSignal) {
    const { results, suggestions, nextCursor } = await this.api.searchMedia(
      this.id,
      {
        query: params.query,
        filter: params.tags && params.tags.length > 0 && params.tags[0].value
      },
      cursor,
      abortSignal
    );
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
        type: ItemTypes.Video,
        url: result.url,
        nodeClass: VideoNode,
        initialProps: {
          name: result.name,
          src: result.url
        }
      })),
      suggestions,
      nextCursor,
      hasMore: !!nextCursor
    };
  }
}
