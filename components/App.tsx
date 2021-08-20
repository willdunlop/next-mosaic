import * as React from "react";
import ImageDropUploader from "./ImageDropUploader";
import Mosaic from "./Mosaic";
import { MAX_IMAGE_WIDTH } from "../config/constants";

/**
 * @Component
 * The main component of the application
 */
export default function App() {
    const [dragIsActive, setDragIsActive] = React.useState(false)
    const [imageElement, setImageElement] = React.useState<HTMLImageElement>();
    const [fileError, setFileError] = React.useState("")

    /**
     * @param { ProgressEvent<FileReader> } event 
     * A function that fires when a validated image is processed. The image is created using
     * the Image constructor and is sent off to have its dimensions analysed and rescaled if
     * necessary
     */
    const loadImage = (event:ProgressEvent<FileReader>) => {
        const newImageElement = new Image();
        newImageElement.onload = () => {
            const scaledImageElement = scaleImage(newImageElement);
            console.info("Image detected");
            setImageElement(scaledImageElement);
        }
        if (event && event.target) {
            if (typeof event.target.result === "string") {
                newImageElement.src = event.target.result
            }
        }
    }

    /**
     * @param { HTMLImageElement } newImageElement 
     * @return { HTMLImageElement | void }
     * Checks the width of the provided image and uses a HTML5 canvas to rescale it if it
     * exceeds the maximum accepted width.
     */
    const scaleImage = (newImageElement:HTMLImageElement) => {
        // Return the original image if it is within the acceptable boundaries 
        if (newImageElement.width < MAX_IMAGE_WIDTH) return newImageElement;

		if (newImageElement.width > MAX_IMAGE_WIDTH) {
			newImageElement.height *= MAX_IMAGE_WIDTH / newImageElement.width;
			newImageElement.width = MAX_IMAGE_WIDTH;
        }
        // Create a new image element to copy the canvas output too
        const scaledImageElement = new Image();
        scaledImageElement.width = newImageElement.width;
        scaledImageElement.height = newImageElement.height;
        // Use a canvas to scale the image
        const scalingCanvas = document.createElement("canvas");
        scalingCanvas.width = newImageElement.width;
        scalingCanvas.height = newImageElement.height
        const scalingContext = scalingCanvas.getContext("2d");
        if(scalingContext) {
            scalingContext.drawImage(newImageElement, 0, 0, newImageElement.width, newImageElement.height);
            scaledImageElement.src = scalingCanvas.toDataURL();            
            return scaledImageElement;
        }
    }

    /**
     * @param { React.DragEvent<HTMLDivElement> } event
     * Triggers the dragIsActive state that is used to scale up the dropzone, prompting 
     * the user to drop their image within it.
     */
    const onDragEnter = (event:React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (!dragIsActive) {
            setDragIsActive(true)
        }
    }

    return (
        <div
            className="flex flex-col items-center h-screen mt-8"
            onDragEnter={onDragEnter}
        >
            <h1>Next.js Mosaic</h1>
            <div className="h-8">
                <p className={`text-red-400 ${!fileError && "hidden"}`}>{fileError}</p>
            </div>

            <ImageDropUploader
                dragIsActive={dragIsActive}
                setDragIsActive={setDragIsActive}
                setFileError={setFileError}
                loadImage={loadImage}
            />

            { imageElement && <Mosaic imageElement={imageElement} /> }
        </div>
    )
}