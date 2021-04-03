// array containing audio file type
export const AudioFileTypes = [".mp3", "audio/mpeg"];
//array containing video file type
export const VideoFileTypes = [".mp4", "video/mp4"];
//array containing image files types
export const ImageFileTypes = [
  ".png",
  ".jpeg",
  ".jpg",
  ".gif",
  "image/png",
  "image/jpeg",
  "image/gif"
];
//array containing model file type.
export const ModelFileTypes = [".glb", "model/gltf-binary"];
//array contains arrays of all files types.
export const AllFileTypes = [
  ...AudioFileTypes,
  ...VideoFileTypes,
  ...ImageFileTypes,
  ...ModelFileTypes
];

//creatig comma saperated string contains all file types
export const AcceptsAllFileTypes = AllFileTypes.join(",");

/**
 * [matchesFileTypes function used to match file type with existing file types]
 * @param  {Object} file      [object contains file data]
 * @param  {array} fileTypes [Array contains existing file types]
 * @return {boolean}           [true if file type found in existing fileTypes]
 */
export function matchesFileTypes(file, fileTypes) {
  for (const pattern of fileTypes) {
    if (pattern.startsWith(".")) {
      if (file.name.toLowerCase().endsWith(pattern)) {
        return true;
      }
    } else if (file.type.startsWith(pattern)) {
      return true;
    }
  }
  return false;
}
