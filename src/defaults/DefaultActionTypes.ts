import IKeyValueWithDefault from "ecsy-common/src/common/interfaces/IKeyValueWithDefault"

const DefaultActionType: IKeyValueWithDefault = {
  DEFAULT: -1,
  PRIMARY: 0,
  SECONDARY: 1,
  FORWARD: 2,
  BACKWARD: 3,
  UP: 4,
  DOWN: 5,
  LEFT: 6,
  RIGHT: 7,
  INTERACT: 8,
  CROUCH: 9,
  JUMP: 10,
  WALK: 11,
  RUN: 12,
  SPRINT: 13
}

export default DefaultActionType
