/**
 * Authors : Biloni Kim, Donzé Célien & Vorpe Fabien
 * Descrption : utils provide all utilitary functions
*/

/**
 * returns the argument of the highest value in the array
 */
function argMax(array) {
    let argMax = 0;
    let max = array[0]
    for(let i = 1 ; i < array.length ; i++) {
        if(array[i] > max) {
            max = array[i];
            argMax = i;
        }
    }

    return argMax;
}

class Utils {
    static getBarWidth(tab, width, barOffset) {
        var n = tab.length;
        return (width - (n-1)*barOffset) / n;
    }

    static randomNormalizedValues(n = 10) {
        var tab = new Array(n);
        for (let i = 0; i < tab.length; i++) {
            tab[i] = Math.random();
        }
        return tab;
    }
}
