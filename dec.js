function padZeroRight(s, maxLen) {
    while (s.length < maxLen) s += '0';
    return s;
}

function addStrings(str1, str2, doPad, carry) {
    // https://stackoverflow.com/a/48155887/207352
    // if (doPad === undefined) {
    //     doPad = false;
    // }
    const longer = Math.max(str1.length, str2.length);
    if (doPad) {
        str1 = padZeroRight(str1, longer);
        str2 = padZeroRight(str2, longer);
    }
    const str1a = str1.split('').reverse();
    const str2a = str2.split('').reverse();
    let output = '';
    //let carry = false;
    for (let i = 0; i < longer; i++) {
        let result;
        if (str1a[i] && str2a[i]) {
            result = parseInt(str1a[i]) + parseInt(str2a[i]);
        } else if (str1a[i] && !str2a[i]) {
            result = parseInt(str1a[i]);
        } else if (!str1a[i] && str2a[i]) {
            result = parseInt(str2a[i]);
        }

        if (carry) {
            result += 1;
            carry = false;
        }
        if (result >= 10) {
            carry = true;
            output += result.toString()[1];
        } else {
            output += result.toString();
        }
    }
    output = output.split('').reverse().join('');

    if (carry) {
        if (!doPad) {
            output = '1' + output;
        }
    }

    return [output, carry];
}

function longDivision(strNum, intDivisor) {
    // intDivisor = parseInt(intDivisor);

    // log('longDivision', 'strNum', strNum, 'intDivisor', intDivisor);

    if (intDivisor === 0) {
        return ['', Number.NaN];
    }

    const zeroCode = 48; // ('0').charCodeAt(0)

    // As result can be very large store it in string but since we need to modify it very often so using string builder
    let ans = "";

    // We will be iterating the dividend so converting it to char array

    // Initially the carry would be zero
    let idx = 0;
    let temp = strNum[idx] - '0';
    while (temp < intDivisor && idx + 1 < strNum.length) {
        // log('=== loop ===');
        // log('temp', temp);
        // log('intDivisor', intDivisor);
        // log('strNum', strNum);
        // log('idx+1', idx+1)
        const ch = strNum[idx + 1];
        // log('ch', ch);
        temp = temp * 10 + ch.charCodeAt(0) - zeroCode;
        idx += 1;
    }
    idx += 1;

    while (strNum.length > idx) {
        // Store result in answer i.e. temp / divisor
        ans += String.fromCharCode(Math.floor(temp / intDivisor) + zeroCode);
        // Take next digit of number
        temp = ((temp % intDivisor) * 10 + (strNum[idx]).charCodeAt(0) - zeroCode);
        idx += 1;
    }

    ans += String.fromCharCode(Math.floor(temp / intDivisor) + zeroCode);
    const rem = temp % intDivisor;
    // log('temp', temp, 'divisor', intDivisor, 'rem', rem);

    //If divisor is greater than number
    if (ans.length === 0)
        return ["0", strNum];
        // return "0";
    //else return ans
    return [ans, rem];
}

function DecimalNative() {
    return this;
}

function DecimalString(input) {
    if (Array.isArray(input)) {
        this.whole = input[0];
        this.part = input[1];
        return this;
    }

    const dot = input.indexOf('.');
    if (dot >= 0) {
        this.whole = input.substring(0, dot);
        this.part = input.substring(dot + 1);
        return this;
    }

    this.whole = input;
    this.part = '0';
    return this;
}
DecimalString.prototype.add = function (other) {
    const [newPart, partCarry] = addStrings(this.part, other.part, true, false);
    const [newWhole, wholeCarry] = addStrings(this.whole, other.whole, false, partCarry);
    return new DecimalString([newWhole, newPart]);
}
DecimalString.prototype.divInt = function (divisorInt) {
    const [res, rem] = longDivision(this.whole, divisorInt);
    return [
        new DecimalString([res, this.part]),
        new DecimalString([rem, '0'])
    ];
}
DecimalString.prototype.toString = function () {
    let s = this.whole;
    s += (this.part !== "0" ? ("." + this.part) : "");
    return s;
}

function dec(whole, part) {
    return new DecimalString([whole, part]);
}

class BigDecimal {
    // Configuration: constants
    static DECIMALS = 18; // number of decimals on all instances
    static ROUNDED = true; // numbers are truncated (false) or rounded (true)
    static SHIFT = BigInt("1" + "0".repeat(BigDecimal.DECIMALS)); // derived constant
    constructor(value) {
        if (value instanceof BigDecimal) return value;
        let [ints, decis] = String(value).split(".").concat("");
        this._n = BigInt(ints + decis.padEnd(BigDecimal.DECIMALS, "0")
                                     .slice(0, BigDecimal.DECIMALS))
                  + BigInt(BigDecimal.ROUNDED && decis[BigDecimal.DECIMALS] >= "5");
    }
    static fromBigInt(bigint) {
        return Object.assign(Object.create(BigDecimal.prototype), { _n: bigint });
    }
    add(num) {
        return BigDecimal.fromBigInt(this._n + new BigDecimal(num)._n);
    }
    subtract(num) {
        return BigDecimal.fromBigInt(this._n - new BigDecimal(num)._n);
    }
    static _divRound(dividend, divisor) {
        return BigDecimal.fromBigInt(dividend / divisor
            + (BigDecimal.ROUNDED ? dividend  * 2n / divisor % 2n : 0n));
    }
    multiply(num) {
        return BigDecimal._divRound(this._n * new BigDecimal(num)._n, BigDecimal.SHIFT);
    }
    divide(num) {
        return BigDecimal._divRound(this._n * BigDecimal.SHIFT, new BigDecimal(num)._n);
    }
    toString() {
        const s = this._n.toString().padStart(BigDecimal.DECIMALS+1, "0");
        return s.slice(0, -BigDecimal.DECIMALS) + "." + s.slice(-BigDecimal.DECIMALS)
                .replace(/\.?0+$/, "");
    }
}
