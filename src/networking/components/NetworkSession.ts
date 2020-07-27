import BehaviorComponent from "../../common/components/BehaviorComponent"
import NetworkSessionSchema from "../interfaces/NetworkSessionSchema"
import MessageTypeAlias from "../types/MessageTypeAlias"
import MessageSchema from "../classes/MessageSchema"

export default class NetworkSession extends BehaviorComponent<MessageTypeAlias, NetworkSessionSchema, MessageSchema> {}
