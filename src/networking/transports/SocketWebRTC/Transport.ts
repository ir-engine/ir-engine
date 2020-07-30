import { isBrowser } from "../../../common/utils/IsBrowser"
import SocketWebRTCClientTransport from "./ClientTransport"
import SocketWebRTCServerTransport from "./ServerTransport"
import NetworkTransport from "../../interfaces/NetworkTransport"

export default function CreateTransport(): NetworkTransport {
  if (isBrowser) return new SocketWebRTCClientTransport()
  else return new SocketWebRTCServerTransport()
}
