import { Entity } from '@ir-engine/ecs'
import { VRMHumanBoneName } from './VRMHumanBoneName'
import { VRMRequiredHumanBoneName } from './VRMRequiredHumanBoneNames'

export type VRMHumanBones = {
  [bone in VRMHumanBoneName]?: Entity
} & { [bone in VRMRequiredHumanBoneName]: Entity }
