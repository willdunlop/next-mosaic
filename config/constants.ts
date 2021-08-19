
export const TILE_WIDTH = Number(process.env.NEXT_PUBLIC_TILE_WIDTH) || 16;

export const TILE_HEIGHT = Number(process.env.NEXT_PUBLIC_TILE_HEIGHT) || 16;

export const MAX_IMAGE_WIDTH = 700;

export const MAX_FILE_SIZE = 10485760; // 10MB

export const VALID_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

export enum FileError {
    INCORRECT_FORMAT = "Incorrect file format, please use a png or jpg image",
    TO_LARGE = "Image to large, please use an image that is less then 10MB"
}

