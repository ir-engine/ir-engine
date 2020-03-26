export default class aframeAsset {
    elementType : string;
    id: string;
    src: string;

    constructor(elementType : string, id : string, src : string){
        this.elementType = elementType;
        this.id = id;
        this.src = src;
    }
}