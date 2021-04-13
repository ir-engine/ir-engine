---
id: "renderer_postprocessing_blending_blendfunction"
title: "Module: renderer/postprocessing/blending/BlendFunction"
sidebar_label: "renderer/postprocessing/blending/BlendFunction"
custom_edit_url: null
hide_title: true
---

# Module: renderer/postprocessing/blending/BlendFunction

## Variables

### BlendFunction

• `Const` **BlendFunction**: *object*

A blend function enumeration.

**`property`** {Number} SKIP - No blending. The effect will not be included in the final shader.

**`property`** {Number} ADD - Additive blending. Fast, but may produce washed out results.

**`property`** {Number} ALPHA - Alpha blending. Blends based on the alpha value of the new color.

**`property`** {Number} AVERAGE - Average blending.

**`property`** {Number} COLOR_BURN - Color burn.

**`property`** {Number} COLOR_DODGE - Color dodge.

**`property`** {Number} DARKEN - Prioritize darker colors.

**`property`** {Number} DIFFERENCE - Color difference.

**`property`** {Number} EXCLUSION - Color exclusion.

**`property`** {Number} LIGHTEN - Prioritize lighter colors.

**`property`** {Number} MULTIPLY - Color multiplication.

**`property`** {Number} DIVIDE - Color division.

**`property`** {Number} NEGATION - Color negation.

**`property`** {Number} NORMAL - Normal blending. The new color overwrites the old one.

**`property`** {Number} OVERLAY - Color overlay.

**`property`** {Number} REFLECT - Color reflection.

**`property`** {Number} SCREEN - Screen blending. The two colors are effectively projected on a white screen simultaneously.

**`property`** {Number} SOFT_LIGHT - Soft light blending.

**`property`** {Number} SUBTRACT - Color subtraction.

#### Type declaration:

Name | Type |
:------ | :------ |
`ADD` | *number* |
`ALPHA` | *number* |
`AVERAGE` | *number* |
`COLOR_BURN` | *number* |
`COLOR_DODGE` | *number* |
`DARKEN` | *number* |
`DIFFERENCE` | *number* |
`DIVIDE` | *number* |
`EXCLUSION` | *number* |
`LIGHTEN` | *number* |
`MULTIPLY` | *number* |
`NEGATION` | *number* |
`NORMAL` | *number* |
`OVERLAY` | *number* |
`REFLECT` | *number* |
`SCREEN` | *number* |
`SKIP` | *number* |
`SOFT_LIGHT` | *number* |
`SUBTRACT` | *number* |

Defined in: [packages/engine/src/renderer/postprocessing/blending/BlendFunction.ts:26](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/blending/BlendFunction.ts#L26)
