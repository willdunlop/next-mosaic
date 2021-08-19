import * as React from "react";
import { TILE_WIDTH, TILE_HEIGHT } from "../config/constants";
import { TileImageData, ColorData, TileURLData } from "../config/types";
import { splitArrayIntoChunks } from "../config/utils";

export default function useMosaic(canvasRef: React.RefObject<HTMLCanvasElement>) {
    const AVAILABLE_CORES = window.navigator.hardwareConcurrency || 6;
    const API_URL = `http://${window.location.host}`;
    const API_TILE_ENDPOINT = "/api/colour/";

    /**
     * @async @function
     * @param { HTMLImageElement } imageElement
     * The function that is run when the user begins the process of generating a mosaic.
     * Creates a tile sized canvas that is used to scan the image and collect image data.
     * Once image data is collected, workers are dispatched and collect the color average
     * for each tile. The color averages are then used to construct the mosaic.
     */
    async function initiate(imageElement:HTMLImageElement) {
        const tileCanvas = document.createElement('canvas');
        tileCanvas.width = TILE_WIDTH;
        tileCanvas.height = TILE_HEIGHT;
        const tileContext = tileCanvas.getContext("2d");

        if (tileContext) {
            try {
                const allTileRows = scanImageForImageData(imageElement, tileContext)
                const allColorRows = await dispatchWorkersWithChunks(allTileRows)
                constructMosaic(allColorRows)
            } catch (err) {
                console.error(err)
            }
        }
    }

    /**
     * @function
     * @param { HTMLImageElement }          imageElement 
     * @param { CanvasRenderingContext2D }  tileContext 
     * @return { TileImageData[][] }
     * Calculates the number of rows and columns that will be required and scans the provided
     * image to collect image data for each tile. Each row is preserved within its own array 
     * and all of the row arrays are packaged into a parent array which is returned
     */
    function scanImageForImageData(imageElement:HTMLImageElement, tileContext:CanvasRenderingContext2D) {
        const rowCount = Math.ceil(imageElement.height / TILE_HEIGHT);
        const columnCount = Math.ceil(imageElement.width / TILE_WIDTH);
        const allTileRows:TileImageData[][] = []       
        const scanStart = performance.now();

        for (let row = 0; row < rowCount; row++) {
            const tileRow:TileImageData[] = [];

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

        const scanEnd = performance.now();
        const scanPerformance = scanEnd - scanStart;
        console.info(`Image scan was completed in ${scanPerformance} ms`);

        return allTileRows;
    }

    /**
     * @async @function
     * @param { TileImageData[][] } allTileRows 
     * @return { Promise<ColorData[][]> }
     * Divides the collected image data into a number of chunks depending on how many logical cores the user's
     * computer has. Each chunk is then distributed to a worker which will convert the chunk of image data into
     * a chunk of averaged colors. The chunks are then merged back into a full array and returned
     */
    async function dispatchWorkersWithChunks(allTileRows:TileImageData[][]) {
        const tileRowChunks:TileImageData[][][] = splitArrayIntoChunks(allTileRows, AVAILABLE_CORES);
        const colorChunks = [];
        const workersStart = performance.now()
        for (const chunk of tileRowChunks) {
            const colorChunk = await dispatchColourAverageWorker(chunk);
            colorChunks.push(colorChunk);
        }
        const workersEnd = performance.now()
        const workerPerformance = workersEnd - workersStart;
        console.info(`Workers completed tasks in ${workerPerformance} ms`);
        const allColorRows = colorChunks.flat(1);

        return allColorRows
    }

    /**
     * @async
     * @function
     * @param { Promise<TileImageData[][]> } chunk 
     * Will dispatch workers with a provided image data chunk and resolve with a color data chunk.
     */
    async function dispatchColourAverageWorker(chunk:TileImageData[][]) {
        return new Promise<ColorData[][]>((resolve, reject) => {
            const worker = new Worker("/workers/worker.js");
            worker.postMessage({ chunk });
            worker.onmessage = (e) => {
                worker.terminate();
                resolve(e.data.colorChunk)
            }
        })
    }   

    /**
     * @async @function
     * @param { ColorData[][] } rows
     * Fetches the svg tiles from the backend and prepares an entire row. The row is then passed off
     * to a function that renders the results. This performed for each row until it is completed
     */
    async function constructMosaic(rows:ColorData[][]) {
        console.info("Rendering mosaic...");
        const renderStart = performance.now();
        for(let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
            const tileURLRow = await getRowOfSVG(rowIndex, rows);
            renderRow(tileURLRow);
        }
        const renderEnd = performance.now();
        const renderPerformance = renderEnd - renderStart;
        console.info(`Render completed in ${renderPerformance} ms`)
    }

    /**
     * @async @function
     * @param {Number} rowIndex
     * @return { Promise<TileURLData[]> }
     * Loops through all the collected colors in a row. With each tile, a call is made to the server 
     * to fetch a mosaic tile. The tiles are storred in an array that represents one row which is then returned
     */
    async function getRowOfSVG(rowIndex:number, rows:ColorData[][]) {
        const rowData = [];
        for (let tile = 0; tile < rows[rowIndex].length; tile++) {
            const colorData = rows[rowIndex][tile];        
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

    /**
     * @function
     * @param {TileURLData[]} tileURLRow 
     * Uses an efficient for loop to quickly render an entire row of tiles to the canvas element. It also
     * releases the svg URL that was created using a blob.
     */
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

    return { initiate }
}