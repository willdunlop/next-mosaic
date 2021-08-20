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
        <div className=" w-full border-4 border-red-300 p-2 flex align-items justify-content 2xl:mr-8">
            {
                props.imageElement &&
                    <Image
                        src={props.imageElement.src}
                        className="mr-auto ml-auto"
                        alt="Image preview"
                        width={props.imageElement.width}
                        height={props.imageElement.height}
                    />
            }
        </div>
    )
}