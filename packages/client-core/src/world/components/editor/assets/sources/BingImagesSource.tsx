import ImageMediaSource from "../ImageMediaSource";

/**
 * [BingImagesSource component provides an explorer where we can seach images using search bar]
 * @type {class component}
 */
export default class BingImagesSource extends ImageMediaSource {
  id: string;
  name: string;
  searchLegalCopy: string;
  privacyPolicyUrl: string;

  //initializing variables 
  constructor(api) {
    super(api);
    this.id = "bing_images";
    this.name = "Bing Images";
    this.searchLegalCopy = "Search by Bing";
    this.privacyPolicyUrl =
      "https://privacy.microsoft.com/en-us/privacystatement";
  }
}
