export const arrayToPostgres = <T>(array: T[]) : string => {
    let out : string = "{ ";
    const l : number = array.length;
    let i : number = 0;
    for (i; i < (l - 1); i++) {
        out += `${array[i]} , `; 
    }
    out += `${array[i]} }`;
    return out;
} 