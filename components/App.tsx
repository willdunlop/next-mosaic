import * as React from "react";
import ImageDropUploader from "./ImageDropUploader";
import Mosaic from "./Mosaic";
import { MAX_IMAGE_WIDTH } from "../config/constants";

export default function App() {
    // @TODO: Organise your drag handlers, its a nice touch but is it worth it?
    const [dragIsActive, setDragIsActive] = React.useState(false)
    const [imageElement, setImageElement] = React.useState<HTMLImageElement>();
    const [fileError, setFileError] = React.useState("")

    const onDragEnter = (event:React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (!dragIsActive) {
            // setDragIsActive(true)
        }
    }

    const onDragEnd = (event:React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        console.log("drag end")
        if (dragIsActive) {
            // setDragIsActive(false)
        }
    }

    const scaleImage = (newImageElement:HTMLImageElement) => {
        if (newImageElement.width < MAX_IMAGE_WIDTH) return newImageElement;

		if (newImageElement.width > MAX_IMAGE_WIDTH) {
			newImageElement.height *= MAX_IMAGE_WIDTH / newImageElement.width;
			newImageElement.width = MAX_IMAGE_WIDTH;
        }

        const scaledImageElement = new Image();
        scaledImageElement.width = newImageElement.width;
        scaledImageElement.height = newImageElement.height
        const resizeCanvas = document.createElement("canvas");
        resizeCanvas.width = newImageElement.width;
        resizeCanvas.height = newImageElement.height
        const resizeContext = resizeCanvas.getContext("2d");
        if(resizeContext) {
            resizeContext.drawImage(newImageElement, 0, 0, newImageElement.width, newImageElement.height);
            scaledImageElement.src = resizeCanvas.toDataURL();
            return scaledImageElement;
        }

    }

    const loadImage = (event:ProgressEvent<FileReader>) => {
        const newImageElement = new Image();
        newImageElement.onload = (e) => {
            const scaledImageElement = scaleImage(newImageElement);
            setImageElement(scaledImageElement);
        }
        if (event && event.target) {
            newImageElement.src = event.target.result as string;
        }
    }


    return (
        <div
            className="flex flex-col items-center h-screen mt-8"
            onDragEnter={onDragEnter}
            onDragEnd={onDragEnd}
        >
            <h1>Next.js Mosaic</h1>
            <div className="h-8">
                <p className={`text-red-400 ${!fileError && "hidden"}`}>{fileError}</p>
            </div>

            <ImageDropUploader
                dragIsActive={dragIsActive}
                setFileError={setFileError}
                loadImage={loadImage}
            />

            { imageElement && <Mosaic imageElement={imageElement} /> }
        </div>
    )
}