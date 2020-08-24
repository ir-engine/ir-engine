import {
  Math as MATH,
  PropertyBinding,
  Matrix4,
  AnimationClip,
  Vector3,
  Quaternion,
  Euler,
  VectorKeyframeTrack,
  QuaternionKeyframeTrack,
  NumberKeyframeTrack
} from 'three';
import { convertFBXTimeToSeconds, inject } from './UtilityFunctions';

export class AnimationParser {
  constructor(public fbxTree, public connections, public sceneGraph) {}
  // take raw animation clips and turn them into three.js animation clips
  parse() {
    const animationClips: any[] = [];

    const rawClips = this.parseClips();

    if (rawClips !== undefined) {
      for (var key in rawClips) {
        const rawClip = rawClips[key];

        const clip = this.addClip(rawClip);

        animationClips.push(clip);
      }
    }

    return animationClips;
  }

  parseClips() {
    // since the actual transformation data is stored in FBXTree.Objects.AnimationCurve,
    // if this is undefined we can safely assume there are no animations
    if (this.fbxTree.Objects.AnimationCurve === undefined) return undefined;

    const curveNodesMap = this.parseAnimationCurveNodes();

    this.parseAnimationCurves(curveNodesMap);

    const layersMap = this.parseAnimationLayers(curveNodesMap);
    const rawClips = this.parseAnimStacks(layersMap);

    return rawClips;
  }

  // parse nodes in FBXTree.Objects.AnimationCurveNode
  // each AnimationCurveNode holds data for an animation transform for a model (e.g. left arm rotation )
  // and is referenced by an AnimationLayer
  parseAnimationCurveNodes() {
    const rawCurveNodes = this.fbxTree.Objects.AnimationCurveNode;

    const curveNodesMap = new Map();

    for (let nodeID in rawCurveNodes) {
      const rawCurveNode = rawCurveNodes[nodeID];

      if (rawCurveNode.attrName.match(/S|R|T|DeformPercent/) !== null) {
        const curveNode = {
          id: rawCurveNode.id,
          attr: rawCurveNode.attrName,
          curves: {}
        };

        curveNodesMap.set(curveNode.id, curveNode);
      }
    }

    return curveNodesMap;
  }

  // parse nodes in FBXTree.Objects.AnimationCurve and connect them up to
  // previously parsed AnimationCurveNodes. Each AnimationCurve holds data for a single animated
  // axis ( e.g. times and values of x rotation)
  parseAnimationCurves(curveNodesMap) {
    const rawCurves = this.fbxTree.Objects.AnimationCurve;

    // TODO: Many values are identical up to roundoff error, but won't be optimised
    // e.g. position times: [0, 0.4, 0. 8]
    // position values: [7.23538335023477e-7, 93.67518615722656, -0.9982695579528809, 7.23538335023477e-7, 93.67518615722656, -0.9982695579528809, 7.235384487103147e-7, 93.67520904541016, -0.9982695579528809]
    // clearly, this should be optimised to
    // times: [0], positions [7.23538335023477e-7, 93.67518615722656, -0.9982695579528809]
    // this shows up in nearly every FBX file, and generally time array is length > 100

    for (let nodeID in rawCurves) {
      const animationCurve = {
        id: rawCurves[nodeID].id,
        times: rawCurves[nodeID].KeyTime.a.map(convertFBXTimeToSeconds),
        values: rawCurves[nodeID].KeyValueFloat.a
      };

      const relationships = this.connections.get(animationCurve.id);

      if (relationships !== undefined) {
        const animationCurveID = relationships.parents[0].ID;
        const animationCurveRelationship = relationships.parents[0].relationship;

        if (animationCurveRelationship.match(/X/)) {
          curveNodesMap.get(animationCurveID).curves['x'] = animationCurve;
        } else if (animationCurveRelationship.match(/Y/)) {
          curveNodesMap.get(animationCurveID).curves['y'] = animationCurve;
        } else if (animationCurveRelationship.match(/Z/)) {
          curveNodesMap.get(animationCurveID).curves['z'] = animationCurve;
        } else if (animationCurveRelationship.match(/d|DeformPercent/) && curveNodesMap.has(animationCurveID)) {
          curveNodesMap.get(animationCurveID).curves['morph'] = animationCurve;
        }
      }
    }
  }

  // parse nodes in FBXTree.Objects.AnimationLayer. Each layers holds references
  // to various AnimationCurveNodes and is referenced by an AnimationStack node
  // note: theoretically a stack can have multiple layers, however in practice there always seems to be one per stack
  parseAnimationLayers(curveNodesMap) {
    const rawLayers = this.fbxTree.Objects.AnimationLayer;

    const layersMap = new Map();

    for (let nodeID in rawLayers) {
      const layerCurveNodes: any[] = [];

      const connection = this.connections.get(parseInt(nodeID));

      if (connection !== undefined) {
        // all the animationCurveNodes used in the layer
        const children = connection.children;

        children.forEach((child, i) => {
          if (curveNodesMap.has(child.ID)) {
            const curveNode = curveNodesMap.get(child.ID);

            // check that the curves are defined for at least one axis, otherwise ignore the curveNode
            if (
              curveNode.curves.x !== undefined ||
              curveNode.curves.y !== undefined ||
              curveNode.curves.z !== undefined
            ) {
              if (layerCurveNodes[i] === undefined) {
                const modelID = this.connections.get(child.ID).parents.filter(parent => {
                  return parent.relationship !== undefined;
                })[0].ID;

                if (modelID !== undefined) {
                  const rawModel = this.fbxTree.Objects.Model[modelID.toString()];

                  const node: any = {
                    // @ts-ignore
                    modelName: rawModel.attrName ? PropertyBinding.sanitizeNodeName(rawModel.attrName) : '',
                    ID: rawModel.id,
                    initialPosition: [0, 0, 0],
                    initialRotation: [0, 0, 0],
                    initialScale: [1, 1, 1]
                  };

                  this.sceneGraph.traverse(function(child) {
                    if (child.ID === rawModel.id) {
                      node.transform = child.matrix;

                      if (child.userData.transformData) node.eulerOrder = child.userData.transformData.eulerOrder;
                    }
                  });

                  if (!node.transform) node.transform = new Matrix4();

                  // if the animated model is pre rotated, we'll have to apply the pre rotations to every
                  // animation value as well
                  if ('PreRotation' in rawModel) node.preRotation = rawModel.PreRotation.value;
                  if ('PostRotation' in rawModel) node.postRotation = rawModel.PostRotation.value;

                  layerCurveNodes[i] = node;
                }
              }

              if (layerCurveNodes[i]) layerCurveNodes[i][curveNode.attr] = curveNode;
            } else if (curveNode.curves.morph !== undefined) {
              if (layerCurveNodes[i] === undefined) {
                const deformerID = this.connections.get(child.ID).parents.filter(function(parent) {
                  return parent.relationship !== undefined;
                })[0].ID;

                const morpherID = this.connections.get(deformerID).parents[0].ID;
                const geoID = this.connections.get(morpherID).parents[0].ID;

                // assuming geometry is not used in more than one model
                const modelID = this.connections.get(geoID).parents[0].ID;

                const rawModel = this.fbxTree.Objects.Model[modelID];

                const node = {
                  // @ts-ignore
                  modelName: rawModel.attrName ? PropertyBinding.sanitizeNodeName(rawModel.attrName) : '',
                  morphName: this.fbxTree.Objects.Deformer[deformerID].attrName
                };

                layerCurveNodes[i] = node;
              }

              layerCurveNodes[i][curveNode.attr] = curveNode;
            }
          }
        });

        layersMap.set(parseInt(nodeID), layerCurveNodes);
      }
    }

    return layersMap;
  }

  // parse nodes in FBXTree.Objects.AnimationStack. These are the top level node in the animation
  // hierarchy. Each Stack node will be used to create a THREE.AnimationClip
  parseAnimStacks(layersMap) {
    const rawStacks = this.fbxTree.Objects.AnimationStack;

    // connect the stacks (clips) up to the layers
    const rawClips = {};

    for (let nodeID in rawStacks) {
      const children = this.connections.get(parseInt(nodeID)).children;

      if (children.length > 1) {
        // it seems like stacks will always be associated with a single layer. But just in case there are files
        // where there are multiple layers per stack, we'll display a warning
        console.warn(
          'THREE.FBXLoader: Encountered an animation stack with multiple layers, this is currently not supported. Ignoring subsequent layers.'
        );
      }

      const layer = layersMap.get(children[0].ID);

      rawClips[nodeID] = {
        name: rawStacks[nodeID].attrName,
        layer: layer
      };
    }

    return rawClips;
  }

  addClip(rawClip) {
    let tracks: any[] = [];

    rawClip.layer.forEach(rawTracks => {
      tracks = tracks.concat(this.generateTracks(rawTracks));
    });

    return new AnimationClip(rawClip.name, -1, tracks);
  }

  generateTracks(rawTracks) {
    const tracks: any[] = [];

    let initialPosition: any = new Vector3();
    let initialRotation: any = new Quaternion();
    let initialScale: any = new Vector3();

    if (rawTracks.transform) rawTracks.transform.decompose(initialPosition, initialRotation, initialScale);

    initialPosition = initialPosition.toArray();
    initialRotation = new Euler().setFromQuaternion(initialRotation, rawTracks.eulerOrder).toArray();
    initialScale = initialScale.toArray();

    if (rawTracks.T !== undefined && Object.keys(rawTracks.T.curves).length > 0) {
      const positionTrack = this.generateVectorTrack(
        rawTracks.modelName,
        rawTracks.T.curves,
        initialPosition,
        'position'
      );
      if (positionTrack !== undefined) tracks.push(positionTrack);
    }

    if (rawTracks.R !== undefined && Object.keys(rawTracks.R.curves).length > 0) {
      const rotationTrack = this.generateRotationTrack(
        rawTracks.modelName,
        rawTracks.R.curves,
        initialRotation,
        rawTracks.preRotation,
        rawTracks.postRotation,
        rawTracks.eulerOrder
      );
      if (rotationTrack !== undefined) tracks.push(rotationTrack);
    }

    if (rawTracks.S !== undefined && Object.keys(rawTracks.S.curves).length > 0) {
      const scaleTrack = this.generateVectorTrack(rawTracks.modelName, rawTracks.S.curves, initialScale, 'scale');
      if (scaleTrack !== undefined) tracks.push(scaleTrack);
    }

    if (rawTracks.DeformPercent !== undefined) {
      const morphTrack = this.generateMorphTrack(rawTracks);
      if (morphTrack !== undefined) tracks.push(morphTrack);
    }

    return tracks;
  }

  generateVectorTrack(modelName, curves, initialValue, type) {
    var times = this.getTimesForAllAxes(curves);
    var values = this.getKeyframeTrackValues(times, curves, initialValue);

    return new VectorKeyframeTrack(modelName + '.' + type, times, values);
  }

  generateRotationTrack(modelName, curves, initialValue, preRotation, postRotation, eulerOrder) {
    if (curves.x !== undefined) {
      this.interpolateRotations(curves.x);
      curves.x.values = curves.x.values.map(MATH.degToRad);
    }
    if (curves.y !== undefined) {
      this.interpolateRotations(curves.y);
      curves.y.values = curves.y.values.map(MATH.degToRad);
    }
    if (curves.z !== undefined) {
      this.interpolateRotations(curves.z);
      curves.z.values = curves.z.values.map(MATH.degToRad);
    }

    const times = this.getTimesForAllAxes(curves);
    const values = this.getKeyframeTrackValues(times, curves, initialValue);

    if (preRotation !== undefined) {
      preRotation = preRotation.map(MATH.degToRad);
      preRotation.push(eulerOrder);

      preRotation = new Euler().fromArray(preRotation);
      preRotation = new Quaternion().setFromEuler(preRotation);
    }

    if (postRotation !== undefined) {
      postRotation = postRotation.map(MATH.degToRad);
      postRotation.push(eulerOrder);

      postRotation = new Euler().fromArray(postRotation);
      postRotation = new Quaternion().setFromEuler(postRotation).inverse();
    }

    const quaternion = new Quaternion();
    const euler = new Euler();

    const quaternionValues = [];

    for (let i = 0; i < values.length; i += 3) {
      euler.set(values[i], values[i + 1], values[i + 2], eulerOrder);

      quaternion.setFromEuler(euler);

      if (preRotation !== undefined) quaternion.premultiply(preRotation);
      if (postRotation !== undefined) quaternion.multiply(postRotation);

      quaternion.toArray(quaternionValues, (i / 3) * 4);
    }

    return new QuaternionKeyframeTrack(modelName + '.quaternion', times, quaternionValues);
  }

  generateMorphTrack(rawTracks) {
    const curves = rawTracks.DeformPercent.curves.morph;
    const values = curves.values.map(function(val) {
      return val / 100;
    });

    var morphNum = this.sceneGraph.getObjectByName(rawTracks.modelName).morphTargetDictionary[rawTracks.morphName];

    return new NumberKeyframeTrack(
      rawTracks.modelName + '.morphTargetInfluences[' + morphNum + ']',
      curves.times,
      values
    );
  }

  // For all animated objects, times are defined separately for each axis
  // Here we'll combine the times into one sorted array without duplicates
  getTimesForAllAxes(curves) {
    let times = [];

    // first join together the times for each axis, if defined
    if (curves.x !== undefined) times = times.concat(curves.x.times);
    if (curves.y !== undefined) times = times.concat(curves.y.times);
    if (curves.z !== undefined) times = times.concat(curves.z.times);

    // then sort them and remove duplicates
    times = times
      .sort(function(a, b) {
        return a - b;
      })
      .filter(function(elem, index, array) {
        return array.indexOf(elem) == index;
      });

    return times;
  }

  getKeyframeTrackValues(times, curves, initialValue) {
    let prevValue = initialValue;

    const values: any[] = [];

    let xIndex = -1;
    let yIndex = -1;
    let zIndex = -1;

    times.forEach(function(time) {
      if (curves.x) xIndex = curves.x.times.indexOf(time);
      if (curves.y) yIndex = curves.y.times.indexOf(time);
      if (curves.z) zIndex = curves.z.times.indexOf(time);

      // if there is an x value defined for this frame, use that
      if (xIndex !== -1) {
        var xValue = curves.x.values[xIndex];
        values.push(xValue);
        prevValue[0] = xValue;
      } else {
        // otherwise use the x value from the previous frame
        values.push(prevValue[0]);
      }

      if (yIndex !== -1) {
        var yValue = curves.y.values[yIndex];
        values.push(yValue);
        prevValue[1] = yValue;
      } else {
        values.push(prevValue[1]);
      }

      if (zIndex !== -1) {
        var zValue = curves.z.values[zIndex];
        values.push(zValue);
        prevValue[2] = zValue;
      } else {
        values.push(prevValue[2]);
      }
    });

    return values;
  }

  // Rotations are defined as Euler angles which can have values  of any size
  // These will be converted to quaternions which don't support values greater than
  // PI, so we'll interpolate large rotations
  interpolateRotations(curve) {
    for (let i = 1; i < curve.values.length; i++) {
      const initialValue = curve.values[i - 1];
      const valuesSpan = curve.values[i] - initialValue;

      const absoluteSpan = Math.abs(valuesSpan);

      if (absoluteSpan >= 180) {
        const numSubIntervals = absoluteSpan / 180;

        const step = valuesSpan / numSubIntervals;
        let nextValue = initialValue + step;

        const initialTime = curve.times[i - 1];
        const timeSpan = curve.times[i] - initialTime;
        const interval = timeSpan / numSubIntervals;
        let nextTime = initialTime + interval;

        const interpolatedTimes: any[] = [];
        const interpolatedValues: any[] = [];

        while (nextTime < curve.times[i]) {
          interpolatedTimes.push(nextTime);
          nextTime += interval;

          interpolatedValues.push(nextValue);
          nextValue += step;
        }

        curve.times = inject(curve.times, i, interpolatedTimes);
        curve.values = inject(curve.values, i, interpolatedValues);
      }
    }
  }
}
