import * as React from "react";

const MosaicDisplay = React.forwardRef((props:any, ref:React.ForwardedRef<HTMLCanvasElement>) => {
    return (
        <div className=" w-full border-4 border-green-300 p-2">
            <canvas ref={ref} width={props.imageElement.width + 3} height={props.imageElement.height + 10} />
        </div>
    )
});

MosaicDisplay.displayName = "MosaicDisplay";

export default MosaicDisplay;