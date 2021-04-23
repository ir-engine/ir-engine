---
id: "particles_classes_particleemitter"
title: "Module: particles/classes/ParticleEmitter"
sidebar_label: "particles/classes/ParticleEmitter"
custom_edit_url: null
hide_title: true
---

# Module: particles/classes/ParticleEmitter

## Functions

### createParticleEmitter

▸ **createParticleEmitter**(`options`: [*ParticleEmitterInterface*](../interfaces/particles_interfaces.particleemitterinterface.md), `matrixWorld`: Matrix4, `time?`: *number*): [*ParticleEmitter*](../interfaces/particles_interfaces.particleemitter.md)

Create particle emitter.

#### Parameters:

Name | Type | Default value | Description |
:------ | :------ | :------ | :------ |
`options` | [*ParticleEmitterInterface*](../interfaces/particles_interfaces.particleemitterinterface.md) | - | Options for particle emitter.   |
`matrixWorld` | Matrix4 | - | Matrix world of particle emitter.   |
`time` | *number* | 0 | Emitter time.    |

**Returns:** [*ParticleEmitter*](../interfaces/particles_interfaces.particleemitter.md)

Newly created particle emitter.

Defined in: [packages/engine/src/particles/classes/ParticleEmitter.ts:40](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/particles/classes/ParticleEmitter.ts#L40)

___

### deleteParticleEmitter

▸ **deleteParticleEmitter**(`emitter`: [*ParticleEmitter*](../interfaces/particles_interfaces.particleemitter.md)): *void*

Delete particle emitter.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`emitter` | [*ParticleEmitter*](../interfaces/particles_interfaces.particleemitter.md) | Emitter to be deleted.    |

**Returns:** *void*

Defined in: [packages/engine/src/particles/classes/ParticleEmitter.ts:142](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/particles/classes/ParticleEmitter.ts#L142)

___

### setEmitterMatrixWorld

▸ **setEmitterMatrixWorld**(`emitter`: [*ParticleEmitter*](../interfaces/particles_interfaces.particleemitter.md), `matrixWorld`: Matrix4, `time`: *number*, `deltaTime`: *number*): *void*

Apply matrix world to particle emitter.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`emitter` | [*ParticleEmitter*](../interfaces/particles_interfaces.particleemitter.md) | Particle emitter.   |
`matrixWorld` | Matrix4 | Matrix world to be applied on particle emitter.   |
`time` | *number* | Time to be applied on particle emitter.   |
`deltaTime` | *number* | Time since last frame.    |

**Returns:** *void*

Defined in: [packages/engine/src/particles/classes/ParticleEmitter.ts:348](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/particles/classes/ParticleEmitter.ts#L348)

___

### setEmitterTime

▸ **setEmitterTime**(`emitter`: [*ParticleEmitter*](../interfaces/particles_interfaces.particleemitter.md), `time`: *number*): *void*

Set particle emitter time.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`emitter` | [*ParticleEmitter*](../interfaces/particles_interfaces.particleemitter.md) | Particle emitter.   |
`time` | *number* | Time of the particle emitter.    |

**Returns:** *void*

Defined in: [packages/engine/src/particles/classes/ParticleEmitter.ts:337](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/particles/classes/ParticleEmitter.ts#L337)
