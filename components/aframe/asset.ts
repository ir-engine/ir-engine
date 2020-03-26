export default class aframeAsset {
    elementType : string;
    id: string;
    src: string;
    className: string;

    constructor(elementType : string, id : string, src : string, className? : string){
        this.elementType = elementType;
        this.id = id;
        this.src = src;
        this.className = className ? className : '';
    }
}