/** Base 16. */
const BASE16 = "0123456789ABCDEF";
/** Base 54, same as base 62 (0-9a-zA-Z) without characters '0oO1iIlL'. */
const BASE54 = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ';
const BASE63 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.';
const BASE10 = '0123456789';
class CodeGenerator{
    static getBase16(){
        return (BASE16);
    }
    static getBase54(){
        return (BASE54);
    }
    static getBase63(){
        return (BASE63);
    }
    static getBase10(){
        return (BASE10);
    }
    /**
     * Convert a number from any base to any other base.
     * @param int|string value The number to convert.
     * @param string inDigits The input base's digits.
     * @param string outDigits The output base's digits.
     * @return string The converted number.
     * @throws Exception If a digit is outside the base.
    */
    static convertBase(value, inDigits, outDigits){
        return new Promise((resolve, reject) => {
            var inBase = inDigits.length;
            var outBase = outDigits.length;
            var decimal = '0';
            var level = 0;
            var result = '';
            value.trim();
            var signe = (value[0] === '-') ? '-' : '';
            //value = ltrim(value, '-0');
            var len = value.length;
            //resolve(value);
            if (len >= 10 && inBase > 10){
                throw new Error("To large input hash length !");
            }
            for (var k=0; k<len; k++){
                let new_value = inDigits.indexOf(value[len - 1 - k]);
                // console.log("new "+new_value);
                // console.log("k "+k);
                // console.log("pow "+Math.pow(inBase, k));
                if (new_value === false)
                    throw new Error("Mauvais caractère trouvé en entrée !");
                if (new_value >= inBase)
                    throw new Error("Mauvais caractère trouvé en entrée !");
                decimal = parseInt(decimal) + (Math.pow(inBase, k) * new_value);
                //resolve(decimal)
            }
            if (outBase == 10){
                resolve(signe + decimal);
            }else{
                while (decimal > Math.pow(outBase, level++)){
                    // console.log("pow "+Math.pow(outBase, level))
                    // console.log("level "+level)
                }
                for (var i = (level - 2); i >= 0; i--) { 
                    // console.log("decimal "+decimal)
                    // console.log("i "+i)
                    let factor = Math.pow(outBase, i);
                    // console.log("factor "+factor)
                    let number = decimal/factor;
                    // console.log("number "+parseInt(number))
                    decimal = decimal%factor;
                    // console.log("char "+outDigits[parseInt(number)]);
                    result += outDigits[parseInt(number)];
                }
                result = result == '' ? '0' : result;
                resolve(signe + result);
            }
        });
    }
}

exports.default = CodeGenerator;