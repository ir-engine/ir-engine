import THREE, { BufferGeometry, Float32BufferAttribute, Uint16BufferAttribute, Matrix3, Vector4 } from 'three';
import { generateTransform, getEulerOrder, getData } from './UtilityFunctions';

export class GeometryParser {
  constructor(public fbxTree, public connections) {}

  parse(deformers) {
    const geometryMap = new Map();

    if ('Geometry' in this.fbxTree.Objects) {
      const geoNodes = this.fbxTree.Objects.Geometry;

      for (let nodeID in geoNodes) {
        const relationships = this.connections.get(parseInt(nodeID));
        const geo = this.parseGeometry(relationships, geoNodes[nodeID], deformers);

        geometryMap.set(parseInt(nodeID), geo);
      }
    }

    return geometryMap;
  }

  // Parse single node in FBXTree.Objects.Geometry
  parseGeometry(relationships, geoNode, deformers) {
    switch (geoNode.attrType) {
      case 'Mesh':
        return this.parseMeshGeometry(relationships, geoNode, deformers);

      case 'NurbsCurve':
        return this.parseNurbsGeometry(geoNode);
    }
  }

  // Parse single node mesh geometry in FBXTree.Objects.Geometry
  parseMeshGeometry(relationships, geoNode, deformers) {
    const skeletons = deformers.skeletons;
    const morphTargets: any[] = [];

    const modelNodes = relationships.parents.map(parent => {
      return this.fbxTree.Objects.Model[parent.ID];
    });

    // don't create geometry if it is not associated with any models
    if (modelNodes.length === 0) return;

    const skeleton = relationships.children.reduce((skeleton, child) => {
      if (skeletons[child.ID] !== undefined) skeleton = skeletons[child.ID];

      return skeleton;
    }, null);

    relationships.children.forEach(function(child) {
      if (deformers.morphTargets[child.ID] !== undefined) {
        morphTargets.push(deformers.morphTargets[child.ID]);
      }
    });

    // Assume one model and get the preRotation from that
    // if there is more than one model associated with the geometry this may cause problems
    const modelNode = modelNodes[0];

    const transformData: any = {};

    if ('RotationOrder' in modelNode) transformData.eulerOrder = getEulerOrder(modelNode.RotationOrder.value);
    if ('InheritType' in modelNode) transformData.inheritType = parseInt(modelNode.InheritType.value);

    if ('GeometricTranslation' in modelNode) transformData.translation = modelNode.GeometricTranslation.value;
    if ('GeometricRotation' in modelNode) transformData.rotation = modelNode.GeometricRotation.value;
    if ('GeometricScaling' in modelNode) transformData.scale = modelNode.GeometricScaling.value;

    const transform = generateTransform(transformData);

    return this.genGeometry(geoNode, skeleton, morphTargets, transform);
  }

  // Generate a THREE.BufferGeometry from a node in FBXTree.Objects.Geometry
  genGeometry(geoNode, skeleton, morphTargets, preTransform) {
    const geo = new BufferGeometry();
    if (geoNode.attrName) geo.name = geoNode.attrName;

    const geoInfo = this.parseGeoNode(geoNode, skeleton);
    const buffers = this.genBuffers(geoInfo);

    const positionAttribute = new Float32BufferAttribute(buffers.vertex, 3);

    preTransform.applyToBufferAttribute(positionAttribute);

    geo.setAttribute('position', positionAttribute);

    if (buffers.colors.length > 0) {
      geo.setAttribute('color', new Float32BufferAttribute(buffers.colors, 3));
    }

    if (skeleton) {
      geo.setAttribute('skinIndex', new Uint16BufferAttribute(buffers.weightsIndices, 4));

      geo.setAttribute('skinWeight', new Float32BufferAttribute(buffers.vertexWeights, 4));

      // used later to bind the skeleton to the model
      // @ts-ignore
      geo.FBX_Deformer = skeleton;
    }

    if (buffers.normal.length > 0) {
      const normalAttribute = new Float32BufferAttribute(buffers.normal, 3);

      const normalMatrix = new Matrix3().getNormalMatrix(preTransform);
      normalMatrix.applyToBufferAttribute(normalAttribute);

      geo.setAttribute('normal', normalAttribute);
    }

    buffers.uvs.forEach((uvBuffer, i) => {
      // subsequent uv buffers are called 'uv1', 'uv2', ...
      let name = 'uv' + (i + 1).toString();

      // the first uv buffer is just called 'uv'
      if (i === 0) {
        name = 'uv';
      }

      geo.setAttribute(name, new Float32BufferAttribute(buffers.uvs[i], 2));
    });

    if (geoInfo.material && geoInfo.material.mappingType !== 'AllSame') {
      // Convert the material indices of each vertex into rendering groups on the geometry.
      let prevMaterialIndex = buffers.materialIndex[0];
      let startIndex = 0;

      buffers.materialIndex.forEach(function(currentIndex, i) {
        if (currentIndex !== prevMaterialIndex) {
          geo.addGroup(startIndex, i - startIndex, prevMaterialIndex);

          prevMaterialIndex = currentIndex;
          startIndex = i;
        }
      });

      // the loop above doesn't add the last group, do that here.
      if (geo.groups.length > 0) {
        const lastGroup = geo.groups[geo.groups.length - 1];
        const lastIndex = lastGroup.start + lastGroup.count;

        if (lastIndex !== buffers.materialIndex.length) {
          geo.addGroup(lastIndex, buffers.materialIndex.length - lastIndex, prevMaterialIndex);
        }
      }

      // case where there are multiple materials but the whole geometry is only
      // using one of them
      if (geo.groups.length === 0) {
        geo.addGroup(0, buffers.materialIndex.length, buffers.materialIndex[0]);
      }
    }

    this.addMorphTargets(geo, geoNode, morphTargets, preTransform);

    return geo;
  }

  parseGeoNode(geoNode, skeleton) {
    const geoInfo: any = {};

    geoInfo.vertexPositions = geoNode.Vertices !== undefined ? geoNode.Vertices.a : [];
    geoInfo.vertexIndices = geoNode.PolygonVertexIndex !== undefined ? geoNode.PolygonVertexIndex.a : [];

    if (geoNode.LayerElementColor) {
      geoInfo.color = this.parseVertexColors(geoNode.LayerElementColor[0]);
    }

    if (geoNode.LayerElementMaterial) {
      geoInfo.material = this.parseMaterialIndices(geoNode.LayerElementMaterial[0]);
    }

    if (geoNode.LayerElementNormal) {
      geoInfo.normal = this.parseNormals(geoNode.LayerElementNormal[0]);
    }

    if (geoNode.LayerElementUV) {
      geoInfo.uv = [];

      let i = 0;
      while (geoNode.LayerElementUV[i]) {
        geoInfo.uv.push(this.parseUVs(geoNode.LayerElementUV[i]));
        i++;
      }
    }

    geoInfo.weightTable = {};

    if (skeleton !== null) {
      geoInfo.skeleton = skeleton;

      skeleton.rawBones.forEach(function(rawBone, i) {
        // loop over the bone's vertex indices and weights
        rawBone.indices.forEach(function(index, j) {
          if (geoInfo.weightTable[index] === undefined) geoInfo.weightTable[index] = [];

          geoInfo.weightTable[index].push({
            id: i,
            weight: rawBone.weights[j]
          });
        });
      });
    }

    return geoInfo;
  }

  genBuffers(geoInfo) {
    const buffers = {
      vertex: [],
      normal: [],
      colors: [],
      uvs: [],
      materialIndex: [],
      vertexWeights: [],
      weightsIndices: []
    };

    let polygonIndex = 0;
    let faceLength = 0;
    let displayedWeightsWarning = false;

    // these will hold data for a single face
    let facePositionIndexes: any = [];
    let faceNormals: any = [];
    let faceColors: any = [];
    let faceUVs: any = [];
    let faceWeights: any = [];
    let faceWeightIndices: any = [];

    geoInfo.vertexIndices.forEach((vertexIndex, polygonVertexIndex) => {
      let endOfFace = false;

      // Face index and vertex index arrays are combined in a single array
      // A cube with quad faces looks like this:
      // PolygonVertexIndex: *24 {
      //  a: 0, 1, 3, -3, 2, 3, 5, -5, 4, 5, 7, -7, 6, 7, 1, -1, 1, 7, 5, -4, 6, 0, 2, -5
      //  }
      // Negative numbers mark the end of a face - first face here is 0, 1, 3, -3
      // to find index of last vertex bit shift the index: ^ - 1
      if (vertexIndex < 0) {
        vertexIndex = vertexIndex ^ -1; // equivalent to ( x * -1 ) - 1
        endOfFace = true;
      }

      let weightIndices: any = [];
      let weights: any = [];

      facePositionIndexes.push(vertexIndex * 3, vertexIndex * 3 + 1, vertexIndex * 3 + 2);

      if (geoInfo.color) {
        const data = getData(polygonVertexIndex, polygonIndex, vertexIndex, geoInfo.color);

        faceColors.push(data[0], data[1], data[2]);
      }

      if (geoInfo.skeleton) {
        if (geoInfo.weightTable[vertexIndex] !== undefined) {
          geoInfo.weightTable[vertexIndex].forEach(function(wt) {
            weights.push(wt.weight);
            weightIndices.push(wt.id);
          });
        }

        if (weights.length > 4) {
          if (!displayedWeightsWarning) {
            console.warn(
              'THREE.FBXLoader: Vertex has more than 4 skinning weights assigned to vertex. Deleting additional weights.'
            );
            displayedWeightsWarning = true;
          }

          var wIndex = [0, 0, 0, 0];
          var Weight = [0, 0, 0, 0];

          weights.forEach(function(weight, weightIndex) {
            var currentWeight = weight;
            var currentIndex = weightIndices[weightIndex];

            Weight.forEach(function(comparedWeight, comparedWeightIndex, comparedWeightArray) {
              if (currentWeight > comparedWeight) {
                comparedWeightArray[comparedWeightIndex] = currentWeight;
                currentWeight = comparedWeight;

                var tmp = wIndex[comparedWeightIndex];
                wIndex[comparedWeightIndex] = currentIndex;
                currentIndex = tmp;
              }
            });
          });

          weightIndices = wIndex;
          weights = Weight;
        }

        // if the weight array is shorter than 4 pad with 0s
        while (weights.length < 4) {
          weights.push(0);
          weightIndices.push(0);
        }

        for (let i = 0; i < 4; ++i) {
          faceWeights.push(weights[i]);
          faceWeightIndices.push(weightIndices[i]);
        }
      }

      if (geoInfo.normal) {
        var data = getData(polygonVertexIndex, polygonIndex, vertexIndex, geoInfo.normal);

        faceNormals.push(data[0], data[1], data[2]);
      }

      if (geoInfo.material && geoInfo.material.mappingType !== 'AllSame') {
        var materialIndex = getData(polygonVertexIndex, polygonIndex, vertexIndex, geoInfo.material)[0];
      }

      if (geoInfo.uv) {
        geoInfo.uv.forEach(function(uv, i) {
          const data = getData(polygonVertexIndex, polygonIndex, vertexIndex, uv);

          if (faceUVs[i] === undefined) {
            faceUVs[i] = [];
          }

          faceUVs[i].push(data[0]);
          faceUVs[i].push(data[1]);
        });
      }

      faceLength++;

      if (endOfFace) {
        this.genFace(
          buffers,
          geoInfo,
          facePositionIndexes,
          materialIndex,
          faceNormals,
          faceColors,
          faceUVs,
          faceWeights,
          faceWeightIndices,
          faceLength
        );

        polygonIndex++;
        faceLength = 0;

        // reset arrays for the next face
        facePositionIndexes = [];
        faceNormals = [];
        faceColors = [];
        faceUVs = [];
        faceWeights = [];
        faceWeightIndices = [];
      }
    });

    return buffers;
  }

  // Generate data for a single face in a geometry. If the face is a quad then split it into 2 tris
  genFace(
    buffers,
    geoInfo,
    facePositionIndexes,
    materialIndex,
    faceNormals,
    faceColors,
    faceUVs,
    faceWeights,
    faceWeightIndices,
    faceLength
  ) {
    for (var i = 2; i < faceLength; i++) {
      buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[0]]);
      buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[1]]);
      buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[2]]);

      buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[(i - 1) * 3]]);
      buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[(i - 1) * 3 + 1]]);
      buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[(i - 1) * 3 + 2]]);

      buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[i * 3]]);
      buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[i * 3 + 1]]);
      buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[i * 3 + 2]]);

      if (geoInfo.skeleton) {
        buffers.vertexWeights.push(faceWeights[0]);
        buffers.vertexWeights.push(faceWeights[1]);
        buffers.vertexWeights.push(faceWeights[2]);
        buffers.vertexWeights.push(faceWeights[3]);

        buffers.vertexWeights.push(faceWeights[(i - 1) * 4]);
        buffers.vertexWeights.push(faceWeights[(i - 1) * 4 + 1]);
        buffers.vertexWeights.push(faceWeights[(i - 1) * 4 + 2]);
        buffers.vertexWeights.push(faceWeights[(i - 1) * 4 + 3]);

        buffers.vertexWeights.push(faceWeights[i * 4]);
        buffers.vertexWeights.push(faceWeights[i * 4 + 1]);
        buffers.vertexWeights.push(faceWeights[i * 4 + 2]);
        buffers.vertexWeights.push(faceWeights[i * 4 + 3]);

        buffers.weightsIndices.push(faceWeightIndices[0]);
        buffers.weightsIndices.push(faceWeightIndices[1]);
        buffers.weightsIndices.push(faceWeightIndices[2]);
        buffers.weightsIndices.push(faceWeightIndices[3]);

        buffers.weightsIndices.push(faceWeightIndices[(i - 1) * 4]);
        buffers.weightsIndices.push(faceWeightIndices[(i - 1) * 4 + 1]);
        buffers.weightsIndices.push(faceWeightIndices[(i - 1) * 4 + 2]);
        buffers.weightsIndices.push(faceWeightIndices[(i - 1) * 4 + 3]);

        buffers.weightsIndices.push(faceWeightIndices[i * 4]);
        buffers.weightsIndices.push(faceWeightIndices[i * 4 + 1]);
        buffers.weightsIndices.push(faceWeightIndices[i * 4 + 2]);
        buffers.weightsIndices.push(faceWeightIndices[i * 4 + 3]);
      }

      if (geoInfo.color) {
        buffers.colors.push(faceColors[0]);
        buffers.colors.push(faceColors[1]);
        buffers.colors.push(faceColors[2]);

        buffers.colors.push(faceColors[(i - 1) * 3]);
        buffers.colors.push(faceColors[(i - 1) * 3 + 1]);
        buffers.colors.push(faceColors[(i - 1) * 3 + 2]);

        buffers.colors.push(faceColors[i * 3]);
        buffers.colors.push(faceColors[i * 3 + 1]);
        buffers.colors.push(faceColors[i * 3 + 2]);
      }

      if (geoInfo.material && geoInfo.material.mappingType !== 'AllSame') {
        buffers.materialIndex.push(materialIndex);
        buffers.materialIndex.push(materialIndex);
        buffers.materialIndex.push(materialIndex);
      }

      if (geoInfo.normal) {
        buffers.normal.push(faceNormals[0]);
        buffers.normal.push(faceNormals[1]);
        buffers.normal.push(faceNormals[2]);

        buffers.normal.push(faceNormals[(i - 1) * 3]);
        buffers.normal.push(faceNormals[(i - 1) * 3 + 1]);
        buffers.normal.push(faceNormals[(i - 1) * 3 + 2]);

        buffers.normal.push(faceNormals[i * 3]);
        buffers.normal.push(faceNormals[i * 3 + 1]);
        buffers.normal.push(faceNormals[i * 3 + 2]);
      }

      if (geoInfo.uv) {
        geoInfo.uv.forEach(function(uv, j) {
          if (buffers.uvs[j] === undefined) buffers.uvs[j] = [];

          buffers.uvs[j].push(faceUVs[j][0]);
          buffers.uvs[j].push(faceUVs[j][1]);

          buffers.uvs[j].push(faceUVs[j][(i - 1) * 2]);
          buffers.uvs[j].push(faceUVs[j][(i - 1) * 2 + 1]);

          buffers.uvs[j].push(faceUVs[j][i * 2]);
          buffers.uvs[j].push(faceUVs[j][i * 2 + 1]);
        });
      }
    }
  }

  addMorphTargets(parentGeo, parentGeoNode, morphTargets, preTransform) {
    if (morphTargets.length === 0) return;

    parentGeo.morphAttributes.position = [];
    // parentGeo.morphAttributes.normal = []; // not implemented

    morphTargets.forEach(morphTarget => {
      morphTarget.rawTargets.forEach(rawTarget => {
        const morphGeoNode = this.fbxTree.Objects.Geometry[rawTarget.geoID];

        if (morphGeoNode !== undefined) {
          this.genMorphGeometry(parentGeo, parentGeoNode, morphGeoNode, preTransform, rawTarget.name);
        }
      });
    });
  }

  // a morph geometry node is similar to a standard  node, and the node is also contained
  // in FBXTree.Objects.Geometry, however it can only have attributes for position, normal
  // and a special attribute Index defining which vertices of the original geometry are affected
  // Normal and position attributes only have data for the vertices that are affected by the morph
  genMorphGeometry(parentGeo, parentGeoNode, morphGeoNode, preTransform, name) {
    var morphGeo = new BufferGeometry();
    if (morphGeoNode.attrName) morphGeo.name = morphGeoNode.attrName;

    var vertexIndices = parentGeoNode.PolygonVertexIndex !== undefined ? parentGeoNode.PolygonVertexIndex.a : [];

    // make a copy of the parent's vertex positions
    var vertexPositions = parentGeoNode.Vertices !== undefined ? parentGeoNode.Vertices.a.slice() : [];

    var morphPositions = morphGeoNode.Vertices !== undefined ? morphGeoNode.Vertices.a : [];
    var indices = morphGeoNode.Indexes !== undefined ? morphGeoNode.Indexes.a : [];

    for (var i = 0; i < indices.length; i++) {
      var morphIndex = indices[i] * 3;

      // FBX format uses blend shapes rather than morph targets. This can be converted
      // by additively combining the blend shape positions with the original geometry's positions
      vertexPositions[morphIndex] += morphPositions[i * 3];
      vertexPositions[morphIndex + 1] += morphPositions[i * 3 + 1];
      vertexPositions[morphIndex + 2] += morphPositions[i * 3 + 2];
    }

    // TODO: add morph normal support
    var morphGeoInfo = {
      vertexIndices: vertexIndices,
      vertexPositions: vertexPositions
    };

    var morphBuffers = this.genBuffers(morphGeoInfo);

    var positionAttribute = new THREE.Float32BufferAttribute(morphBuffers.vertex, 3);
    positionAttribute.name = name || morphGeoNode.attrName;

    preTransform.applyToBufferAttribute(positionAttribute);

    parentGeo.morphAttributes.position.push(positionAttribute);
  }

  // Parse normal from FBXTree.Objects.Geometry.LayerElementNormal if it exists
  parseNormals(NormalNode) {
    const mappingType = NormalNode.MappingInformationType;
    const referenceType = NormalNode.ReferenceInformationType;
    const buffer = NormalNode.Normals.a;
    let indexBuffer = [];
    if (referenceType === 'IndexToDirect') {
      if ('NormalIndex' in NormalNode) {
        indexBuffer = NormalNode.NormalIndex.a;
      } else if ('NormalsIndex' in NormalNode) {
        indexBuffer = NormalNode.NormalsIndex.a;
      }
    }

    return {
      dataSize: 3,
      buffer: buffer,
      indices: indexBuffer,
      mappingType: mappingType,
      referenceType: referenceType
    };
  }

  // Parse UVs from FBXTree.Objects.Geometry.LayerElementUV if it exists
  parseUVs(UVNode) {
    const mappingType = UVNode.MappingInformationType;
    const referenceType = UVNode.ReferenceInformationType;
    const buffer = UVNode.UV.a;
    let indexBuffer = [];
    if (referenceType === 'IndexToDirect') {
      indexBuffer = UVNode.UVIndex.a;
    }

    return {
      dataSize: 2,
      buffer: buffer,
      indices: indexBuffer,
      mappingType: mappingType,
      referenceType: referenceType
    };
  }

  // Parse Vertex Colors from FBXTree.Objects.Geometry.LayerElementColor if it exists
  parseVertexColors(ColorNode) {
    const mappingType = ColorNode.MappingInformationType;
    const referenceType = ColorNode.ReferenceInformationType;
    const buffer = ColorNode.Colors.a;
    let indexBuffer = [];
    if (referenceType === 'IndexToDirect') {
      indexBuffer = ColorNode.ColorIndex.a;
    }

    return {
      dataSize: 4,
      buffer: buffer,
      indices: indexBuffer,
      mappingType: mappingType,
      referenceType: referenceType
    };
  }

  // Parse mapping and material data in FBXTree.Objects.Geometry.LayerElementMaterial if it exists
  parseMaterialIndices(MaterialNode) {
    const mappingType = MaterialNode.MappingInformationType;
    const referenceType = MaterialNode.ReferenceInformationType;

    if (mappingType === 'NoMappingInformation') {
      return {
        dataSize: 1,
        buffer: [0],
        indices: [0],
        mappingType: 'AllSame',
        referenceType: referenceType
      };
    }

    const materialIndexBuffer = MaterialNode.Materials.a;

    // Since materials are stored as indices, there's a bit of a mismatch between FBX and what
    // we expect.So we create an intermediate buffer that points to the index in the buffer,
    // for conforming with the other functions we've written for other data.
    const materialIndices: any[] = [];

    for (let i = 0; i < materialIndexBuffer.length; ++i) {
      materialIndices.push(i);
    }

    return {
      dataSize: 1,
      buffer: materialIndexBuffer,
      indices: materialIndices,
      mappingType: mappingType,
      referenceType: referenceType
    };
  }

  // Generate a NurbsGeometry from a node in FBXTree.Objects.Geometry
  parseNurbsGeometry(geoNode) {
    // @ts-ignore
    if (THREE.NURBSCurve === undefined) {
      console.error(
        'THREE.FBXLoader: The loader relies on THREE.NURBSCurve for any nurbs present in the model. Nurbs will show up as empty geometry.'
      );
      return new BufferGeometry();
    }

    const order = parseInt(geoNode.Order);

    if (isNaN(order)) {
      console.error('THREE.FBXLoader: Invalid Order %s given for geometry ID: %s', geoNode.Order, geoNode.id);
      return new BufferGeometry();
    }

    const degree = order - 1;

    const knots = geoNode.KnotVector.a;
    const controlPoints: any[] = [];
    const pointsValues = geoNode.Points.a;

    for (let i = 0, l = pointsValues.length; i < l; i += 4) {
      controlPoints.push(new Vector4().fromArray(pointsValues, i));
    }

    let startKnot, endKnot;

    if (geoNode.Form === 'Closed') {
      controlPoints.push(controlPoints[0]);
    } else if (geoNode.Form === 'Periodic') {
      startKnot = degree;
      endKnot = knots.length - 1 - startKnot;

      for (let i = 0; i < degree; ++i) {
        controlPoints.push(controlPoints[i]);
      }
    }
    //@ts-ignore
    const curve = new THREE.NURBSCurve(degree, knots, controlPoints, startKnot, endKnot);
    const vertices = curve.getPoints(controlPoints.length * 7);

    const positions = new Float32Array(vertices.length * 3);

    vertices.forEach(function(vertex, i) {
      vertex.toArray(positions, i * 3);
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    return geometry;
  }
}
