function assert(expr, msg) {
    if (!expr) throw msg;
}

function padZeroRight(s, maxLen) {
    while (s.length < maxLen) s += '0';
    return s;
}

function addStrings(str1, str2, doPad, carry) {
    // https://stackoverflow.com/a/48155887/207352
    // if (doPad === undefined) {
    //     doPad = false;
    // }
    // log('addStrings: str1:', str1, 'str2:', str2);
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
    const newPartAndPartCarry = addStrings(this.part, other.part, true, false);
    const newPart = newPartAndPartCarry[0],
          partCarry = newPartAndPartCarry[1];
    const newWholeAndWholeCarry = addStrings(this.whole, other.whole, false, partCarry);
    const newWhole = newWholeAndWholeCarry[0],
          wholeCarry = newWholeAndWholeCarry[1];
    return dec(newWhole, newPart);
}
DecimalString.prototype.divInt = function (divisorInt) {
    const resAndRem = longDivision(this.whole, divisorInt);
    const res = resAndRem[0],
          rem = resAndRem[1];
    return [dec(res, this.part), rem];
}
DecimalString.prototype.mul = function (other) {
    let big = BigInt(this.whole) * BigInt(other.whole);
    return dec(big.toString());
}
DecimalString.prototype.toString = function () {
    let s = this.whole;
    if (this.part !== "0") {
        s += '.' + this.part;
    }
    return s;
}

function dec(whole, part) {
    if (typeof whole === 'string') {
        const dot = whole.indexOf('.');
        if (dot >= 0) {
            const whole2 = whole.substring(0, dot);
            let part2 = whole.substring(dot + 1);
            part2 = part2 === '' ? '0' : part2;
            return new DecimalString([whole2, part2]);
        }
    }

    whole = (typeof whole === "number") ? whole.toString() : whole;

    part = (part === undefined) ? '0' : part;

    return new DecimalString([whole, part]);
}
