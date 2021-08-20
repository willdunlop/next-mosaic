import * as React from "react";
import Image from 'next/image';

interface ImagePreviewProps {
    imageElement: HTMLImageElement;
}

/**
 * @Component
 * @param { ImagePreviewProps } props 
 * A container for the uploaded image to be displayed from
 */
export default function ImagePreview(props: ImagePreviewProps) {
    return (
        <div className=" w-full border-4 border-red-300 mr-8 p-2">
            {
                props.imageElement &&
                    <Image
                        src={props.imageElement.src}
                        alt="Image preview"
                        width={props.imageElement.width}
                        height={props.imageElement.height}
                    />
            }
        </div>
    )
}