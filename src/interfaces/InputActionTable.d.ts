import ActionRules from "./ActionMapping";
import ActionType from "../types/ActionType";
import AxisType from "../types/AxisType";
declare const symbol: unique symbol;
interface InputActionTable {
    rules: {
        [symbol]?: ActionRules;
    };
    mouse?: {
        actions?: {
            [key: string]: ActionType;
            [key: number]: ActionType;
        };
        axes?: {
            [key: string]: AxisType;
            [key: number]: AxisType;
        };
    };
    keyboard?: {
        actions?: {
            [key: string]: ActionType;
            [key: number]: ActionType;
        };
        axes?: {
            [key: string]: AxisType;
            [key: number]: AxisType;
        };
    };
}
export default InputActionTable;
