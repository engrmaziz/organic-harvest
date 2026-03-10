declare module 'dom-to-image-more' {
    interface Options {
        quality?: number;
        bgcolor?: string;
        width?: number;
        height?: number;
        style?: Partial<CSSStyleDeclaration>;
        filter?: (node: Node) => boolean;
        imagePlaceholder?: string;
        cacheBust?: boolean;
    }

    const domtoimage: {
        toPng(node: Node, options?: Options): Promise<string>;
        toJpeg(node: Node, options?: Options): Promise<string>;
        toSvg(node: Node, options?: Options): Promise<string>;
        toBlob(node: Node, options?: Options): Promise<Blob>;
        toPixelData(node: Node, options?: Options): Promise<Uint8ClampedArray>;
        toCanvas(node: Node, options?: Options): Promise<HTMLCanvasElement>;
    };

    export default domtoimage;
}
