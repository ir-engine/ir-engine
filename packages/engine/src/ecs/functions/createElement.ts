import { isWebWorker } from "../../common/functions/getEnvironment"
import { applyElementArguments } from "../../worker/MessageQueue";

/**
 * 
 * @author Josh Field 
 * @param type 
 * @param args 
 * @returns 
 */
export const createElement = (type: string, args: any) => {
  return isWebWorker ? document.createElement(type, args) : applyElementArguments(document.createElement(type), args);
}