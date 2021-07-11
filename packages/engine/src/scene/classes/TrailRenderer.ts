import { Group, MathUtils, Matrix4, BufferAttribute, BufferGeometry, Vector2, Vector4, Quaternion, Matrix3, Mesh, Object3D, Vector3, CustomBlending, SrcAlphaFactor, OneMinusSrcAlphaFactor, AddEquation, DoubleSide, ShaderMaterial, Scene } from 'three';

/**
* @author Mark Kellogg - http://www.github.com/mkkellogg
*/

//=======================================
// Trail Renderer
//=======================================
var returnObj = {

  "attribute": null,
  "offset": 0,
  "count": - 1

};




const BaseVertexVars = [

  "attribute float nodeID;",
  "attribute float nodeVertexID;",
  "attribute vec3 nodeCenter;",

  "uniform float minID;",
  "uniform float maxID;",
  "uniform float trailLength;",
  "uniform float maxTrailLength;",
  "uniform float verticesPerNode;",
  "uniform vec2 textureTileFactor;",

  "uniform vec4 headColor;",
  "uniform vec4 tailColor;",

  "varying vec4 vColor;",

].join("\n");

const TexturedVertexVars = [

  BaseVertexVars,
  "varying vec2 vUV;",
  "uniform float dragTexture;",

].join("\n");

const BaseFragmentVars = [

  "varying vec4 vColor;",
  "uniform sampler2D texture;",

].join("\n");

const TexturedFragmentVars = [

  BaseFragmentVars,
  "varying vec2 vUV;"

].join("\n");

const VertexShaderCore = [

  "float fraction = ( maxID - nodeID ) / ( maxID - minID );",
  "vColor = ( 1.0 - fraction ) * headColor + fraction * tailColor;",
  "vec4 realPosition = vec4( ( 1.0 - fraction ) * position.xyz + fraction * nodeCenter.xyz, 1.0 ); ",

].join("\n");

const BaseVertexShader = [

  BaseVertexVars,

  "void main() { ",

  VertexShaderCore,
  "gl_Position = projectionMatrix * viewMatrix * realPosition;",

  "}"

].join("\n");

const BaseFragmentShader = [

  BaseFragmentVars,

  "void main() { ",

  "gl_FragColor = vColor;",

  "}"

].join("\n");

const TexturedVertexShader = [

  TexturedVertexVars,

  "void main() { ",

  VertexShaderCore,
  "float s = 0.0;",
  "float t = 0.0;",
  "if ( dragTexture == 1.0 ) { ",
  "   s = fraction *  textureTileFactor.s; ",
  " 	t = ( nodeVertexID / verticesPerNode ) * textureTileFactor.t;",
  "} else { ",
  "	s = nodeID / maxTrailLength * textureTileFactor.s;",
  " 	t = ( nodeVertexID / verticesPerNode ) * textureTileFactor.t;",
  "}",
  "vUV = vec2( s, t ); ",
  "gl_Position = projectionMatrix * viewMatrix * realPosition;",

  "}"

].join("\n");

const TexturedFragmentShader = [

  TexturedFragmentVars,

  "void main() { ",

  "vec4 textureColor = texture2D( texture, vUV );",
  "gl_FragColor = vColor * textureColor;",

  "}"

].join("\n");

class TrailRenderer extends Object3D {

  static MaxHeadVertices = 128;
  static LocalOrientationTangent = new Vector3(1, 0, 0);
  static LocalOrientationDirection = new Vector3(0, 0, -1);
  static LocalHeadOrigin = new Vector3(0, 0, 0);
  static PositionComponentCount = 3;
  static UVComponentCount = 2;
  static IndicesPerFace = 3;
  static FacesPerQuad = 2;
  static BaseVertexVars = [

    "attribute float nodeID;",
    "attribute float nodeVertexID;",
    "attribute vec3 nodeCenter;",

    "uniform float minID;",
    "uniform float maxID;",
    "uniform float trailLength;",
    "uniform float maxTrailLength;",
    "uniform float verticesPerNode;",
    "uniform vec2 textureTileFactor;",

    "uniform vec4 headColor;",
    "uniform vec4 tailColor;",

    "varying vec4 vColor;",

  ].join("\n");

  static TexturedVertexVars = [

    BaseVertexVars,
    "varying vec2 vUV;",
    "uniform float dragTexture;",

  ].join("\n");

  static BaseFragmentVars = [

    "varying vec4 vColor;",
    "uniform sampler2D texture;",

  ].join("\n");

  static TexturedFragmentVars = [

    BaseFragmentVars,
    "varying vec2 vUV;"

  ].join("\n");

  static VertexShaderCore = [

    "float fraction = ( maxID - nodeID ) / ( maxID - minID );",
    "vColor = ( 1.0 - fraction ) * headColor + fraction * tailColor;",
    "vec4 realPosition = vec4( ( 1.0 - fraction ) * position.xyz + fraction * nodeCenter.xyz, 1.0 ); ",

  ].join("\n");

  static BaseVertexShader = [

    BaseVertexVars,

    "void main() { ",

    VertexShaderCore,
    "gl_Position = projectionMatrix * viewMatrix * realPosition;",

    "}"

  ].join("\n");

  static BaseFragmentShader = [

    BaseFragmentVars,

    "void main() { ",

    "gl_FragColor = vColor;",

    "}"

  ].join("\n");

  static TexturedVertexShader = [

    TexturedVertexVars,

    "void main() { ",

    VertexShaderCore,
    "float s = 0.0;",
    "float t = 0.0;",
    "if ( dragTexture == 1.0 ) { ",
    "   s = fraction *  textureTileFactor.s; ",
    " 	t = ( nodeVertexID / verticesPerNode ) * textureTileFactor.t;",
    "} else { ",
    "	s = nodeID / maxTrailLength * textureTileFactor.s;",
    " 	t = ( nodeVertexID / verticesPerNode ) * textureTileFactor.t;",
    "}",
    "vUV = vec2( s, t ); ",
    "gl_Position = projectionMatrix * viewMatrix * realPosition;",

    "}"

  ].join("\n");

  static TexturedFragmentShader = [

    TexturedFragmentVars,

    "void main() { ",

    "vec4 textureColor = texture2D( texture, vUV );",
    "gl_FragColor = vColor * textureColor;",

    "}"

  ].join("\n");

  active: boolean = false;
  orientToMovement: boolean = false;
  geometry: BufferGeometry = null;
  mesh: Mesh = null;
  nodeCenters = null;
  lastNodeCenter = null;
  currentNodeCenter = null;
  lastOrientationDir = null;
  nodeIDs = null;
  currentLength = 0;
  currentEnd = 0;
  currentNodeID = 0;

  scene: Scene;
  material;
  length = 200;
  localHeadGeometry; // array of numbers, needs typing
  // Test fix
  VerticesPerNode = 10;
  vertexCount = 10;
  faceCount = 10;
  FacesPerNode = 10;
  FaceIndicesPerNode: 10;

  constructor(scene, orientToMovement) {
    super();

    this.orientToMovement = false;
    if (orientToMovement) this.orientToMovement = true;

    this.scene = scene;
  }

  createMaterial(vertexShader, fragmentShader, customUniforms) {
    customUniforms = customUniforms || {};

    customUniforms.trailLength = { type: "f", value: null };
    customUniforms.verticesPerNode = { type: "f", value: null };
    customUniforms.minID = { type: "f", value: null };
    customUniforms.maxID = { type: "f", value: null };
    customUniforms.dragTexture = { type: "f", value: null };
    customUniforms.maxTrailLength = { type: "f", value: null };
    customUniforms.textureTileFactor = { type: "v2", value: null };

    customUniforms.headColor = { type: "v4", value: new Vector4() };
    customUniforms.tailColor = { type: "v4", value: new Vector4() };

    vertexShader = vertexShader || BaseVertexShader;
    fragmentShader = fragmentShader || BaseFragmentShader;

    return new ShaderMaterial(
      {
        uniforms: customUniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,

        transparent: true,
        alphaTest: 0.5,

        blending: CustomBlending,
        blendSrc: SrcAlphaFactor,
        blendDst: OneMinusSrcAlphaFactor,
        blendEquation: AddEquation,

        depthTest: true,
        depthWrite: false,

        side: DoubleSide
      });
  }

  public createBaseMaterial(customUniforms) {

    return this.createMaterial(BaseVertexShader, BaseFragmentShader, customUniforms);

  }

  createTexturedMaterial(customUniforms) {

    customUniforms = {};
    customUniforms.texture = { type: "t", value: null };

    return this.createMaterial(TexturedVertexShader, TexturedFragmentShader, customUniforms);

  }

  // Was prototype
  initialize(material, length, dragTexture, localHeadWidth, localHeadGeometry, targetObject) {

    this.deactivate();
    this.destroyMesh();

    length = (length > 0) ? length + 1 : 0;
    dragTexture = (!dragTexture) ? 0 : 1;
    targetObject = targetObject;

    this.initializeLocalHeadGeometry(localHeadWidth, localHeadGeometry);

    this.nodeIDs = [];
    this.nodeCenters = [];

    for (var i = 0; i < this.length; i++) {

      this.nodeIDs[i] = -1;
      this.nodeCenters[i] = new Vector3();

    }

    this.material = material;

    this.initializeGeometry();
    this.initializeMesh();

    this.material.uniforms.trailLength.value = 0;
    this.material.uniforms.minID.value = 0;
    this.material.uniforms.maxID.value = 0;
    this.material.uniforms.dragTexture.value = dragTexture;
    this.material.uniforms.maxTrailLength.value = length;
    this.material.uniforms.verticesPerNode.value = this.VerticesPerNode;
    this.material.uniforms.textureTileFactor.value = new Vector2(1.0, 1.0);

    this.reset();
  }

  initializeLocalHeadGeometry = function (localHeadWidth, localHeadGeometry) {

    this.localHeadGeometry = [];

    if (!localHeadGeometry) {

      var halfWidth = localHeadWidth || 1.0;
      halfWidth = halfWidth / 2.0;

      this.localHeadGeometry.push(new Vector3(-halfWidth, 0, 0));
      this.localHeadGeometry.push(new Vector3(halfWidth, 0, 0));

      this.VerticesPerNode = 2;

    } else {

      this.VerticesPerNode = 0;
      for (var i = 0; i < localHeadGeometry.length && i < TrailRenderer.MaxHeadVertices; i++) {

        var vertex = localHeadGeometry[i];

        if (vertex && vertex instanceof Vector3) {

          var vertexCopy = new Vector3();

          vertexCopy.copy(vertex);

          this.localHeadGeometry.push(vertexCopy);
          this.VerticesPerNode++;

        }

      }

    }

    this.FacesPerNode = (this.VerticesPerNode - 1) * 2;
    this.FaceIndicesPerNode = this.FacesPerNode * 3;

  }

  initializeGeometry() {

    this.vertexCount = this.length * this.VerticesPerNode;
    this.faceCount = this.length * this.FacesPerNode;

    var geometry = new BufferGeometry();

    var nodeIDs = new Float32Array(this.vertexCount);
    var nodeVertexIDs = new Float32Array(this.vertexCount * this.VerticesPerNode);
    var positions = new Float32Array(this.vertexCount * TrailRenderer.PositionComponentCount);
    var nodeCenters = new Float32Array(this.vertexCount * TrailRenderer.PositionComponentCount);
    var uvs = new Float32Array(this.vertexCount * TrailRenderer.UVComponentCount);
    var indices = new Uint32Array(this.faceCount * TrailRenderer.IndicesPerFace);

    var nodeIDAttribute = new BufferAttribute(nodeIDs, 1);
    geometry.setAttribute('nodeID', nodeIDAttribute);

    var nodeVertexIDAttribute = new BufferAttribute(nodeVertexIDs, 1);
    geometry.setAttribute('nodeVertexID', nodeVertexIDAttribute);

    var nodeCenterAttribute = new BufferAttribute(nodeCenters, TrailRenderer.PositionComponentCount);
    geometry.setAttribute('nodeCenter', nodeCenterAttribute);

    var positionAttribute = new BufferAttribute(positions, TrailRenderer.PositionComponentCount);
    geometry.setAttribute('position', positionAttribute);

    var uvAttribute = new BufferAttribute(uvs, TrailRenderer.UVComponentCount);
    geometry.setAttribute('uv', uvAttribute);

    var indexAttribute = new BufferAttribute(indices, 1);
    geometry.setIndex(indexAttribute);

    this.geometry = geometry;

  }

  zeroVertices() {

    var positions = this.geometry.getAttribute('position');

    for (var i = 0; i < this.vertexCount; i++) {

      var index = i * 3;

      positions.setX(index, 0);
      positions.setY(index + 1, 0);
      positions.setZ(index + 2, 0);

    }

    positions.needsUpdate = true;
    //positions.updateRange.count = - 1;

  }

  zeroIndices() {

    var indices = this.geometry.getIndex();

    for (var i = 0; i < this.faceCount; i++) {

      var index = i * 3;

      indices.setX(index, 0);
      indices.setY(index + 1, 0);
      indices.setZ(index + 2, 0);

    }

    indices.needsUpdate = true;
    indices.updateRange.count = - 1;

  }

  formInitialFaces() {

    this.zeroIndices();

    var indices = this.geometry.getIndex();

    for (var i = 0; i < this.length - 1; i++) {

      this.connectNodes(i, i + 1);

    }

    indices.needsUpdate = true;
    indices.updateRange.count = - 1;

  }

  initializeMesh() {

    this.mesh = new Mesh(this.geometry, this.material);
    //StackOverflow says .dynamic unneeded in later versions
    //this.mesh.dynamic = true;
    this.mesh.matrixAutoUpdate = false;
  }

  destroyMesh() {

    if (this.mesh) {

      this.scene.remove(this.mesh);
      this.mesh = null;

    }

  }

  reset() {

    this.currentLength = 0;
    this.currentEnd = -1;

    this.lastNodeCenter = null;
    this.currentNodeCenter = null;
    this.lastOrientationDir = null;

    this.currentNodeID = 0;

    this.formInitialFaces();
    this.zeroVertices();

    this.geometry.setDrawRange(0, 0);

  }

  updateUniforms() {

    if (this.currentLength < this.length) {

      this.material.uniforms.minID.value = 0;

    } else {

      this.material.uniforms.minID.value = this.currentNodeID - this.length;

    }
    this.material.uniforms.maxID.value = this.currentNodeID;
    this.material.uniforms.trailLength.value = this.currentLength;
    this.material.uniforms.maxTrailLength.value = this.length;
    this.material.uniforms.verticesPerNode.value = this.VerticesPerNode;

  }

  advance() {

    var orientationTangent = new Vector3();
    var position = new Vector3();
    var offset = new Vector3();
    var tempMatrix4 = new Matrix4();

    return function advance() {

      this.targetObject.updateMatrixWorld();
      tempMatrix4.copy(this.targetObject.matrixWorld);

      this.advanceWithTransform(tempMatrix4);

      this.updateUniforms();
    }

  }

  advanceWithPositionAndOrientation(nextPosition, orientationTangent) {

    this.advanceGeometry({ position: nextPosition, tangent: orientationTangent }, null);

  }

  advanceWithTransform(transformMatrix) {

    this.advanceGeometry(null, transformMatrix);

  }

  advanceGeometry(positionAndOrientation, transformMatrix) {

    var nextIndex = this.currentEnd + 1 >= this.length ? 0 : this.currentEnd + 1;

    if (transformMatrix) {

      this.updateNodePositionsFromTransformMatrix(nextIndex, transformMatrix);

    } else {

      this.updateNodePositionsFromOrientationTangent(nextIndex, positionAndOrientation.position, positionAndOrientation.tangent);
    }

    if (this.currentLength >= 1) {

      var connectRange = this.connectNodes(this.currentEnd, nextIndex);
      var disconnectRange = null;

      if (this.currentLength >= this.length) {

        var disconnectIndex = this.currentEnd + 1 >= this.length ? 0 : this.currentEnd + 1;
        disconnectRange = this.disconnectNodes(disconnectIndex);

      }

    }

    if (this.currentLength < this.length) {

      this.currentLength++;

    }

    this.currentEnd++;
    if (this.currentEnd >= this.length) {

      this.currentEnd = 0;

    }

    if (this.currentLength >= 1) {

      if (this.currentLength < this.length) {

        this.geometry.setDrawRange(0, (this.currentLength - 1) * this.FaceIndicesPerNode);

      } else {

        this.geometry.setDrawRange(0, this.currentLength * this.FaceIndicesPerNode);

      }

    }

    this.updateNodeID(this.currentEnd, this.currentNodeID);
    this.currentNodeID++;
  }



  updateHead() {

    var tempMatrix4 = new Matrix4();

    return function advance() {

      if (this.currentEnd < 0) return;

      this.targetObject.updateMatrixWorld();
      tempMatrix4.copy(this.targetObject.matrixWorld);

      this.updateNodePositionsFromTransformMatrix(this.currentEnd, tempMatrix4);
    }

  };

  updateNodeID(nodeIndex, id) {

    this.nodeIDs[nodeIndex] = id;

    var nodeIDs = this.geometry.getAttribute('nodeID');
    var nodeVertexIDs = this.geometry.getAttribute('nodeVertexID');

    for (var i = 0; i < this.VerticesPerNode; i++) {

      var baseIndex = nodeIndex * this.VerticesPerNode + i;

      this.nodeIDs.array[baseIndex] = id;
      //this.nodeVertexIDs.array[ baseIndex ] = i;

    }

    nodeIDs.needsUpdate = true;
    nodeVertexIDs.needsUpdate = true;

    this.nodeIDs.updateRange.offset = nodeIndex * this.VerticesPerNode;
    this.nodeIDs.updateRange.count = this.VerticesPerNode;

    //this.nodeVertexIDs.updateRange.offset = nodeIndex * this.VerticesPerNode;
    //this.nodeVertexIDs.updateRange.count = this.VerticesPerNode;

  }

  updateNodeCenter(nodeIndex, nodeCenter) {

    this.lastNodeCenter = this.currentNodeCenter;

    this.currentNodeCenter = this.nodeCenters[nodeIndex];
    this.currentNodeCenter.copy(nodeCenter);

    var nodeCenters = this.geometry.getAttribute('nodeCenter');

    for (var i = 0; i < this.VerticesPerNode; i++) {

      var baseIndex = (nodeIndex * this.VerticesPerNode + i) * 3;
      this.nodeCenters.array[baseIndex] = nodeCenter.x;
      this.nodeCenters.array[baseIndex + 1] = nodeCenter.y;
      this.nodeCenters.array[baseIndex + 2] = nodeCenter.z;

    }

    nodeCenters.needsUpdate = true;
    //nodeCenters.offset = nodeIndex * this.VerticesPerNode *  TrailRenderer.PositionComponentCount; 
    //nodeCenters.updateRange.count = this.VerticesPerNode *  TrailRenderer.PositionComponentCount; 

  }




  updateNodePositionsFromOrientationTangent(nodeIndex, nodeCenter, orientationTangent) {
    var direction = new Vector3();
    var tempPosition = new Vector3();

    var tempMatrix4 = new Matrix4();
    var tempQuaternion = new Quaternion();
    var tempOffset = new Vector3();
    var tempLocalHeadGeometry = [];

    for (var i = 0; i < TrailRenderer.MaxHeadVertices; i++) {

      var vertex = new Vector3();
      tempLocalHeadGeometry.push(vertex);

    }

    var positions = this.geometry.getAttribute('position');

    this.updateNodeCenter(nodeIndex, nodeCenter);

    tempOffset.copy(nodeCenter);
    tempOffset.sub(TrailRenderer.LocalHeadOrigin);
    tempQuaternion.setFromUnitVectors(TrailRenderer.LocalOrientationTangent, orientationTangent);

    for (var i = 0; i < this.localHeadGeometry.length; i++) {

      vertex = tempLocalHeadGeometry[i];
      vertex.copy(this.localHeadGeometry[i]);
      vertex.applyQuaternion(tempQuaternion);
      vertex.add(tempOffset);
    }

    for (var i = 0; i < this.localHeadGeometry.length; i++) {

      var positionIndex = ((this.VerticesPerNode * nodeIndex) + i) * TrailRenderer.PositionComponentCount;
      var transformedHeadVertex = tempLocalHeadGeometry[i];

      positions.setX(positionIndex, transformedHeadVertex.x);
      positions.setY(positionIndex + 1, transformedHeadVertex.y);
      positions.setZ(positionIndex + 2, transformedHeadVertex.z);

    }

    positions.needsUpdate = true;

  }



  updateNodePositionsFromTransformMatrix(nodeIndex, transformMatrix) {
    var tempMatrix4 = new Matrix4();
    var tempMatrix3 = new Matrix3();
    var tempQuaternion = new Quaternion();
    var tempPosition = new Vector3();
    var tempOffset = new Vector3();
    var worldOrientation = new Vector3();
    var tempDirection = new Vector3();

    var tempLocalHeadGeometry = [];
    for (var i = 0; i < TrailRenderer.MaxHeadVertices; i++) {

      var vertex = new Vector3();
      tempLocalHeadGeometry.push(vertex);

    }

    function getMatrix3FromMatrix4(matrix3, matrix4) {

      var e = matrix4.elements;
      matrix3.set(e[0], e[1], e[2],
        e[4], e[5], e[6],
        e[8], e[9], e[10]);

    }

    var positions = this.geometry.getAttribute('position');

    tempPosition.set(0, 0, 0);
    tempPosition.applyMatrix4(transformMatrix);
    this.updateNodeCenter(nodeIndex, tempPosition);

    for (var i = 0; i < this.localHeadGeometry.length; i++) {

      var vertex2 = tempLocalHeadGeometry[i];
      vertex2.copy(this.localHeadGeometry[i]);

    }

    for (var i = 0; i < this.localHeadGeometry.length; i++) {

      var vertex3 = tempLocalHeadGeometry[i];
      vertex3.applyMatrix4(transformMatrix);

    }

    if (this.lastNodeCenter && this.orientToMovement) {

      getMatrix3FromMatrix4(tempMatrix3, transformMatrix);
      worldOrientation.set(0, 0, -1);
      worldOrientation.applyMatrix3(tempMatrix3);

      tempDirection.copy(this.currentNodeCenter);
      tempDirection.sub(this.lastNodeCenter);
      tempDirection.normalize();

      if (tempDirection.lengthSq() <= .0001 && this.lastOrientationDir) {

        tempDirection.copy(this.lastOrientationDir);
      }

      if (tempDirection.lengthSq() > .0001) {

        if (!this.lastOrientationDir) this.lastOrientationDir = new Vector3();

        tempQuaternion.setFromUnitVectors(worldOrientation, tempDirection);

        tempOffset.copy(this.currentNodeCenter);

        for (var i = 0; i < this.localHeadGeometry.length; i++) {

          var vertex4 = tempLocalHeadGeometry[i];
          vertex4.sub(tempOffset);
          vertex4.applyQuaternion(tempQuaternion);
          vertex4.add(tempOffset);

        }
      }

    }

    for (var i = 0; i < this.localHeadGeometry.length; i++) {

      var positionIndex = ((this.VerticesPerNode * nodeIndex) + i) * TrailRenderer.PositionComponentCount;
      var transformedHeadVertex = tempLocalHeadGeometry[i];

      positions.setX(positionIndex, transformedHeadVertex.x);
      positions.setX(positionIndex + 1, transformedHeadVertex.y);
      positions.setX(positionIndex + 2, transformedHeadVertex.z);

    }

    positions.needsUpdate = true;

    //positions.updateRange.offset = nodeIndex * this.VerticesPerNode *  TrailRenderer.PositionComponentCount; 
    //positions.updateRange.count = this.VerticesPerNode *  TrailRenderer.PositionComponentCount; 
  }




  connectNodes(srcNodeIndex, destNodeIndex) {

    var indices = this.geometry.getIndex();

    for (var i = 0; i < this.localHeadGeometry.length - 1; i++) {

      var srcVertexIndex = (this.VerticesPerNode * srcNodeIndex) + i;
      var destVertexIndex = (this.VerticesPerNode * destNodeIndex) + i;

      var faceIndex = ((srcNodeIndex * this.FacesPerNode) + (i * TrailRenderer.FacesPerQuad)) * TrailRenderer.IndicesPerFace;

      indices.setX(faceIndex, srcVertexIndex);
      indices.setY(faceIndex + 1, destVertexIndex);
      indices.setZ(faceIndex + 2, srcVertexIndex + 1);

      indices.setX(faceIndex + 3, destVertexIndex);
      indices.setY(faceIndex + 4, destVertexIndex + 1);
      indices.setZ(faceIndex + 5, srcVertexIndex + 1);

    }

    indices.needsUpdate = true;
    indices.updateRange.count = - 1;

    returnObj.attribute = indices;
    returnObj.offset = srcNodeIndex * this.FacesPerNode * TrailRenderer.IndicesPerFace;
    returnObj.count = this.FacesPerNode * TrailRenderer.IndicesPerFace;

    return returnObj;

  }


  disconnectNodes(srcNodeIndex) {

    var indices = this.geometry.getIndex();

    for (var i = 0; i < this.localHeadGeometry.length - 1; i++) {

      var srcVertexIndex = (this.VerticesPerNode * srcNodeIndex) + i;

      var faceIndex = ((srcNodeIndex * this.FacesPerNode) + (i * TrailRenderer.FacesPerQuad)) * TrailRenderer.IndicesPerFace;

      indices.setX(faceIndex, 0);
      indices.setY(faceIndex + 1, 0);
      indices.setZ(faceIndex + 2, 0);

      indices.setX(faceIndex + 3, 0);
      indices.setY(faceIndex + 4, 0);
      indices.setZ(faceIndex + 5, 0);

    }

    indices.needsUpdate = true;
    indices.updateRange.count = - 1;

    returnObj.attribute = indices;
    returnObj.offset = srcNodeIndex * this.FacesPerNode * TrailRenderer.IndicesPerFace;
    returnObj.count = this.FacesPerNode * TrailRenderer.IndicesPerFace;

    return returnObj;

  }



  activate() {

    if (!this.active) {
      this.scene.add(this.mesh);
      this.active = true;
    }

  }

  deactivate() {

    if (this.active) {

      this.scene.remove(this.mesh);
      this.active = false;
    }

  }
}


export default TrailRenderer;