class ColorAverage {

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

    static rgbToHex(r, g, b) {
        return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    static rgbToBuffer(r, g, b) {
        const rHex = ColorAverage.intToHex(r);
        const gHex = ColorAverage.intToHex(g);
        const bHex = ColorAverage.intToHex(b);

        return new Uint8Array([ rHex, gHex, bHex ]).buffer;
    }

    static buf2hex(buffer) { // buffer is an ArrayBuffer
        return [...new Uint8Array(buffer)]
            .map(x => x.toString(16).padStart(2, '0'))
            .join('');
      }

    static intToHex(integer) {
        let number = (+integer).toString(16).toUpperCase()
        if( (number.length % 2) > 0 ) { number= "0" + number }
        return number
  }

    static getHexFromImageData(imageData) {
        const color = ColorAverage.getAverageRGB(imageData);
        const averageHex = ColorAverage.rgbToHex(color.r, color.g, color.b)
        return averageHex;
    }

    static getBufferFromImageData(imageData) {
        const color = ColorAverage.getAverageRGB(imageData);
        const buffer = (this.rgbToBuffer(color.r, color.g, color.b))
        return buffer;
    }

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

    static getBufferChunkFromImageDataChunk(chunk) {
        const bufferChunk = []
        for (let row = 0; row < chunk.length; row++) {
            const bufferRow = []
            for (let tile = 0; tile < chunk[row].length; tile++) {
                const buffer = ColorAverage.getBufferFromImageData(chunk[row][tile]);
                bufferRow.push(buffer);
            }
            bufferChunk.push(bufferRow)
        }
        return bufferChunk;

    }

}


this.onmessage = function(e) {
    // this.postMessage({ color });
    const { chunk } = e.data;
    const colorChunk = ColorAverage.getColorChunkFromImageDataChunk(chunk)
    // const bufferChunk = ColorAverage.getBufferChunkFromImageDataChunk(chunk)

    this.postMessage({ colorChunk })
    // this.postMessage({ bufferChunk },  [ bufferChunk ])
}