import * as React from "react";

import ImagePreview from "./ImagePreview";
import MosaicDisplay from "./MosaicDisplay";
import useMosaic from "../hooks/useMosaic";

interface MosaicProps {
    imageElement: HTMLImageElement;
}

const buttonClasses = [
    "bg-green-500",
    "pr-4",
    "pl-4",
    "pt-2",
    "pb-2",
    "text-white",
    "shadow-md",
    "outline-none",
    "transition",
    "transform",
    "hover:-translate-y-1",
    "active:shadow-none",
    "active:translate-y-1"
].join(" ");

/**
 * @Component
 * @param { MosaicProps } props 
 * Renders both the uploaded image and mosaic. Also renders a button which will trigger
 * the generation of the mosaic.
 */
export default function Mosaic(props:MosaicProps) {
    const canvasRef = React.createRef<HTMLCanvasElement>();
    const { initiate } = useMosaic(canvasRef);

    /**
     * Event handler for when the user initiates the mosaic. 
     * Calls the 'initiate' function which resides within the
     * 'useMosaic' hook. 
     */
    const generateMosaic = () => {
        initiate(props.imageElement);
    }

    return (
        <div className="flex flex-col items-center mt-8 max-w-screen-2xl">
            <button className={buttonClasses} onClick={generateMosaic}>Generate Mosaic</button>
            <div className="flex mt-4">
                <ImagePreview imageElement={props.imageElement} />
                <MosaicDisplay ref={canvasRef} imageElement={props.imageElement}/>
            </div>
        </div>
)
}