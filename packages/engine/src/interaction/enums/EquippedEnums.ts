import { BinaryValue } from "../../common/enums/BinaryValue";

type isEquipped = BinaryValue;
type equippedEntityId = number;

export type EquippedStateUpdateSchema = [isEquipped, equippedEntityId?];