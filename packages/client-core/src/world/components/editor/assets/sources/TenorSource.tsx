import VideoMediaSource from "../VideoMediaSource";
import { ItemTypes } from "../../dnd";
import VideoNode from "@xr3ngine/engine/src/editor/nodes/VideoNode";
import Api from "../../Api";

/**
 * [TenorSource component used to provide visual objects]
 * @type {class component}
 */
export default class TenorSource extends VideoMediaSource {
  searchPlaceholder: string;
  searchLegalCopy: string;
  privacyPolicyUrl: string;
  api: Api;

  // initializing variables for this object
  constructor(api) {
    super(api);
    this.id = "tenor";
    this.name = "Tenor GIFs";
    this.searchPlaceholder = "Search GIFs...";
    this.searchLegalCopy = "Search by Tenor";
    this.privacyPolicyUrl = "https://tenor.com/legal-privacy";
  }

  //function used to handle search and call API if there is any change in search input.
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
        videoUrl:
          result &&
          result.images &&
          result.images.preview &&
          result.images.preview.url,
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
