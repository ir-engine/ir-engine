import InputAlias from "../types/InputAlias"

export default interface InputRelationshipMapping {
  opposes?: InputAlias[] // Cancel each other out (walk left and right at the same time)
  overrides?: InputAlias[] // i.e. Jump overrides crouch
  blockedBy?: InputAlias[] // i.e. Can't walk if sprinting
}
