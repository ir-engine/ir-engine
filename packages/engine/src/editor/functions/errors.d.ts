export default function eventToMessage(event: any): any;
export declare class BaseError extends Error {
    constructor(message: any);
}
export declare class RethrownError extends BaseError {
    constructor(message: any, error: any);
}
export declare class MultiError extends BaseError {
    constructor(message: any, errors: any);
}
