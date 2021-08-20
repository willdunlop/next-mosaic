import * as React from "react";

/**
 * @Component
 * A container component for the mosaic canvas. A ref has been forwarded for elevated interaction.
 */
const MosaicDisplay = React.forwardRef((props:any, ref:React.ForwardedRef<HTMLCanvasElement>) => {
    return (
        <div className="w-full border-4 border-green-300 flex align-items justify-content p-2 mt-4 2xl:mt-0">
            <canvas ref={ref} className="mr-auto ml-auto" width={props.imageElement.width + 3} height={props.imageElement.height + 10} />
        </div>
    )
});

MosaicDisplay.displayName = "MosaicDisplay";

export default MosaicDisplay;