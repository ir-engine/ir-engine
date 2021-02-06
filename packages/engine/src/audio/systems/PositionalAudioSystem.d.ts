import { System, SystemAttributes } from '../../ecs/classes/System';
/** System class which provides methods for Positional Audio system. */
export declare class PositionalAudioSystem extends System {
    /** Static instance for positional audio. */
    static instance: PositionalAudioSystem;
    characterAudioStream: Map<any, any>;
    /** Constructs Positional Audio System. */
    constructor(attributes?: SystemAttributes);
    /** Execute the positional audio system for different events of queries. */
    execute(): void;
    /** Suspend positional audio components. */
    suspend(): void;
    /** Resume positional audio components. */
    resume(): void;
}
