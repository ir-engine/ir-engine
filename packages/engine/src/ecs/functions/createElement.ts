import { isWebWorker } from "../../common/functions/getEnvironment"
import { applyElementArguments } from "../../worker/MessageQueue";

export const createElement = (type: string, args: any) => {
  return isWebWorker ? document.createElement(type, args) : applyElementArguments(document.createElement(type), args);
}