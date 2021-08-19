import * as React from "react";
import { MAX_FILE_SIZE, FileError, VALID_FILE_TYPES } from "../config/constants";

interface ImageDropUploaderProps {
    dragIsActive: boolean;
    setFileError: (error:FileError) => void;
    loadImage: (event:ProgressEvent<FileReader>) => void;

}

export default function ImageDropUploader(props:ImageDropUploaderProps) {

    const dragOver = (event:React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    }

    const fileIsAnImage = (file:File) => {
        if (VALID_FILE_TYPES.indexOf(file.type) === -1) {
            return false;
        }
        return true;
    }
    const fileWithinSizeLimit = (file:File) => {
        if (file.size < MAX_FILE_SIZE) {
            return true
        }
        return false;
    }

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
            console.log("file", file)
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
                onDragOver={dragOver}
                onDragEnter={dragOver}
                onDragLeave={dragOver}
                onDrop={fileDrop}
            >
                <p>Drop an image here to begin!</p>
            </div>
        </div>
    )
}