import * as React from "react";
import { MAX_FILE_SIZE, FileError, VALID_FILE_TYPES } from "../config/constants";

interface ImageDropUploaderProps {
    dragIsActive: boolean;
    setFileError: (error:FileError) => void;
    loadImage: (event:ProgressEvent<FileReader>) => void;

}

/**
 * @Component
 * @param { ImageDropUploaderProps } props 
 * Renders the blue file drop zone and handles some basic file validation that
 * is triggered on upload
 */
export default function ImageDropUploader(props:ImageDropUploaderProps) {

    /**
     * @param { React.DragEvent<HTMLDivElement> } event 
     * Prevents the browser from opening the image when the user drops it from their drag
     */
    const onDragEvent = (event:React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    }

    /**
     * @param { File } file 
     * @returns { boolean }
     * Compares the file type against a list of accepted formats
     */
    const fileIsAnImage = (file:File) => {
        if (VALID_FILE_TYPES.indexOf(file.type) === -1) {
            return false;
        }
        return true;
    }

    /**
     * @param { File } file 
     * Checks if the file size is below certain threshold
     */
    const fileWithinSizeLimit = (file:File) => {
        if (file.size < MAX_FILE_SIZE) {
            return true
        }
        return false;
    }

    /**
     * @param { React.DragEvent<HTMLDivElement> } event 
     * Event handler for when a file is provided by the user.
     * It will run a series of validation checks and process the file if all of them pass.
     * Loading of the file is handed by an elevated function "loadImage" which has been passed 
     * through as a prop
     */
    const fileDrop = (event:React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const file = event.dataTransfer.files[0];
        if (file) {
            if (!fileIsAnImage(file)) {
                // Tell the user the file was an incorrect format
                props.setFileError(FileError.INCORRECT_FORMAT);
                return;
            };
            if (!fileWithinSizeLimit(file)) {
                // Tell the user the file was too large
                props.setFileError(FileError.TO_LARGE);
                return
            }
            const reader = new FileReader();
            reader.onload = props.loadImage
            reader.readAsDataURL(file);
        } else {
            // Dragged object was not a file. Inform the user of accepted formats
            props.setFileError(FileError.INCORRECT_FORMAT)
        }
    }

    return (
        <div className={`flex flex-col justify-center items-center max-w-lg w-full transition duration-500 ease-in-out transform ${props.dragIsActive ? ' scale-110' : ""}`}>
            <div
                id="dropUploader"
                className="pt-6 pb-6 pr-12 pl-12 w-full bg-blue-100 border-4 border-blue-300 rounded-md flex flex-col justify-center items-center"
                onDragOver={onDragEvent}
                onDragEnter={onDragEvent}
                onDragLeave={onDragEvent}
                onDrop={fileDrop}
            >
                <p>Drop an image here to begin!</p>
            </div>
        </div>
    )
}