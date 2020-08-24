import {
  Math as MATH,
  LoadingManager,
  RepeatWrapping,
  ClampToEdgeWrapping,
  Texture,
  MeshPhongMaterial,
  MeshLambertMaterial,
  Material,
  Color,
  sRGBEncoding,
  EquirectangularReflectionMapping,
  Matrix4,
  Group,
  Bone,
  PropertyBinding,
  Object3D,
  OrthographicCamera,
  PerspectiveCamera,
  DirectionalLight,
  PointLight,
  SpotLight,
  VertexColors,
  Mesh,
  SkinnedMesh,
  Line,
  LineBasicMaterial,
  Vector3,
  Skeleton,
  AmbientLight
} from 'three';
import { GeometryParser } from './GeometryParser';
import { AnimationParser } from './AnimationParser';
import { generateTransform, getEulerOrder } from './UtilityFunctions';

export class FBXTreeParser {
  constructor(
    public textureLoader,
    public manager: LoadingManager,
    public fbxTree,
    public connections,
    public sceneGraph
  ) {}

  parse(fbxTree) {
    this.connections = this.parseConnections();

    const images = this.parseImages();
    const textures = this.parseTextures(images);
    const materials = this.parseMaterials(textures);
    const deformers = this.parseDeformers();
    const geometryMap = new GeometryParser(fbxTree, this.connections).parse(deformers);

    this.parseScene(deformers, geometryMap, materials);

    return this.sceneGraph;
  }

  // Parses FBXTree.Connections which holds parent-child connections between objects (e.g. material -> texture, model->geometry )
  // and details the connection type
  parseConnections() {
    const connectionMap = new Map();

    if ('Connections' in this.fbxTree) {
      const rawConnections = this.fbxTree.Connections.connections;

      rawConnections.forEach(function(rawConnection) {
        const fromID = rawConnection[0];
        const toID = rawConnection[1];
        const relationship = rawConnection[2];

        if (!connectionMap.has(fromID)) {
          connectionMap.set(fromID, {
            parents: [],
            children: []
          });
        }

        const parentRelationship = { ID: toID, relationship: relationship };
        connectionMap.get(fromID).parents.push(parentRelationship);

        if (!connectionMap.has(toID)) {
          connectionMap.set(toID, {
            parents: [],
            children: []
          });
        }

        var childRelationship = { ID: fromID, relationship: relationship };
        connectionMap.get(toID).children.push(childRelationship);
      });
    }

    return connectionMap;
  }

  // Parse FBXTree.Objects.Video for embedded image data
  // These images are connected to textures in FBXTree.Objects.Textures
  // via FBXTree.Connections.
  parseImages() {
    const images = {};
    const blobs = {};

    if ('Video' in this.fbxTree.Objects) {
      const videoNodes = this.fbxTree.Objects.Video;

      for (let nodeID in videoNodes) {
        const videoNode = videoNodes[nodeID];

        const id = parseInt(nodeID);

        images[id] = videoNode.RelativeFilename || videoNode.Filename;

        // raw image data is in videoNode.Content
        if ('Content' in videoNode) {
          const arrayBufferContent = videoNode.Content instanceof ArrayBuffer && videoNode.Content.byteLength > 0;
          const base64Content = typeof videoNode.Content === 'string' && videoNode.Content !== '';

          if (arrayBufferContent || base64Content) {
            const image = this.parseImage(videoNodes[nodeID]);

            blobs[videoNode.RelativeFilename || videoNode.Filename] = image;
          }
        }
      }
    }

    for (let id in images) {
      const filename = images[id];

      if (blobs[filename] !== undefined) images[id] = blobs[filename];
      else images[id] = images[id].split('\\').pop();
    }

    return images;
  }

  // Parse embedded image data in FBXTree.Video.Content
  parseImage(videoNode) {
    const content = videoNode.Content;
    const fileName = videoNode.RelativeFilename || videoNode.Filename;
    const extension = fileName.slice(fileName.lastIndexOf('.') + 1).toLowerCase();

    let type: string;

    switch (extension) {
      case 'bmp':
        type = 'image/bmp';
        break;

      case 'jpg':
      case 'jpeg':
        type = 'image/jpeg';
        break;

      case 'png':
        type = 'image/png';
        break;

      case 'tif':
        type = 'image/tiff';
        break;

      case 'tga':
        if (this.manager.getHandler('.tga') === null) {
          console.warn('FBXLoader: TGA loader not found, skipping ', fileName);
        }

        type = 'image/tga';
        break;

      default:
        console.warn('FBXLoader: Image type "' + extension + '" is not supported.');
        return;
    }

    if (typeof content === 'string') {
      // ASCII format

      return 'data:' + type + ';base64,' + content;
    } else {
      // Binary Format

      const array = new Uint8Array(content);
      return window.URL.createObjectURL(new Blob([array], { type: type }));
    }
  }

  // Parse nodes in FBXTree.Objects.Texture
  // These contain details such as UV scaling, cropping, rotation etc and are connected
  // to images in FBXTree.Objects.Video
  parseTextures(images) {
    const textureMap = new Map();

    if ('Texture' in this.fbxTree.Objects) {
      const textureNodes = this.fbxTree.Objects.Texture;
      for (let nodeID in textureNodes) {
        const texture = this.parseTexture(textureNodes[nodeID], images);
        textureMap.set(parseInt(nodeID), texture);
      }
    }

    return textureMap;
  }

  // Parse individual node in FBXTree.Objects.Texture
  parseTexture(textureNode, images) {
    const texture = this.loadTexture(textureNode, images);
    // @ts-ignore
    texture.ID = textureNode.id;

    texture.name = textureNode.attrName;

    const wrapModeU = textureNode.WrapModeU;
    const wrapModeV = textureNode.WrapModeV;

    const valueU = wrapModeU !== undefined ? wrapModeU.value : 0;
    const valueV = wrapModeV !== undefined ? wrapModeV.value : 0;

    // http://download.autodesk.com/us/fbx/SDKdocs/FBX_SDK_Help/files/fbxsdkref/class_k_fbx_texture.html#889640e63e2e681259ea81061b85143a
    // 0: repeat(default), 1: clamp

    texture.wrapS = valueU === 0 ? RepeatWrapping : ClampToEdgeWrapping;
    texture.wrapT = valueV === 0 ? RepeatWrapping : ClampToEdgeWrapping;

    if ('Scaling' in textureNode) {
      const values = textureNode.Scaling.value;

      texture.repeat.x = values[0];
      texture.repeat.y = values[1];
    }

    return texture;
  }

  // load a texture specified as a blob or data URI, or via an external URL using THREE.TextureLoader
  loadTexture(textureNode, images) {
    let fileName: string | undefined = undefined;

    const currentPath = this.textureLoader.path;

    const children = this.connections.get(textureNode.id).children;

    if (children !== undefined && children.length > 0 && images[children[0].ID] !== undefined) {
      fileName = images[children[0].ID] as string;

      if (fileName.indexOf('blob:') === 0 || fileName.indexOf('data:') === 0) {
        this.textureLoader.setPath(undefined);
      }
    }
    if (fileName === undefined) {
      console.warn(
        'FBXLoader: Could not load undefined, creating placeholder texture for',
        textureNode.RelativeFilename
      );
      return new Texture();
    }

    let texture: Texture;

    const extension: string = textureNode.FileName.slice(-3).toLowerCase();

    if (extension === 'tga') {
      const loader = this.manager.getHandler('.tga');

      if (loader === null) {
        console.warn('FBXLoader: TGA loader not found, creating placeholder texture for', textureNode.RelativeFilename);
        texture = new Texture();
      } else {
        // @ts-ignore
        texture = loader.load(fileName);
      }
    } else if (extension === 'psd') {
      console.warn(
        'FBXLoader: PSD textures are not supported, creating placeholder texture for',
        textureNode.RelativeFilename
      );
      texture = new Texture();
    } else {
      texture = this.textureLoader.load(fileName);
    }

    this.textureLoader.setPath(currentPath);

    return texture;
  }

  // Parse nodes in FBXTree.Objects.Material
  parseMaterials(textureMap) {
    const materialMap = new Map();

    if ('Material' in this.fbxTree.Objects) {
      const materialNodes = this.fbxTree.Objects.Material;

      for (let nodeID in materialNodes) {
        const material = this.parseMaterial(materialNodes[nodeID], textureMap);

        if (material !== null) materialMap.set(parseInt(nodeID), material);
      }
    }

    return materialMap;
  }

  // Parse single node in FBXTree.Objects.Material
  // Materials are connected to texture maps in FBXTree.Objects.Textures
  // FBX format currently only supports Lambert and Phong shading models
  parseMaterial(materialNode, textureMap) {
    var ID = materialNode.id;
    var name = materialNode.attrName;
    var type = materialNode.ShadingModel;

    // Case where FBX wraps shading model in property object.
    if (typeof type === 'object') {
      type = type.value;
    }

    // Ignore unused materials which don't have any connections.
    if (!this.connections.has(ID)) return null;

    var parameters = this.parseParameters(materialNode, textureMap, ID);

    let material: Material;

    switch (type.toLowerCase()) {
      case 'phong':
        material = new MeshPhongMaterial();
        break;
      case 'lambert':
        material = new MeshLambertMaterial();
        break;
      default:
        console.warn('THREE.FBXLoader: unknown material type "%s". Defaulting to MeshPhongMaterial.', type);
        material = new MeshPhongMaterial();
        break;
    }

    material.setValues(parameters);
    material.name = name;

    return material;
  }

  // Parse FBX material and return parameters suitable for a three.js material
  // Also parse the texture map and return any textures associated with the material
  parseParameters(materialNode, textureMap, ID) {
    const parameters: any = {};

    if (materialNode.BumpFactor) {
      parameters.bumpScale = materialNode.BumpFactor.value;
    }
    if (materialNode.Diffuse) {
      parameters.color = new Color().fromArray(materialNode.Diffuse.value);
    } else if (materialNode.DiffuseColor && materialNode.DiffuseColor.type === 'Color') {
      // The blender exporter exports diffuse here instead of in materialNode.Diffuse
      parameters.color = new Color().fromArray(materialNode.DiffuseColor.value);
    }

    if (materialNode.DisplacementFactor) {
      parameters.displacementScale = materialNode.DisplacementFactor.value;
    }

    if (materialNode.Emissive) {
      parameters.emissive = new Color().fromArray(materialNode.Emissive.value);
    } else if (materialNode.EmissiveColor && materialNode.EmissiveColor.type === 'Color') {
      // The blender exporter exports emissive color here instead of in materialNode.Emissive
      parameters.emissive = new Color().fromArray(materialNode.EmissiveColor.value);
    }

    if (materialNode.EmissiveFactor) {
      parameters.emissiveIntensity = parseFloat(materialNode.EmissiveFactor.value);
    }

    if (materialNode.Opacity) {
      parameters.opacity = parseFloat(materialNode.Opacity.value);
    }

    if (parameters.opacity < 1.0) {
      parameters.transparent = true;
    }

    if (materialNode.ReflectionFactor) {
      parameters.reflectivity = materialNode.ReflectionFactor.value;
    }

    if (materialNode.Shininess) {
      parameters.shininess = materialNode.Shininess.value;
    }

    if (materialNode.Specular) {
      parameters.specular = new Color().fromArray(materialNode.Specular.value);
    } else if (materialNode.SpecularColor && materialNode.SpecularColor.type === 'Color') {
      // The blender exporter exports specular color here instead of in materialNode.Specular
      parameters.specular = new Color().fromArray(materialNode.SpecularColor.value);
    }

    this.connections.get(ID).children.forEach(child => {
      const type = child.relationship;

      switch (type) {
        case 'Bump':
          parameters.bumpMap = this.getTexture(textureMap, child.ID);
          break;

        case 'Maya|TEX_ao_map':
          parameters.aoMap = this.getTexture(textureMap, child.ID);
          break;

        case 'DiffuseColor':
        case 'Maya|TEX_color_map':
          parameters.map = this.getTexture(textureMap, child.ID);
          parameters.map.encoding = sRGBEncoding;
          break;

        case 'DisplacementColor':
          parameters.displacementMap = this.getTexture(textureMap, child.ID);
          break;

        case 'EmissiveColor':
          parameters.emissiveMap = this.getTexture(textureMap, child.ID);
          parameters.emissiveMap.encoding = sRGBEncoding;
          break;

        case 'NormalMap':
        case 'Maya|TEX_normal_map':
          parameters.normalMap = this.getTexture(textureMap, child.ID);
          break;

        case 'ReflectionColor':
          parameters.envMap = this.getTexture(textureMap, child.ID);
          parameters.envMap.mapping = EquirectangularReflectionMapping;
          parameters.envMap.encoding = sRGBEncoding;
          break;

        case 'SpecularColor':
          parameters.specularMap = this.getTexture(textureMap, child.ID);
          parameters.specularMap.encoding = sRGBEncoding;
          break;

        case 'TransparentColor':
          parameters.alphaMap = this.getTexture(textureMap, child.ID);
          parameters.transparent = true;
          break;

        case 'AmbientColor':
        case 'ShininessExponent': // AKA glossiness map
        case 'SpecularFactor': // AKA specularLevel
        case 'VectorDisplacementColor': // NOTE: Seems to be a copy of DisplacementColor
        default:
          console.warn('THREE.FBXLoader: %s map is not supported in three.js, skipping texture.', type);
          break;
      }
    });

    return parameters;
  }

  // get a texture from the textureMap for use by a material.
  getTexture(textureMap, id) {
    // if the texture is a layered texture, just use the first layer and issue a warning
    if ('LayeredTexture' in this.fbxTree.Objects && id in this.fbxTree.Objects.LayeredTexture) {
      console.warn('THREE.FBXLoader: layered textures are not supported in three.js. Discarding all but first layer.');
      id = this.connections.get(id).children[0].ID;
    }

    return textureMap.get(id);
  }

  // Parse nodes in FBXTree.Objects.Deformer
  // Deformer node can contain skinning or Vertex Cache animation data, however only skinning is supported here
  // Generates map of Skeleton-like objects for use later when generating and binding skeletons.
  parseDeformers() {
    const skeletons = {};
    const morphTargets = {};

    if ('Deformer' in this.fbxTree.Objects) {
      const DeformerNodes = this.fbxTree.Objects.Deformer;

      for (let nodeID in DeformerNodes) {
        const deformerNode = DeformerNodes[nodeID];

        const relationships = this.connections.get(parseInt(nodeID));

        if (deformerNode.attrType === 'Skin') {
          const skeleton = this.parseSkeleton(relationships, DeformerNodes);
          // @ts-ignore
          skeleton.ID = nodeID;

          if (relationships.parents.length > 1)
            console.warn('THREE.FBXLoader: skeleton attached to more than one geometry is not supported.');
          // @ts-ignore
          skeleton.geometryID = relationships.parents[0].ID;

          skeletons[nodeID] = skeleton;
        } else if (deformerNode.attrType === 'BlendShape') {
          const morphTarget = {
            id: nodeID,
            rawTargets: this.parseMorphTargets(relationships, DeformerNodes)
          };

          if (relationships.parents.length > 1)
            console.warn('THREE.FBXLoader: morph target attached to more than one geometry is not supported.');

          morphTargets[nodeID] = morphTarget;
        }
      }
    }

    return {
      skeletons: skeletons,
      morphTargets: morphTargets
    };
  }

  // Parse single nodes in FBXTree.Objects.Deformer
  // The top level skeleton node has type 'Skin' and sub nodes have type 'Cluster'
  // Each skin node represents a skeleton and each cluster node represents a bone
  parseSkeleton(relationships, deformerNodes) {
    const rawBones: any[] = [];

    relationships.children.forEach(function(child) {
      var boneNode = deformerNodes[child.ID];

      if (boneNode.attrType !== 'Cluster') return;

      const rawBone = {
        ID: child.ID,
        indices: [],
        weights: [],
        transformLink: new Matrix4().fromArray(boneNode.TransformLink.a)
        // transform: new THREE.Matrix4().fromArray( boneNode.Transform.a ),
        // linkMode: boneNode.Mode,
      };

      if ('Indexes' in boneNode) {
        rawBone.indices = boneNode.Indexes.a;
        rawBone.weights = boneNode.Weights.a;
      }

      rawBones.push(rawBone);
    });

    return {
      rawBones: rawBones,
      bones: []
    };
  }

  // The top level morph deformer node has type "BlendShape" and sub nodes have type "BlendShapeChannel"
  parseMorphTargets(relationships, deformerNodes) {
    const rawMorphTargets: any[] = [];

    for (let i = 0; i < relationships.children.length; i++) {
      const child = relationships.children[i];

      const morphTargetNode = deformerNodes[child.ID];

      if (morphTargetNode.attrType !== 'BlendShapeChannel') return;

      const rawMorphTarget = {
        name: morphTargetNode.attrName,
        initialWeight: morphTargetNode.DeformPercent,
        id: morphTargetNode.id,
        fullWeights: morphTargetNode.FullWeights.a,
        geoID: this.connections.get(parseInt(child.ID)).children.filter(function(child) {
          return child.relationship === undefined;
        })[0].ID
      };

      rawMorphTargets.push(rawMorphTarget);
    }

    return rawMorphTargets;
  }

  // create the main THREE.Group() to be returned by the loader
  parseScene(deformers, geometryMap, materialMap) {
    this.sceneGraph = new Group();

    const modelMap = this.parseModels(deformers.skeletons, geometryMap, materialMap);

    const modelNodes = this.fbxTree.Objects.Model;

    modelMap.forEach(model => {
      const modelNode = modelNodes[model.ID];
      this.setLookAtProperties(model, modelNode);

      const parentConnections = this.connections.get(model.ID).parents;

      parentConnections.forEach(function(connection) {
        const parent = modelMap.get(connection.ID);
        if (parent !== undefined) parent.add(model);
      });

      if (model.parent === null) {
        this.sceneGraph.add(model);
      }
    });

    this.bindSkeleton(deformers.skeletons, geometryMap, modelMap);

    this.createAmbientLight();

    this.setupMorphMaterials();

    this.sceneGraph.traverse(function(node) {
      if (node.userData.transformData) {
        if (node.parent) node.userData.transformData.parentMatrixWorld = node.parent.matrix;

        const transform = generateTransform(node.userData.transformData);

        node.applyMatrix(transform);
      }
    });

    const animations = new AnimationParser(this.fbxTree, this.connections, this.sceneGraph).parse();

    // if all the models where already combined in a single group, just return that
    if (this.sceneGraph.children.length === 1 && this.sceneGraph.children[0].isGroup) {
      this.sceneGraph.children[0].animations = animations;
      this.sceneGraph = this.sceneGraph.children[0];
    }

    this.sceneGraph.animations = animations;
  }

  // parse nodes in FBXTree.Objects.Model
  parseModels(skeletons, geometryMap, materialMap) {
    const modelMap = new Map();
    const modelNodes = this.fbxTree.Objects.Model;

    for (let nodeID in modelNodes) {
      const id = parseInt(nodeID);
      const node = modelNodes[nodeID];
      const relationships = this.connections.get(id);

      let model: null | Group | Bone | Line = this.buildSkeleton(relationships, skeletons, id, node.attrName);

      if (!model) {
        switch (node.attrType) {
          case 'Camera':
            model = this.createCamera(relationships);
            break;
          case 'Light':
            model = this.createLight(relationships);
            break;
          case 'Mesh':
            model = this.createMesh(relationships, geometryMap, materialMap);
            break;
          case 'NurbsCurve':
            model = this.createCurve(relationships, geometryMap);
            break;
          case 'LimbNode':
          case 'Root':
            model = new Bone();
            break;
          case 'Null':
          default:
            model = new Group();
            break;
        }
        // @ts-ignore
        model.name = node.attrName ? PropertyBinding.sanitizeNodeName(node.attrName) : '';
        // @ts-ignore
        model.ID = id;
      }

      this.getTransformData(model, node);
      modelMap.set(id, model);
    }

    return modelMap;
  }

  buildSkeleton(relationships, skeletons, id, name): null | Bone {
    let bone: null | Bone = null;

    relationships.parents.forEach(parent => {
      for (let ID in skeletons) {
        const skeleton = skeletons[ID];

        skeleton.rawBones.forEach((rawBone, i) => {
          if (rawBone.ID === parent.ID) {
            const subBone = bone;
            bone = new Bone();

            bone.matrixWorld.copy(rawBone.transformLink);

            // set name and id here - otherwise in cases where "subBone" is created it will not have a name / id
            // @ts-ignore
            bone.name = name ? PropertyBinding.sanitizeNodeName(name) : '';

            // @ts-ignore
            bone.ID = id;

            skeleton.bones[i] = bone;

            // In cases where a bone is shared between multiple meshes
            // duplicate the bone here and and it as a child of the first bone
            if (subBone !== null) {
              bone.add(subBone);
            }
          }
        });
      }
    });

    return bone;
  }

  // create a THREE.PerspectiveCamera or THREE.OrthographicCamera
  createCamera(relationships) {
    let model;
    let cameraAttribute;

    relationships.children.forEach(child => {
      const attr = this.fbxTree.Objects.NodeAttribute[child.ID];

      if (attr !== undefined) {
        cameraAttribute = attr;
      }
    });

    if (cameraAttribute === undefined) {
      model = new Object3D();
    } else {
      let type = 0;
      if (cameraAttribute.CameraProjectionType !== undefined && cameraAttribute.CameraProjectionType.value === 1) {
        type = 1;
      }

      let nearClippingPlane = 1;
      if (cameraAttribute.NearPlane !== undefined) {
        nearClippingPlane = cameraAttribute.NearPlane.value / 1000;
      }

      let farClippingPlane = 1000;
      if (cameraAttribute.FarPlane !== undefined) {
        farClippingPlane = cameraAttribute.FarPlane.value / 1000;
      }

      let width = window.innerWidth;
      let height = window.innerHeight;

      if (cameraAttribute.AspectWidth !== undefined && cameraAttribute.AspectHeight !== undefined) {
        width = cameraAttribute.AspectWidth.value;
        height = cameraAttribute.AspectHeight.value;
      }

      const aspect = width / height;

      let fov = 45;
      if (cameraAttribute.FieldOfView !== undefined) {
        fov = cameraAttribute.FieldOfView.value;
      }

      const focalLength = cameraAttribute.FocalLength ? cameraAttribute.FocalLength.value : null;

      switch (type) {
        case 0: // Perspective
          model = new PerspectiveCamera(fov, aspect, nearClippingPlane, farClippingPlane);
          if (focalLength !== null) model.setFocalLength(focalLength);
          break;

        case 1: // Orthographic
          model = new OrthographicCamera(
            -width / 2,
            width / 2,
            height / 2,
            -height / 2,
            nearClippingPlane,
            farClippingPlane
          );
          break;

        default:
          console.warn('THREE.FBXLoader: Unknown camera type ' + type + '.');
          model = new Object3D();
          break;
      }
    }

    return model;
  }

  // Create a THREE.DirectionalLight, THREE.PointLight or THREE.SpotLight
  createLight(relationships) {
    let model;
    let lightAttribute;

    relationships.children.forEach(child => {
      const attr = this.fbxTree.Objects.NodeAttribute[child.ID];

      if (attr !== undefined) {
        lightAttribute = attr;
      }
    });

    if (lightAttribute === undefined) {
      model = new Object3D();
    } else {
      let type;

      // LightType can be undefined for Point lights
      if (lightAttribute.LightType === undefined) {
        type = 0;
      } else {
        type = lightAttribute.LightType.value;
      }

      let color: Color | number = 0xffffff;

      if (lightAttribute.Color !== undefined) {
        color = new Color().fromArray(lightAttribute.Color.value);
      }

      let intensity = lightAttribute.Intensity === undefined ? 1 : lightAttribute.Intensity.value / 100;

      // light disabled
      if (lightAttribute.CastLightOnObject !== undefined && lightAttribute.CastLightOnObject.value === 0) {
        intensity = 0;
      }

      let distance = 0;
      if (lightAttribute.FarAttenuationEnd !== undefined) {
        if (lightAttribute.EnableFarAttenuation !== undefined && lightAttribute.EnableFarAttenuation.value === 0) {
          distance = 0;
        } else {
          distance = lightAttribute.FarAttenuationEnd.value;
        }
      }

      // TODO: could this be calculated linearly from FarAttenuationStart to FarAttenuationEnd?
      let decay = 1;

      switch (type) {
        case 0: // Point
          model = new PointLight(color, intensity, distance, decay);
          break;

        case 1: // Directional
          model = new DirectionalLight(color, intensity);
          break;

        case 2: // Spot
          let angle = Math.PI / 3;

          if (lightAttribute.InnerAngle !== undefined) {
            angle = MATH.degToRad(lightAttribute.InnerAngle.value);
          }

          let penumbra = 0;
          if (lightAttribute.OuterAngle !== undefined) {
            // TODO: this is not correct - FBX calculates outer and inner angle in degrees
            // with OuterAngle > InnerAngle && OuterAngle <= Math.PI
            // while three.js uses a penumbra between (0, 1) to attenuate the inner angle
            penumbra = MATH.degToRad(lightAttribute.OuterAngle.value);
            penumbra = Math.max(penumbra, 1);
          }

          model = new SpotLight(color, intensity, distance, angle, penumbra, decay);
          break;

        default:
          console.warn(
            'THREE.FBXLoader: Unknown light type ' +
              lightAttribute.LightType.value +
              ', defaulting to a THREE.PointLight.'
          );
          model = new PointLight(color, intensity);
          break;
      }

      if (lightAttribute.CastShadows !== undefined && lightAttribute.CastShadows.value === 1) {
        model.castShadow = true;
      }
    }

    return model;
  }

  createMesh(relationships, geometryMap, materialMap) {
    let model: any;
    let geometry: any = null;
    let material: any = null;
    let materials: any[] = [];

    // get geometry and materials(s) from connections
    relationships.children.forEach(function(child) {
      if (geometryMap.has(child.ID)) {
        geometry = geometryMap.get(child.ID);
      }

      if (materialMap.has(child.ID)) {
        materials.push(materialMap.get(child.ID));
      }
    });

    if (materials.length > 1) {
      material = materials;
    } else if (materials.length > 0) {
      material = materials[0];
    } else {
      material = new MeshPhongMaterial({ color: 0xcccccc });
      materials.push(material);
    }

    if ('color' in geometry.attributes) {
      materials.forEach(function(material) {
        material.vertexColors = VertexColors;
      });
    }

    if (geometry.FBX_Deformer) {
      materials.forEach(function(material) {
        material.skinning = true;
      });

      model = new SkinnedMesh(geometry, material);
      model.normalizeSkinWeights();
    } else {
      model = new Mesh(geometry, material);
    }

    return model;
  }

  createCurve(relationships, geometryMap) {
    var geometry = relationships.children.reduce(function(geo, child) {
      if (geometryMap.has(child.ID)) geo = geometryMap.get(child.ID);

      return geo;
    }, null);

    // FBX does not list materials for Nurbs lines, so we'll just put our own in here.
    const material = new LineBasicMaterial({ color: 0x3300ff, linewidth: 1 });
    return new Line(geometry, material);
  }

  // parse the model node for transform data
  getTransformData(model, modelNode) {
    let transformData: any = {};

    if ('InheritType' in modelNode) transformData.inheritType = parseInt(modelNode.InheritType.value);

    if ('RotationOrder' in modelNode) transformData.eulerOrder = getEulerOrder(modelNode.RotationOrder.value);
    else transformData.eulerOrder = 'ZYX';

    if ('Lcl_Translation' in modelNode) transformData.translation = modelNode.Lcl_Translation.value;

    if ('PreRotation' in modelNode) transformData.preRotation = modelNode.PreRotation.value;
    if ('Lcl_Rotation' in modelNode) transformData.rotation = modelNode.Lcl_Rotation.value;
    if ('PostRotation' in modelNode) transformData.postRotation = modelNode.PostRotation.value;

    if ('Lcl_Scaling' in modelNode) transformData.scale = modelNode.Lcl_Scaling.value;

    if ('ScalingOffset' in modelNode) transformData.scalingOffset = modelNode.ScalingOffset.value;
    if ('ScalingPivot' in modelNode) transformData.scalingPivot = modelNode.ScalingPivot.value;

    if ('RotationOffset' in modelNode) transformData.rotationOffset = modelNode.RotationOffset.value;
    if ('RotationPivot' in modelNode) transformData.rotationPivot = modelNode.RotationPivot.value;

    model.userData.transformData = transformData;
  }

  setLookAtProperties(model, modelNode) {
    if ('LookAtProperty' in modelNode) {
      const children = this.connections.get(model.ID).children;

      children.forEach(child => {
        if (child.relationship === 'LookAtProperty') {
          const lookAtTarget = this.fbxTree.Objects.Model[child.ID];

          if ('Lcl_Translation' in lookAtTarget) {
            const pos = lookAtTarget.Lcl_Translation.value;

            // DirectionalLight, SpotLight
            if (model.target !== undefined) {
              model.target.position.fromArray(pos);
              this.sceneGraph.add(model.target);
            } else {
              // Cameras and other Object3Ds

              model.lookAt(new Vector3().fromArray(pos));
            }
          }
        }
      });
    }
  }

  bindSkeleton(skeletons, geometryMap, modelMap) {
    const bindMatrices = this.parsePoseNodes();

    for (var ID in skeletons) {
      const skeleton = skeletons[ID];

      const parents = this.connections.get(parseInt(skeleton.ID)).parents;

      parents.forEach(parent => {
        if (geometryMap.has(parent.ID)) {
          const geoID = parent.ID;
          const geoRelationships = this.connections.get(geoID);

          geoRelationships.parents.forEach(function(geoConnParent) {
            if (modelMap.has(geoConnParent.ID)) {
              const model = modelMap.get(geoConnParent.ID);

              model.bind(new Skeleton(skeleton.bones), bindMatrices[geoConnParent.ID]);
            }
          });
        }
      });
    }
  }

  parsePoseNodes() {
    const bindMatrices: any = {};

    if ('Pose' in this.fbxTree.Objects) {
      const BindPoseNode = this.fbxTree.Objects.Pose;

      for (let nodeID in BindPoseNode) {
        if (BindPoseNode[nodeID].attrType === 'BindPose') {
          const poseNodes = BindPoseNode[nodeID].PoseNode;

          if (Array.isArray(poseNodes)) {
            poseNodes.forEach(function(poseNode) {
              bindMatrices[poseNode.Node] = new Matrix4().fromArray(poseNode.Matrix.a);
            });
          } else {
            bindMatrices[poseNodes.Node] = new Matrix4().fromArray(poseNodes.Matrix.a);
          }
        }
      }
    }

    return bindMatrices;
  }

  // Parse ambient color in FBXTree.GlobalSettings - if it's not set to black (default), create an ambient light
  createAmbientLight() {
    if ('GlobalSettings' in this.fbxTree && 'AmbientColor' in this.fbxTree.GlobalSettings) {
      var ambientColor = this.fbxTree.GlobalSettings.AmbientColor.value;
      var r = ambientColor[0];
      var g = ambientColor[1];
      var b = ambientColor[2];

      if (r !== 0 || g !== 0 || b !== 0) {
        var color = new Color(r, g, b);
        this.sceneGraph.add(new AmbientLight(color, 1));
      }
    }
  }

  setupMorphMaterials() {
    this.sceneGraph.traverse(child => {
      if (child.isMesh) {
        if (child.geometry.morphAttributes.position && child.geometry.morphAttributes.position.length) {
          if (Array.isArray(child.material)) {
            child.material.forEach((material, i) => {
              this.setupMorphMaterial(child, material, i);
            });
          } else {
            this.setupMorphMaterial(child, child.material);
          }
        }
      }
    });
  }

  setupMorphMaterial(child, material, index?) {
    const uuid = child.uuid;
    const matUuid = material.uuid;

    // if a geometry has morph targets, it cannot share the material with other geometries
    let sharedMat: boolean = false;

    this.sceneGraph.traverse(node => {
      if (node.isMesh) {
        if (Array.isArray(node.material)) {
          node.material.forEach(mat => {
            if (mat.uuid === matUuid && node.uuid !== uuid) sharedMat = true;
          });
        } else if (node.material.uuid === matUuid && node.uuid !== uuid) sharedMat = true;
      }
    });
    // @ts-ignore
    if (sharedMat === true) {
      var clonedMat = material.clone();
      clonedMat.morphTargets = true;

      if (index === undefined) child.material = clonedMat;
      else child.material[index] = clonedMat;
    } else material.morphTargets = true;
  }
}
