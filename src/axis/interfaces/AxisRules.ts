import AxisAlias from "../types/AxisAlias"

export default interface AxisRules {
  opposes?: AxisAlias[] // Cancel each other out (walk left and right at the same time)
  overrides?: AxisAlias[] // i.e. Jump overrides crouch
  blockedBy?: AxisAlias[] // i.e. Can't walk if sprinting
}
