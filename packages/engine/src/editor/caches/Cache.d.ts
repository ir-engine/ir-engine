export default class Cache {
    _cache: Map<any, any>;
    evict(url: any): void;
    _clear(): void;
}
