import Checkbox from '@mui/material/Checkbox'
import React from 'react'
import LooksIcon from '@mui/icons-material/Looks'
import { CommandManager } from '../../managers/CommandManager'
import NodeEditor from './NodeEditor'
import { PostProcessingProperties } from './PostProcessingProperties'

/**
 * [propTypes Defining properties for PostProcessing component]
 * @type {Object}
 */
type PostProcessingNodeEditorPropTypes = {
  node?: object
}

export enum PostProcessingPropertyTypes {
  BlendFunction,
  Number,
  Boolean,
  Color,
  KernelSize
}

const EffectsOptions = {
  FXAAEffect: {
    blendFunction: {
      propertyType: PostProcessingPropertyTypes.BlendFunction,
      name: 'Blend Function'
    }
  },
  OutlineEffect: {
    blendFunction: {
      propertyType: PostProcessingPropertyTypes.BlendFunction,
      name: 'Blend Function'
    },
    edgeStrength: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: 'Edge Strength',
      min: -1,
      max: 1,
      step: 0.01
    },
    pulseSpeed: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: 'Pulse Speed',
      min: -1,
      max: 1,
      step: 0.01
    },
    visibleEdgeColor: {
      propertyType: PostProcessingPropertyTypes.Color,
      name: 'Visible Edge Color'
    },
    hiddenEdgeColor: {
      propertyType: PostProcessingPropertyTypes.Color,
      name: 'Hidden Edge Color'
    },
    resolutionScale: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: 'Resolution Scale',
      min: -1,
      max: 1,
      step: 0.01
    },
    kernelSize: {
      propertyType: PostProcessingPropertyTypes.KernelSize,
      name: 'Kernel Size'
    },
    blur: {
      propertyType: PostProcessingPropertyTypes.Boolean,
      name: 'Blur'
    },
    xRay: {
      propertyType: PostProcessingPropertyTypes.Boolean,
      name: 'XRay'
    }
  },

  SSAOEffect: {
    blendFunction: {
      propertyType: PostProcessingPropertyTypes.BlendFunction,
      name: 'Blend Function'
    },
    distanceScaling: {
      propertyType: PostProcessingPropertyTypes.Boolean,
      name: 'Distance Scaling'
    },
    depthAwareUpsampling: {
      propertyType: PostProcessingPropertyTypes.Boolean,
      name: 'Depth Aware Upsampling'
    },

    samples: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: 'Samples',
      min: 1,
      max: 32,
      step: 1
    },

    rings: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: 'Rings',
      min: -1,
      max: 1,
      step: 0.01
    },

    distanceThreshold: {
      // Render up to a distance of ~20 world units
      propertyType: PostProcessingPropertyTypes.Number,
      name: 'Distance Threshold',
      min: -1,
      max: 1,
      step: 0.01
    },
    distanceFalloff: {
      // with an additional ~2.5 units of falloff.
      propertyType: PostProcessingPropertyTypes.Number,
      name: 'Distance Falloff',
      min: -1,
      max: 1,
      step: 0.01
    },
    minRadiusScale: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: 'Min Radius Scale',
      min: -1,
      max: 1,
      step: 0.01
    },
    bias: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: 'Bias',
      min: -1,
      max: 1,
      step: 0.01
    },
    radius: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: 'Radius',
      min: -1,
      max: 1,
      step: 0.01
    },
    intensity: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: 'Intensity',
      min: -1,
      max: 1,
      step: 0.01
    },
    fade: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: 'Fade',
      min: -1,
      max: 1,
      step: 0.01
    }
  },
  DepthOfFieldEffect: {
    blendFunction: {
      propertyType: PostProcessingPropertyTypes.BlendFunction,
      name: 'Blend Function'
    },
    bokehScale: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: 'Bokeh Scale',
      min: -1,
      max: 1,
      step: 0.01
    },
    focalLength: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: 'Focal Length',
      min: -1,
      max: 1,
      step: 0.01
    },
    focusDistance: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: 'Focus Distance',
      min: -1,
      max: 1,
      step: 0.01
    }
  },
  BloomEffect: {
    blendFunction: {
      propertyType: PostProcessingPropertyTypes.BlendFunction,
      name: 'Blend Function'
    },
    kernelSize: {
      propertyType: PostProcessingPropertyTypes.KernelSize,
      name: 'Kernel Size'
    },
    intensity: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: 'Intensity',
      min: -1,
      max: 1,
      step: 0.01
    },
    luminanceSmoothing: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: 'Luminance Smoothing',
      min: -1,
      max: 1,
      step: 0.01
    },
    luminanceThreshold: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: 'Luminance Threshold',
      min: -1,
      max: 1,
      step: 0.01
    }
  },
  ToneMappingEffect: {
    blendFunction: {
      propertyType: PostProcessingPropertyTypes.BlendFunction,
      name: 'Blend Function'
    },
    adaptive: {
      propertyType: PostProcessingPropertyTypes.Boolean,
      name: 'Adaptive'
    },
    adaptationRate: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: 'Adaptation Rate',
      min: -1,
      max: 1,
      step: 0.01
    },
    averageLuminance: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: 'Average Luminance',
      min: -1,
      max: 1,
      step: 0.01
    },
    maxLuminance: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: 'Max Luminance',
      min: -1,
      max: 1,
      step: 0.01
    },
    middleGrey: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: 'Middle Grey',
      min: -1,
      max: 1,
      step: 0.01
    }
    // resolution:{
    //   propertyType:PostProcessingPropertyTypes.Number,
    //   name:"Resolution",
    // }
  },
  BrightnessContrastEffect: {
    brightness: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: 'Brightness',
      min: -1,
      max: 1,
      step: 0.01
    },
    contrast: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: 'Contrast',
      min: -1,
      max: 1,
      step: 0.01
    }
  },
  HueSaturationEffect: {
    hue: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: 'Hue',
      min: -1,
      max: 1,
      step: 0.01
    },
    saturation: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: 'Saturation',
      min: -1,
      max: 1,
      step: 0.01
    }
  },
  ColorDepthEffect: {
    bits: {
      propertyType: PostProcessingPropertyTypes.Number,
      name: 'Bits',
      min: -1,
      max: 1,
      step: 0.01
    }
  },
  LinearTosRGBEffect: {}
}

/**
 * @author Abhishek Pathak <abhi.pathak401@gmail.com>
 */
export const PostProcessingNodeEditor = (props: PostProcessingNodeEditorPropTypes) => {
  const onChangeCheckBox = (e, key) =>
    CommandManager.instance.setPropertyOnSelection('postProcessingOptions.' + key + '.isActive', e.target.checked)

  const onChangeNodeSetting = (key, op) => {
    CommandManager.instance.setPropertyOnSelection('postProcessingOptions.' + key, op)
  }

  const getPropertyValue = (arr: []) => {
    return (props.node as any).getPropertyValue(arr)
  }

  const renderEffectsTypes = (id) => {
    const effectOptions = EffectsOptions[id]
    const item = Object.values(effectOptions).map((value, index) => {
      const op = [id, Object.keys(effectOptions)[index]]
      return (
        <PostProcessingProperties
          key={id + index}
          value={value}
          op={op}
          onChangeFunction={onChangeNodeSetting}
          getProp={getPropertyValue}
        />
      )
    })
    return <>{item}</>
  }

  const renderEffects = (node) => {
    const items = Object.keys(EffectsOptions).map((key) => {
      return (
        <div key={key}>
          <Checkbox onChange={(e) => onChangeCheckBox(e, key)} checked={node.postProcessingOptions[key].isActive} />
          <span style={{ color: '#9FA4B5' }}>{key}</span>
          {node.postProcessingOptions[key].isActive && <div>{renderEffectsTypes(key)}</div>}
        </div>
      )
    })
    return <div>{items}</div>
  }

  const node = props.node
  return (
    <NodeEditor description={PostProcessingNodeEditor.description} {...props}>
      {renderEffects(node)}
    </NodeEditor>
  )
}
PostProcessingNodeEditor.iconComponent = LooksIcon
PostProcessingNodeEditor.description = 'For applying Post Processing effects to you scene'

export default PostProcessingNodeEditor
