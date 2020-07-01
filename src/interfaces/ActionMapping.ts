import ActionType from "../types/ActionType"

export default interface ActionMapping {
  opposes?: ActionType[] // Cancel each other out (walk left and right at the same time)
  overrides?: ActionType[] // i.e. Jump overrides crouch
  blockedBy?: ActionType[] // i.e. Can't walk if sprinting
}
