import { MathUtils as MATH, Vector3, Euler, Matrix4, LoaderUtils } from 'three';

export function isFbxFormatBinary(buffer) {
  const CORRECT = 'Kaydara FBX Binary  \0';

  return buffer.byteLength >= CORRECT.length && CORRECT === convertArrayBufferToString(buffer, 0, CORRECT.length);
}

export function isFbxFormatASCII(text) {
  const CORRECT = [
    'K',
    'a',
    'y',
    'd',
    'a',
    'r',
    'a',
    '\\',
    'F',
    'B',
    'X',
    '\\',
    'B',
    'i',
    'n',
    'a',
    'r',
    'y',
    '\\',
    '\\'
  ];

  let cursor = 0;

  function read(offset) {
    const result = text[offset - 1];
    text = text.slice(cursor + offset);
    cursor++;
    return result;
  }

  for (let i = 0; i < CORRECT.length; ++i) {
    const num = read(1);
    if (num === CORRECT[i]) {
      return false;
    }
  }

  return true;
}

export function getFbxVersion(text) {
  const versionRegExp = /FBXVersion: (\d+)/;
  const match = text.match(versionRegExp);
  if (match) {
    const version = parseInt(match[1]);
    return version;
  }
  throw new Error('THREE.FBXLoader: Cannot find the version number for the file given.');
}

// Converts FBX ticks into real time seconds.
export function convertFBXTimeToSeconds(time) {
  return time / 46186158000;
}

const dataArray = [];

// extracts the data from the correct position in the FBX array based on indexing type
export function getData(polygonVertexIndex, polygonIndex, vertexIndex, infoObject) {
  let index;

  switch (infoObject.mappingType) {
    case 'ByPolygonVertex':
      index = polygonVertexIndex;
      break;
    case 'ByPolygon':
      index = polygonIndex;
      break;
    case 'ByVertice':
      index = vertexIndex;
      break;
    case 'AllSame':
      index = infoObject.indices[0];
      break;
    default:
      console.warn('THREE.FBXLoader: unknown attribute mapping type ' + infoObject.mappingType);
  }

  if (infoObject.referenceType === 'IndexToDirect') index = infoObject.indices[index];

  const from = index * infoObject.dataSize;
  const to = from + infoObject.dataSize;

  return slice(dataArray, infoObject.buffer, from, to);
}

const tempEuler = new Euler();
const tempVec = new Vector3();

// generate transformation from FBX transform data
// ref: https://help.autodesk.com/view/FBX/2017/ENU/?guid=__files_GUID_10CDD63C_79C1_4F2D_BB28_AD2BE65A02ED_htm
// ref: http://docs.autodesk.com/FBX/2014/ENU/FBX-SDK-Documentation/index.html?url=cpp_ref/_transformations_2main_8cxx-example.html,topicNumber=cpp_ref__transformations_2main_8cxx_example_htmlfc10a1e1-b18d-4e72-9dc0-70d0f1959f5e
export function generateTransform(transformData) {
  const lTranslationM = new Matrix4();
  const lPreRotationM = new Matrix4();
  const lRotationM = new Matrix4();
  const lPostRotationM = new Matrix4();

  const lScalingM = new Matrix4();
  const lScalingPivotM = new Matrix4();
  const lScalingOffsetM = new Matrix4();
  const lRotationOffsetM = new Matrix4();
  const lRotationPivotM = new Matrix4();

  let lParentGX = new Matrix4();
  const lGlobalT = new Matrix4();

  const inheritType = transformData.inheritType ? transformData.inheritType : 0;

  if (transformData.translation) lTranslationM.setPosition(tempVec.fromArray(transformData.translation));

  if (transformData.preRotation) {
    const array = transformData.preRotation.map(MATH.degToRad);
    array.push(transformData.eulerOrder);
    lPreRotationM.makeRotationFromEuler(tempEuler.fromArray(array));
  }

  if (transformData.rotation) {
    const array = transformData.rotation.map(MATH.degToRad);
    array.push(transformData.eulerOrder);
    lRotationM.makeRotationFromEuler(tempEuler.fromArray(array));
  }

  if (transformData.postRotation) {
    const array = transformData.postRotation.map(MATH.degToRad);
    array.push(transformData.eulerOrder);
    lPostRotationM.makeRotationFromEuler(tempEuler.fromArray(array));
  }

  if (transformData.scale) lScalingM.scale(tempVec.fromArray(transformData.scale));

  // Pivots and offsets
  if (transformData.scalingOffset) lScalingOffsetM.setPosition(tempVec.fromArray(transformData.scalingOffset));
  if (transformData.scalingPivot) lScalingPivotM.setPosition(tempVec.fromArray(transformData.scalingPivot));
  if (transformData.rotationOffset) lRotationOffsetM.setPosition(tempVec.fromArray(transformData.rotationOffset));
  if (transformData.rotationPivot) lRotationPivotM.setPosition(tempVec.fromArray(transformData.rotationPivot));

  // parent transform
  if (transformData.parentMatrixWorld) lParentGX = transformData.parentMatrixWorld;

  // Global Rotation
  const lLRM = lPreRotationM.multiply(lRotationM).multiply(lPostRotationM);
  const lParentGRM = new Matrix4();
  lParentGX.extractRotation(lParentGRM);

  // Global Shear*Scaling
  const lParentTM = new Matrix4();
  let lLSM;
  let lParentGSM;
  let lParentGRSM;

  lParentTM.copyPosition(lParentGX);
  lParentGRSM = lParentTM.getInverse(lParentTM).multiply(lParentGX);
  lParentGSM = lParentGRM.getInverse(lParentGRM).multiply(lParentGRSM);
  lLSM = lScalingM;

  let lGlobalRS;
  if (inheritType === 0) {
    lGlobalRS = lParentGRM
      .multiply(lLRM)
      .multiply(lParentGSM)
      .multiply(lLSM);
  } else if (inheritType === 1) {
    lGlobalRS = lParentGRM
      .multiply(lParentGSM)
      .multiply(lLRM)
      .multiply(lLSM);
  } else {
    const lParentLSM = new Matrix4().copy(lScalingM);

    const lParentGSM_noLocal = lParentGSM.multiply(lParentLSM.getInverse(lParentLSM));

    lGlobalRS = lParentGRM
      .multiply(lLRM)
      .multiply(lParentGSM_noLocal)
      .multiply(lLSM);
  }

  // Calculate the local transform matrix
  let lTransform = lTranslationM
    .multiply(lRotationOffsetM)
    .multiply(lRotationPivotM)
    .multiply(lPreRotationM)
    .multiply(lRotationM)
    .multiply(lPostRotationM)
    .multiply(lRotationPivotM.getInverse(lRotationPivotM))
    .multiply(lScalingOffsetM)
    .multiply(lScalingPivotM)
    .multiply(lScalingM)
    .multiply(lScalingPivotM.getInverse(lScalingPivotM));

  const lLocalTWithAllPivotAndOffsetInfo = new Matrix4().copyPosition(lTransform);

  const lGlobalTranslation = lParentGX.multiply(lLocalTWithAllPivotAndOffsetInfo);
  lGlobalT.copyPosition(lGlobalTranslation);

  lTransform = lGlobalT.multiply(lGlobalRS);

  return lTransform;
}

// Returns the three.js intrinsic Euler order corresponding to FBX extrinsic Euler order
// ref: http://help.autodesk.com/view/FBX/2017/ENU/?guid=__cpp_ref_class_fbx_euler_html
export function getEulerOrder(order) {
  order = order || 0;

  var enums = [
    'ZYX', // -> XYZ extrinsic
    'YZX', // -> XZY extrinsic
    'XZY', // -> YZX extrinsic
    'ZXY', // -> YXZ extrinsic
    'YXZ', // -> ZXY extrinsic
    'XYZ' // -> ZYX extrinsic
    //'SphericXYZ', // not possible to support
  ];

  if (order === 6) {
    console.warn('THREE.FBXLoader: unsupported Euler Order: Spherical XYZ. Animations and rotations may be incorrect.');
    return enums[0];
  }

  return enums[order];
}

// Parses comma separated list of numbers and returns them an array.
// Used internally by the TextParser
export function parseNumberArray(value) {
  var array = value.split(',').map(function(val) {
    return parseFloat(val);
  });

  return array;
}

export function convertArrayBufferToString(buffer, from?, to?) {
  if (from === undefined) from = 0;
  if (to === undefined) to = buffer.byteLength;

  return LoaderUtils.decodeText(new Uint8Array(buffer, from, to));
}

export function append(a, b) {
  for (var i = 0, j = a.length, l = b.length; i < l; i++, j++) {
    a[j] = b[i];
  }
}

export function slice(a, b, from, to) {
  for (var i = from, j = 0; i < to; i++, j++) {
    a[j] = b[i];
  }

  return a;
}

// inject array a2 into array a1 at index
export function inject(a1, index, a2) {
  return a1
    .slice(0, index)
    .concat(a2)
    .concat(a1.slice(index));
}
