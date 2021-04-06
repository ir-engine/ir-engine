import VideoMediaSource from "../VideoMediaSource";

/**
 * [BingVideosSource componant used to provide a video explorer here we can seach bing videos used search bar]
 * @type {class component}
 */
export default class BingVideosSource extends VideoMediaSource {
  id: string;
  name: string;
  searchLegalCopy: string;
  privacyPolicyUrl: string;

  //initializing variables for this component
  constructor(api) {
    super(api);
    this.id = "bing_videos";
    this.name = "Bing Videos";
    this.searchLegalCopy = "Search by Bing";
    this.privacyPolicyUrl =
      "https://privacy.microsoft.com/en-us/privacystatement";
  }
}
