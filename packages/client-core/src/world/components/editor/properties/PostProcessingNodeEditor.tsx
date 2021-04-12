import { Checkbox } from "@material-ui/core";
import { Rainbow } from "@styled-icons/fa-solid/Rainbow";
import React, { Component } from "react";
import NodeEditor from "./NodeEditor";
import { PostProcessingProperties } from "./PostProcessingProperties";

/**
 * [propTypes Defining properties for PostProcessing component]
 * @type {Object}
 */
type PostProcessingNodeEditorPropTypes = {
  editor?: object,
  node?: object,
};

export enum PostProcessingPropertyTypes {
  BlendFunction, Number, Boolean, Color, KernelSize
}


const EffectsOptions = {
  FXAAEffect: {
    blendFunction: {
      propertyType: PostProcessingPropertyTypes.BlendFunction,
      name: "Blend Function",
    },
  },
  OutlineEffect: {
    blendFunction: {
      propertyType: PostProcessingPropertyTypes.BlendFunction,
      name: "Blend Function",
    },
    edgeStrength: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: "Edge Strength",
    },
    pulseSpeed: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: "Pulse Speed",
    },
    visibleEdgeColor: {
      propertyType: PostProcessingPropertyTypes.Color,
      name: "Visible Edge Color",
    },
    hiddenEdgeColor: {
      propertyType: PostProcessingPropertyTypes.Color,
      name: "Hidden Edge Color",
    },
    resolutionScale: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: "Resolution Scale",
    },
    kernelSize: {
      propertyType: PostProcessingPropertyTypes.KernelSize,
      name: "Kernel Size",
    },
    blur: {
      propertyType: PostProcessingPropertyTypes.Boolean,
      name: "Blur",
    },
    xRay: {
      propertyType: PostProcessingPropertyTypes.Boolean,
      name: "XRay",
    },
  },

  SSAOEffect: {
    blendFunction: {
      propertyType: PostProcessingPropertyTypes.BlendFunction,
      name: "Blend Function",
    },
    distanceScaling: {
      propertyType: PostProcessingPropertyTypes.Boolean,
      name: "Distance Scaling",
    },
    depthAwareUpsampling: {
      propertyType: PostProcessingPropertyTypes.Boolean,
      name: "Depth Aware Upsampling",
    },

    samples: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: "Samples",
    },

    rings: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: "Rings",
    },

    distanceThreshold: {       // Render up to a distance of ~20 world units
      propertyType: PostProcessingPropertyTypes.Number,
      name: "Distance Threshold",
    },
    distanceFalloff: {         // with an additional ~2.5 units of falloff.
      propertyType: PostProcessingPropertyTypes.Number,
      name: "Distance Falloff",
    },
    minRadiusScale: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: "Min Radius Scale",
    },
    bias: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: "Bias",
    },
    radius: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: "Radius",
    },
    intensity: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: "Intensity",
    },
    fade: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: "Fade",
    },
  },
  DepthOfFieldEffect: {
    blendFunction: {
      propertyType: PostProcessingPropertyTypes.BlendFunction,
      name: "Blend Function",
    },
    bokehScale: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: "Bokeh Scale",
    },
    focalLength: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: "Focal Length",
    },
    focusDistance: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: "Focus Distance",
    },
  },
  BloomEffect: {
    blendFunction: {
      propertyType: PostProcessingPropertyTypes.BlendFunction,
      name: "Blend Function",
    },
    kernelSize: {
      propertyType: PostProcessingPropertyTypes.KernelSize,
      name: "Kernel Size",
    },
    intensity: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: "Intensity",
    },
    luminanceSmoothing: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: "Luminance Smoothing",
    },
    luminanceThreshold: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: "Luminance Threshold",
    },
  },
  ToneMappingEffect: {
    blendFunction: {
      propertyType: PostProcessingPropertyTypes.BlendFunction,
      name: "Blend Function",
    },
    adaptive: {
      propertyType: PostProcessingPropertyTypes.Boolean,
      name: "Adaptive",
    },
    adaptationRate: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: "Adaptation Rate",
    },
    averageLuminance: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: "Average Luminance",
    },
    maxLuminance: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: "Max Luminance",
    },
    middleGrey: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: "Middle Grey",
    },
    // resolution:{
    //   propertyType:PostProcessingPropertyTypes.Number,
    //   name:"Resolution",
    // }
  },
  BrightnessContrastEffect: {
    brightness: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: "Brightness",
    },
    contrast: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: "Contrast",
    }
  },
  HueSaturationEffect: {
    hue: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: "Hue",
    },
    saturation: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: "Saturation",
    }
  },
  ColorDepthEffect: {
    bits: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: "Bits",
    }
  },
  LinearTosRGBEffect: {
  }
};

/**
 * @author Abhishek Pathak <abhi.pathak401@gmail.com>
 */
export const PostProcessingNodeEditor = (props: PostProcessingNodeEditorPropTypes) => {
  const onChangeCheckBox = (e, key) => (props.editor as any).setObjectProperty("postProcessingOptions." + key + ".isActive", e.target.checked);

  const onChangeNodeSetting = (key, op) => {
    (props.editor as any).setObjectProperty("postProcessingOptions." + key, op);
  };

  const getPropertyValue = (arr: []) => {
    return (props.node as any).getPropertyValue(arr);
  };

  const renderEffectsTypes = (id) => {
    const effectOptions = EffectsOptions[id];
    const item = Object.values(effectOptions).map((values, index) => {
      const op = [id, Object.keys(effectOptions)[index]];
      return <PostProcessingProperties key={id + index} values={values} op={op} onChangeFunction={onChangeNodeSetting} getProp={getPropertyValue} />;
    });
    return (<>{item}</>);
  };

  const renderEffects = (node) => {
    const items = Object.keys(EffectsOptions).map((key) => {
      return (
        <div key={key}>
          <Checkbox
            onChange={e => onChangeCheckBox(e, key)}
            checked={node.postProcessingOptions[key].isActive}
          />
          {key}
          {
            node.postProcessingOptions[key].isActive &&
            <div>{renderEffectsTypes(key)}</div>
          }
        </div>
      );
    }
    );
    return (<div>{items}</div>);
  };

    const node = props.node;
    return (
      <NodeEditor description={PostProcessingNodeEditor.description}{...props}>
        {renderEffects(node)}
        { /* @ts-ignore */}
      </NodeEditor>
    );
};
PostProcessingNodeEditor.iconComponent = Rainbow;
PostProcessingNodeEditor.description = "For applying Post Processing effects to you scene";
export default PostProcessingNodeEditor;
