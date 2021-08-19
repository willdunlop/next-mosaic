interface PositionData {
    x: number;
    y: number
}

export interface TileImageData extends PositionData {
    data: ImageData;
}

export interface ColorData extends PositionData {
    hex: string;
}

export interface TileURLData extends PositionData {
    url: string;
}