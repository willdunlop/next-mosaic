/**
 * @param { any[] } array 
 * @param { number } parts
 * @return { any[][] }
 * Receives an array of data and sperates it into a given amount of sub arrays.
 * The sub arrays arte then packaged into a parent array and returned
 */
export function splitArrayIntoChunks(array:any[], parts:number) {
    let result = [];
    for (let i = parts; i > 0; i--) {
        result.push(array.splice(0, Math.ceil(array.length / i)));
    }

    return result;
}