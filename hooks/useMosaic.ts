import * as React from "react";
import { TILE_WIDTH, TILE_HEIGHT } from "../config/constants";
import { TileImageData, ColorData, TileURLData } from "../config/types";

export default function useMosaic(canvasRef: React.RefObject<HTMLCanvasElement>) {
    // @TODO: Inline comments
    // @TODO: This needs a better name
    const [rows, setRows] = React.useState<ColorData[][]>([])
    const AVAILABLE_THREADS = window.navigator.hardwareConcurrency || 8;
    const API_URL = `http://${window.location.host}`;
    const API_TILE_ENDPOINT = "/api/colour/";

    React.useEffect(() => {
        if (rows.length > 0) {
            constructMosaic()
        }
    }, [rows]);

    /**
     * @async @function
     * Fetches the svg tiles from the backend and prepares an entire row. The row is then passed off
     * to a function that renders the results
     */
    async function constructMosaic() {
        for(let row = 0; row < rows.length; row++) {
            const tileURLRow = await getRowOfSVG(row);
            renderRow(tileURLRow);
        }
    }

    /**
     * @async @function
     * @param {Number} rowNumber
     * @return {TileURLData[]}
     * Loops through all the collected colors in a row. With each tile, a call is made to the server 
     * to fetch a mosaic tile. The tiles are storred in an array that represents one row which is then returned
     */
    async function getRowOfSVG(rowNumber:number) {
            const rowData = [];
            for (let tile = 0; tile < rows[rowNumber].length; tile++) {
                const colorData = rows[rowNumber][tile]
                
                const response = await fetch(`${API_URL}${API_TILE_ENDPOINT}${colorData.hex}`);
                const svgString = await response.text();

                const svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
                const svgURL = window.URL.createObjectURL(svgBlob);
                const data:TileURLData = {
                    url: svgURL,
                    x: colorData.x,
                    y: colorData.y
                }
                rowData.push(data);
            };
            return rowData;
    }

    function renderRow(tileURLRow:TileURLData[]) {
        if (canvasRef.current) {
            const context = canvasRef.current.getContext("2d");
            for (let index = 0; index < tileURLRow.length; index++) {
                const svgImage = new Image();
                const data = tileURLRow[index];
                svgImage.onload = () => {
                    if (context) {
                        context.drawImage(svgImage, data.x, data.y);
                        window.URL.revokeObjectURL(data.url);
                    }
                }
                svgImage.src = data.url;
            }
        }
    }


    async function initiate(imageElement:HTMLImageElement) {
        console.dir(imageElement)
        const tileCanvas = document.createElement('canvas');
        tileCanvas.width = TILE_WIDTH;
        tileCanvas.height = TILE_HEIGHT;
        const tileContext = tileCanvas.getContext("2d");

        if (tileContext) {
            const allTileRows = scanImageForImageData(imageElement, tileContext)
            const allColorRows = await dispatchWorkersWithChunks(allTileRows)
            setRows(allColorRows);
        }


    }

    function splitArrayIntoChunks(array:any[], amount:number) {
        const chunks = [];
        let i = 0;
        while (i < array.length) {
          chunks.push(array.slice(i, i += amount));
        }
        return chunks;
      }

      //todo: consider workers for this as well
    function scanImageForImageData(imageElement:HTMLImageElement, tileContext:CanvasRenderingContext2D) {
        const rowCount = Math.ceil(imageElement.height / TILE_HEIGHT);
        const columnCount = Math.ceil(imageElement.width / TILE_WIDTH);
        const allTileRows:TileImageData[][] = []
        console.time("ImageScan")
        for (let row = 0; row < rowCount; row++) {
            const tileRow:TileImageData[] = []
            for(var col = 0; col < columnCount; col++){
                const positionX = col * TILE_WIDTH;
                const positionY = row * TILE_HEIGHT;
                tileContext.drawImage(imageElement, positionX, positionY, TILE_WIDTH, TILE_HEIGHT, 0, 0, TILE_WIDTH, TILE_HEIGHT)
                const tileImageData = tileContext.getImageData(0 ,0, TILE_WIDTH, TILE_HEIGHT);
                const tile = {
                    data: tileImageData,
                    x: positionX,
                    y:positionY
                }
                tileRow.push(tile);
            }
            allTileRows.push(tileRow);
        }
        console.timeEnd("ImageScan")
        console.log("allTileRows", allTileRows);

        return allTileRows;
    }

    async function dispatchWorkersWithChunks(allTileRows:TileImageData[][]) {
        const tileRowChunks:TileImageData[][][] = splitArrayIntoChunks(allTileRows, AVAILABLE_THREADS);

        const colorChunks = [];
        console.time("workers")
        for (const chunk of tileRowChunks) {
            const colorChunk = await dispatchColourAverageWorker(chunk);
            colorChunks.push(colorChunk);
        }
        console.timeEnd("workers")
        console.log("colorChunks", colorChunks)

        const allColorRows = colorChunks.flat(1);
        console.log("allColorRows", allColorRows)

        return allColorRows
    }


    function dispatchColourAverageWorker(chunk:TileImageData[][]) {
        return new Promise<ColorData[][]>((resolve, reject) => {
            const worker = new Worker("/workers/worker.js");
            worker.postMessage({ chunk });
            worker.onmessage = (e) => {
                worker.terminate();
                resolve(e.data.colorChunk)
            }
                
        })

    }


    return { initiate }
}