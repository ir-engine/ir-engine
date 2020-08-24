import { Loader, FileLoader, LoaderUtils, TextureLoader, LoadingManager } from 'three';
import { BinaryParser } from './BinaryParser';
import { isFbxFormatBinary, convertArrayBufferToString, isFbxFormatASCII, getFbxVersion } from './UtilityFunctions';
import { TextParser } from './TextParser';
import { FBXTreeParser } from './FBXTreeParser';

/**
 * @author Kyle-Larson https://github.com/Kyle-Larson
 * @author Takahiro https://github.com/takahirox
 * @author Lewy Blue https://github.com/looeee
 * @author Leonard Grosoli https://github.com/TheRealSyler
 *
 * Loader loads FBX file and generates Group representing FBX scene.
 * Requires FBX file to be >= 7.0 and in ASCII or >= 6400 in Binary format
 * Versions lower than this may load but will probably have errors
 *
 * Needs Support:
 *  Morph normals / blend shape normals
 *
 * FBX format references:
 *  https://wiki.blender.org/index.php/User:Mont29/Foundation/FBX_File_Structure
 *  http://help.autodesk.com/view/FBX/2017/ENU/?guid=__cpp_ref_index_html (C++ SDK reference)
 *
 *  Binary format specification:
 *      https://code.blender.org/2013/08/fbx-binary-file-format-specification/
 */
export class FBXLoader extends Loader {
  fbxTree;
  connections;
  sceneGraph;
  constructor(manager?: LoadingManager) {
    super(manager);
  }
  load(
    url: string,
    onLoad?: (response: string | ArrayBuffer) => void,
    onProgress?: (request: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void
  ) {
    const path = this.path === '' ? LoaderUtils.extractUrlBase(url) : this.path;

    const loader = new FileLoader(this.manager);
    loader.setPath(this.path);
    loader.setResponseType('arraybuffer');

    loader.load(
      url,
      buffer => {
        try {
          onLoad(this.parse(buffer, path));
        } catch (error) {
          setTimeout(() => {
            if (onError) onError(error);

            this.manager.itemError(url);
          }, 0);
        }
      },
      onProgress,
      onError
    );
  }

  parse(FBXBuffer: string | ArrayBuffer, path: string) {
    if (isFbxFormatBinary(FBXBuffer)) {
      this.fbxTree = new BinaryParser().parse(FBXBuffer);
    } else {
      const FBXText = convertArrayBufferToString(FBXBuffer);

      if (!isFbxFormatASCII(FBXText)) {
        throw new Error('THREE.FBXLoader: Unknown format.');
      }

      if (getFbxVersion(FBXText) < 7000) {
        throw new Error('THREE.FBXLoader: FBX version not supported, FileVersion: ' + getFbxVersion(FBXText));
      }

      this.fbxTree = new TextParser().parse(FBXText);
    }

    // console.log( fbxTree );

    const textureLoader = new TextureLoader(this.manager)
      .setPath(this.resourcePath || path)
      .setCrossOrigin(this.crossOrigin);

    return new FBXTreeParser(textureLoader, this.manager, this.fbxTree, this.connections, this.sceneGraph).parse(
      this.fbxTree
    );
  }
}
