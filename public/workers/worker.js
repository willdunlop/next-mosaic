
class ColorAverage {

    /**
     * @param { TileImageData } imageData
     * @return { Object }
     * Will calculate the average RGB color within a single tile by
     * analysing its image data and returning the result within an object.
     */
    static getAverageRGB(imageData) {
            const blockSize = 5; // only visit every 5 pixels
            const rgb = { r:0, g:0, b:0 };
            let i = -4;
            let count = 0;

        while ((i += blockSize * 4) < imageData.data.length) {
            ++count;
            rgb.r += imageData.data[i];
            rgb.g += imageData.data[i + 1];
            rgb.b += imageData.data[i + 2];
        }

        rgb.r = Math.floor(rgb.r / count);
        rgb.g = Math.floor(rgb.g / count);
        rgb.b = Math.floor(rgb.b / count);

        return rgb;
    }

    /**
     * @param { number } r 
     * @param { number } g 
     * @param { number } b 
     * Reveives numerical values for red green and blue colours and converts
     * them into a hexedecimal code.
     */
    static rgbToHex(r, g, b) {
        return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    /**
     * @param { TileImageData } imageData 
     * Converts a tiles image data into a hexedecimal by calling other functions
     * within this class
     */
    static getHexFromImageData(imageData) {
        const color = ColorAverage.getAverageRGB(imageData);
        const averageHex = ColorAverage.rgbToHex(color.r, color.g, color.b)
        return averageHex;
    }

    /**
     * @param { TileImageData[][] } chunk
     * Receives a chunk in the format of an array. Within the array is a child 
     * array containing image data for a tile. Each child array represents a row.
     * This function deconstructs the chunk, calculates the average colour within
     * each tile, passes through the x and y coordinates of the tile, packages the
     * new data into a chunk, and returns the new chunk.
     */
    static getColorChunkFromImageDataChunk(chunk) {
        const colorChunk = []
        for (let row = 0; row < chunk.length; row++) {
            const colorRow = []
            for (let tile = 0; tile < chunk[row].length; tile++) {
                const tileData = chunk[row][tile];
                const colorHex = ColorAverage.getHexFromImageData(tileData.data);
                const colorData = {
                    hex: colorHex,
                    x: tileData.x,
                    y: tileData.y
                }
                colorRow.push(colorData);
            }
            colorChunk.push(colorRow)
        }
        return colorChunk;
    }
}

/**
 * @Worker
 * Receives a chunk of tile image data, passes it to a function which converts
 * it into a chunk of average color data, and then posts the new chunk back to
 * the main application.
 */
this.onmessage = function(e) {
    const { chunk } = e.data;
    const colorChunk = ColorAverage.getColorChunkFromImageDataChunk(chunk)

    this.postMessage({ colorChunk })
}