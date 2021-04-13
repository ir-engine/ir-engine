---
id: "particles_classes_particlemesh"
title: "Module: particles/classes/ParticleMesh"
sidebar_label: "particles/classes/ParticleMesh"
custom_edit_url: null
hide_title: true
---

# Module: particles/classes/ParticleMesh

## Functions

### createParticleMesh

▸ **createParticleMesh**(`options`: [*particleMeshOptions*](../interfaces/particles_interfaces.particlemeshoptions.md)): [*ParticleMesh*](../interfaces/particles_interfaces.particlemesh.md)

Create particle mesh from options.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`options` | [*particleMeshOptions*](../interfaces/particles_interfaces.particlemeshoptions.md) | Options to be applied on particle mesh.    |

**Returns:** [*ParticleMesh*](../interfaces/particles_interfaces.particlemesh.md)

Newly created particle mesh.

Defined in: [packages/engine/src/particles/classes/ParticleMesh.ts:38](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/particles/classes/ParticleMesh.ts#L38)

___

### loadTexturePackerJSON

▸ **loadTexturePackerJSON**(`mesh`: *any*, `config`: *any*, `startIndex`: *any*, `endIndex`: *any*): *void*

Load texture packer JSON file for provided mesh.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`mesh` | *any* | Mesh for which texture packer JSON will be loaded.   |
`config` | *any* | Configs.   |
`startIndex` | *any* | Start index of the mesh geometry.   |
`endIndex` | *any* | End index of the mesh geometry.    |

**Returns:** *void*

Defined in: [packages/engine/src/particles/classes/ParticleMesh.ts:287](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/particles/classes/ParticleMesh.ts#L287)

___

### needsUpdate

▸ **needsUpdate**(`geometry`: *any*, `attrs?`: *any*): *void*

Set needsUpdate property of the geometry attributes.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`geometry` | *any* | Geometry.   |
`attrs?` | *any* | List of attributes to be updated.    |

**Returns:** *void*

Defined in: [packages/engine/src/particles/classes/ParticleMesh.ts:624](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/particles/classes/ParticleMesh.ts#L624)

___

### setAccelerationAt

▸ **setAccelerationAt**(`geometry`: *any*, `i`: *any*, `x`: *any*, `y`: *any*, `z`: *any*, `radial?`: *number*): *void*

Set acceleration of geometry at provided index.

#### Parameters:

Name | Type | Default value | Description |
:------ | :------ | :------ | :------ |
`geometry` | *any* | - | Geometry for which acceleration will be set.   |
`i` | *any* | - | Index of geometry on which acceleration will be set.    |
`x` | *any* | - | - |
`y` | *any* | - | - |
`z` | *any* | - | - |
`radial` | *number* | 0 | - |

**Returns:** *void*

Defined in: [packages/engine/src/particles/classes/ParticleMesh.ts:524](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/particles/classes/ParticleMesh.ts#L524)

___

### setAngularAccelerationAt

▸ **setAngularAccelerationAt**(`geometry`: *any*, `i`: *any*, `x`: *any*, `y`: *any*, `z`: *any*, `orbital?`: *number*): *void*

Set angular acceleration of geometry at provided index.

#### Parameters:

Name | Type | Default value | Description |
:------ | :------ | :------ | :------ |
`geometry` | *any* | - | Geometry for which angular acceleration will be set.   |
`i` | *any* | - | Index of geometry on which angular acceleration will be set.    |
`x` | *any* | - | - |
`y` | *any* | - | - |
`z` | *any* | - | - |
`orbital` | *number* | 0 | - |

**Returns:** *void*

Defined in: [packages/engine/src/particles/classes/ParticleMesh.ts:548](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/particles/classes/ParticleMesh.ts#L548)

___

### setAngularVelocityAt

▸ **setAngularVelocityAt**(`geometry`: *any*, `i`: *any*, `x`: *any*, `y`: *any*, `z`: *any*, `orbital?`: *number*): *void*

Set angular velocity of geometry at provided index.

#### Parameters:

Name | Type | Default value | Description |
:------ | :------ | :------ | :------ |
`geometry` | *any* | - | Geometry for which angular velocity will be set.   |
`i` | *any* | - | Index of geometry on which angular velocity will be set.    |
`x` | *any* | - | - |
`y` | *any* | - | - |
`z` | *any* | - | - |
`orbital` | *number* | 0 | - |

**Returns:** *void*

Defined in: [packages/engine/src/particles/classes/ParticleMesh.ts:536](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/particles/classes/ParticleMesh.ts#L536)

___

### setAtlasIndexAt

▸ **setAtlasIndexAt**(`geometry`: *any*, `i`: *any*, `atlasIndex`: *any*): *void*

Set atlas index of geometry at provided index.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`geometry` | *any* | Geometry for which atlas index will be set.   |
`i` | *any* | Index of geometry on which atlas index will be set.   |
`atlasIndex` | *any* | Atlas index to be set.    |

**Returns:** *void*

Defined in: [packages/engine/src/particles/classes/ParticleMesh.ts:477](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/particles/classes/ParticleMesh.ts#L477)

___

### setBrownianAt

▸ **setBrownianAt**(`geometry`: *any*, `i`: *any*, `brownianSpeed`: *any*, `brownianScale`: *any*): *void*

Set brownian speed and scale of geometry at provided index.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`geometry` | *any* | Geometry for which brownian speed and scale will be set.   |
`i` | *any* | Index of geometry on which brownian speed and scale will be set.   |
`brownianSpeed` | *any* | Brownian speed to be set.   |
`brownianScale` | *any* | Brownian scale to be set.    |

**Returns:** *void*

Defined in: [packages/engine/src/particles/classes/ParticleMesh.ts:578](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/particles/classes/ParticleMesh.ts#L578)

___

### setColorsAt

▸ **setColorsAt**(`geometry`: *any*, `i`: *any*, `colorArray`: *any*): *void*

Set color of geometry at provided index.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`geometry` | *any* | Geometry for which color will be set.   |
`i` | *any* | Index of geometry on which color will be set.   |
`colorArray` | *any* | Color array to be set on geometry.    |

**Returns:** *void*

Defined in: [packages/engine/src/particles/classes/ParticleMesh.ts:404](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/particles/classes/ParticleMesh.ts#L404)

___

### setFrameAt

▸ **setFrameAt**(`geometry`: *any*, `i`: *any*, `atlasIndex`: *any*, `frameStyle`: *any*, `startFrame`: *any*, `endFrame`: *any*, `cols`: *any*, `rows`: *any*): *void*

Set frame of geometry at provided index.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`geometry` | *any* | Geometry for which frame will be set.   |
`i` | *any* | Index of geometry on which frame will be set.   |
`atlasIndex` | *any* | Atlas index of frame.   |
`frameStyle` | *any* | Style of the frame.   |
`startFrame` | *any* | Start frame.   |
`endFrame` | *any* | End frame.   |
`cols` | *any* | Columns of the frame.   |
`rows` | *any* | Rows of the frames.    |

**Returns:** *void*

Defined in: [packages/engine/src/particles/classes/ParticleMesh.ts:462](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/particles/classes/ParticleMesh.ts#L462)

___

### setKeyframesAt

▸ **setKeyframesAt**(`attribute`: *any*, `i`: *any*, `valueArray`: *any*, `defaultValue`: *any*): *void*

Set Key frame of geometry at provided index.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`attribute` | *any* | - |
`i` | *any* | Index of geometry on which Key frame will be set.   |
`valueArray` | *any* | Key frame to be applied.   |
`defaultValue` | *any* | Default value of the frame.    |

**Returns:** *void*

Defined in: [packages/engine/src/particles/classes/ParticleMesh.ts:609](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/particles/classes/ParticleMesh.ts#L609)

___

### setMaterialTime

▸ **setMaterialTime**(`material`: [*ParticleMeshMaterial*](../interfaces/particles_interfaces.particlemeshmaterial.md), `time`: *number*): *void*

Update material time

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`material` | [*ParticleMeshMaterial*](../interfaces/particles_interfaces.particlemeshmaterial.md) | Material to be updated.   |
`time` | *number* | Updated time.    |

**Returns:** *void*

Defined in: [packages/engine/src/particles/classes/ParticleMesh.ts:276](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/particles/classes/ParticleMesh.ts#L276)

___

### setMatrixAt

▸ **setMatrixAt**(`geometry`: *any*, `i`: *any*, `mat4`: *any*): *void*

Set matrix on geometry.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`geometry` | *any* | Geometry for which matrix will be set.   |
`i` | *any* | Index of geometry on which matrix will be set.   |
`mat4` | *any* | Matrix to be set on geometry.    |

**Returns:** *void*

Defined in: [packages/engine/src/particles/classes/ParticleMesh.ts:361](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/particles/classes/ParticleMesh.ts#L361)

___

### setOffsetAt

▸ **setOffsetAt**(`geometry`: *any*, `i`: *number*, `x`: *number*, `y?`: *number*, `z?`: *number*): *void*

Set offset of geometry at provided index.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`geometry` | *any* | Geometry for which offset will be set.   |
`i` | *number* | Index of geometry on which offset will be set.   |
`x` | *number* |  |
`y?` | *number* |  |
`z?` | *number* |     |

**Returns:** *void*

Defined in: [packages/engine/src/particles/classes/ParticleMesh.ts:379](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/particles/classes/ParticleMesh.ts#L379)

___

### setOpacitiesAt

▸ **setOpacitiesAt**(`geometry`: *any*, `i`: *any*, `opacityArray`: *any*): *void*

Set opacity of geometry at provided index.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`geometry` | *any* | Geometry for which opacity will be set.   |
`i` | *any* | Index of geometry on which opacity will be set.   |
`opacityArray` | *any* | Opacity array to be set on geometry.    |

**Returns:** *void*

Defined in: [packages/engine/src/particles/classes/ParticleMesh.ts:436](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/particles/classes/ParticleMesh.ts#L436)

___

### setOrientationsAt

▸ **setOrientationsAt**(`geometry`: *any*, `i`: *any*, `orientationArray`: *any*, `worldUp?`: *number*): *void*

Set orientation of geometry at provided index.

#### Parameters:

Name | Type | Default value | Description |
:------ | :------ | :------ | :------ |
`geometry` | *any* | - | Geometry for which orientation will be set.   |
`i` | *any* | - | Index of geometry on which orientation will be set.   |
`orientationArray` | *any* | - | Orientation to be set.   |
`worldUp` | *number* | 0 | Should Maintain world Up?    |

**Returns:** *void*

Defined in: [packages/engine/src/particles/classes/ParticleMesh.ts:501](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/particles/classes/ParticleMesh.ts#L501)

___

### setScalesAt

▸ **setScalesAt**(`geometry`: *any*, `i`: *any*, `scaleArray`: *any*): *void*

Set scale of geometry at provided index.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`geometry` | *any* | Geometry for which scale will be set.   |
`i` | *any* | Index of geometry on which scale will be set.   |
`scaleArray` | *any* | Scale to be set.    |

**Returns:** *void*

Defined in: [packages/engine/src/particles/classes/ParticleMesh.ts:489](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/particles/classes/ParticleMesh.ts#L489)

___

### setTextureAtlas

▸ **setTextureAtlas**(`material`: *any*, `atlasJSON`: *any*): *void*

Set texture atlas on material.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`material` | *any* | Material of which texture atlas will be saved.   |
`atlasJSON` | *any* | Atlas JSON to get texture atlas.    |

**Returns:** *void*

Defined in: [packages/engine/src/particles/classes/ParticleMesh.ts:332](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/particles/classes/ParticleMesh.ts#L332)

___

### setTimingsAt

▸ **setTimingsAt**(`geometry`: *any*, `i`: *any*, `spawnTime`: *any*, `lifeTime`: *any*, `repeatTime`: *any*, `seed?`: *number*): *void*

Set timings of geometry at provided index.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`geometry` | *any* | Geometry for which timings will be set.   |
`i` | *any* | Index of geometry on which timings will be set.    |
`spawnTime` | *any* | - |
`lifeTime` | *any* | - |
`repeatTime` | *any* | - |
`seed` | *number* | - |

**Returns:** *void*

Defined in: [packages/engine/src/particles/classes/ParticleMesh.ts:446](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/particles/classes/ParticleMesh.ts#L446)

___

### setVelocityAt

▸ **setVelocityAt**(`geometry`: *any*, `i`: *any*, `x`: *any*, `y`: *any*, `z`: *any*, `radial?`: *number*): *void*

Set velocity of geometry at provided index.

#### Parameters:

Name | Type | Default value | Description |
:------ | :------ | :------ | :------ |
`geometry` | *any* | - | Geometry for which velocity will be set.   |
`i` | *any* | - | Index of geometry on which velocity will be set.    |
`x` | *any* | - | - |
`y` | *any* | - | - |
`z` | *any* | - | - |
`radial` | *number* | 0 | - |

**Returns:** *void*

Defined in: [packages/engine/src/particles/classes/ParticleMesh.ts:512](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/particles/classes/ParticleMesh.ts#L512)

___

### setVelocityScaleAt

▸ **setVelocityScaleAt**(`geometry`: *any*, `i`: *any*, `velocityScale`: *any*, `velocityMin`: *any*, `velocityMax`: *any*): *void*

Set velocity scale of geometry at provided index.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`geometry` | *any* | Geometry for which velocity scale will be set.   |
`i` | *any* | Index of geometry on which velocity scale will be set.   |
`velocityScale` | *any* | Velocity scale to be applied.   |
`velocityMin` | *any* | Minimum velocity to be applied.   |
`velocityMax` | *any* | Maximum velocity to be applied.    |

**Returns:** *void*

Defined in: [packages/engine/src/particles/classes/ParticleMesh.ts:595](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/particles/classes/ParticleMesh.ts#L595)

___

### setWorldAccelerationAt

▸ **setWorldAccelerationAt**(`geometry`: *any*, `i`: *any*, `x`: *any*, `y`: *any*, `z`: *any*): *void*

Set world acceleration of geometry at provided index.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`geometry` | *any* | Geometry for which world acceleration will be set.   |
`i` | *any* | Index of geometry on which world acceleration will be set.    |
`x` | *any* | - |
`y` | *any* | - |
`z` | *any* | - |

**Returns:** *void*

Defined in: [packages/engine/src/particles/classes/ParticleMesh.ts:560](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/particles/classes/ParticleMesh.ts#L560)

___

### updateGeometry

▸ **updateGeometry**(`geometry`: [*ParticleGeometry*](particles_interfaces.md#particlegeometry), `config`: [*particleMeshOptions*](../interfaces/particles_interfaces.particlemeshoptions.md)): *void*

Update geometry with provided configs.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`geometry` | [*ParticleGeometry*](particles_interfaces.md#particlegeometry) | Geometry to be updated.   |
`config` | [*particleMeshOptions*](../interfaces/particles_interfaces.particlemeshoptions.md) | Config which will be applied on geometry.    |

**Returns:** *void*

Defined in: [packages/engine/src/particles/classes/ParticleMesh.ts:122](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/particles/classes/ParticleMesh.ts#L122)

___

### updateMaterial

▸ **updateMaterial**(`material`: *any*, `config`: [*particleMeshOptions*](../interfaces/particles_interfaces.particlemeshoptions.md)): *void*

Update material with provided configs.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`material` | *any* | Material to be updated.   |
`config` | [*particleMeshOptions*](../interfaces/particles_interfaces.particlemeshoptions.md) | Config which will be applied on material.    |

**Returns:** *void*

Defined in: [packages/engine/src/particles/classes/ParticleMesh.ts:200](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/particles/classes/ParticleMesh.ts#L200)

___

### updateOriginalMaterialUniforms

▸ **updateOriginalMaterialUniforms**(`material`: [*ParticleMeshMaterial*](../interfaces/particles_interfaces.particlemeshmaterial.md)): *void*

Update Material uniforms

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`material` | [*ParticleMeshMaterial*](../interfaces/particles_interfaces.particlemeshmaterial.md) | Material to be updated.    |

**Returns:** *void*

Defined in: [packages/engine/src/particles/classes/ParticleMesh.ts:261](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/particles/classes/ParticleMesh.ts#L261)
