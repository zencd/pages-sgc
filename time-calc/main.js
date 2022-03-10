const log = console.log;
const $timeEdit = document.getElementById('time-edit');
const $totalTime = document.getElementById('total-time');
const $grunLink = document.getElementById('grun-link');
const $permLink = document.getElementById('perm-link');
const $segmentedTimes = document.getElementById('segmented-times');
const $saveBtn = document.getElementById('save-btn');
const $copyInput = document.getElementById('copy-input');
const $grunLink2 = document.getElementById('grun-link-2');
let gPermUrl = '';
let gGrunUrl = '';
const gSiteTitle = 'Time Calculator';

const placeholderMultiLine = "Example:\n\n" +
"1:59 Paris\n" +
"1234:59:59.999 Sapienza";

const placeholderSafari = "01:59 Example";

const placeholder = isSafari() ? placeholderSafari : placeholderMultiLine;

const isMac = window.navigator.platform.match("Mac");

function isSafari() {
	return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

function encode_ascii85(a) {
  var b, c, d, e, f, g, h, i, j, k;
  for (!/[^\x00-\xFF]/.test(a), b = "\x00\x00\x00\x00".slice(a.length % 4 || 4), a += b, 
  c = [], d = 0, e = a.length; e > d; d += 4) f = (a.charCodeAt(d) << 24) + (a.charCodeAt(d + 1) << 16) + (a.charCodeAt(d + 2) << 8) + a.charCodeAt(d + 3), 
  0 !== f ? (k = f % 85, f = (f - k) / 85, j = f % 85, f = (f - j) / 85, i = f % 85, 
  f = (f - i) / 85, h = f % 85, f = (f - h) / 85, g = f % 85, c.push(g + 33, h + 33, i + 33, j + 33, k + 33)) :c.push(122);
  return function(a, b) {
    for (var c = b; c > 0; c--) a.pop();
  }(c, b.length), "<~" + String.fromCharCode.apply(String, c) + "~>";
}

function decode_ascii85(a) {
  var c, d, e, f, g, h = String, l = "length", w = 255, x = "charCodeAt", y = "slice", z = "replace";
  for ("<~" === a[y](0, 2) && "~>" === a[y](-2), a = a[y](2, -2)[z](/\s/g, "")[z]("z", "!!!!!"), 
  c = "uuuuu"[y](a[l] % 5 || 5), a += c, e = [], f = 0, g = a[l]; g > f; f += 5) d = 52200625 * (a[x](f) - 33) + 614125 * (a[x](f + 1) - 33) + 7225 * (a[x](f + 2) - 33) + 85 * (a[x](f + 3) - 33) + (a[x](f + 4) - 33), 
  e.push(w & d >> 24, w & d >> 16, w & d >> 8, w & d);
  return function(a, b) {
    for (var c = b; c > 0; c--) a.pop();
  }(e, c[l]), h.fromCharCode.apply(h, e);
}

function encodeB64(str) {
	const meta = '';
	return [meta, btoa(unescape(encodeURIComponent(str)))];
}

function decodeB64(b64) {
	const colon = b64.indexOf(':');
	if (colon >= 0) {
		b64 = b64.substring(colon + 1);
	}
	return decodeURIComponent(escape(window.atob(b64)));
}

function pluralize(noun, count) {
	return count === 1 ? noun : noun + 's';
}

function hmsToSeconds(hmsMillis) {
	var hms = hmsMillis;
	var dot = hms.indexOf('.');

	var decimalMillis = dec(0);
	if (dot >= 0) {
		hms = hmsMillis.substring(0, dot);
		decimalMillis = dec('0' + hmsMillis.substring(dot));
	}

	const words = hms.split(/:/);
	let totalSecDec = dec(0);
	for (let i in words) {
		const word = words[i];
		const mulInt = Math.pow(60, words.length - i - 1);
		const additionDec = (mulInt === 1) ? dec(word) : dec(word).mul(dec(mulInt.toString()));
		totalSecDec = totalSecDec.add(additionDec);
	}
	totalSecDec = totalSecDec.add(decimalMillis);
	return totalSecDec;
}

function decToHms(secs) {
	const hoursAndSecRem = secs.divInt(3600);
	const hours = hoursAndSecRem[0],
	      secRem = hoursAndSecRem[1];
	const minutesAndSeconds = dec(secRem.toString()).divInt(60);
	const minutes = minutesAndSeconds[0],
	      seconds = minutesAndSeconds[1];
	const hoursPresented = hours.whole !== '0';
	let s = '';

	// hours
	if (hoursPresented) {
		s += hours.whole + ':';
	}

	// minutes
	if (minutes.whole !== '0' || hoursPresented) {
		s = (minutes.whole.length === 1 && hoursPresented) ? (s + '0') : s;
		s += minutes.whole + ':';
	}

	// seconds
	s = (s && seconds < 10) ? s + '0' : s;
	s += seconds;

	if (secs.part !== '0') {
		s += '.' + secs.part;
	}

	// log('decToHms: ', secs.toString(), '=>', s);
	return s;
}

function toHms(secs) {
	//log('secs.constructor.name', secs.constructor.name);
	//assert(secs.constructor.name === 'DecimalString', 'expecting a DecimalString');
	return decToHms(secs);
}

function makeGrunUrl(timeAndLabel) {
	if (timeAndLabel.length === 0) {
		return null;
	}
	var query = '';
	for (var i = 0; i < timeAndLabel.length; i++) {
		if (i > 0) {
			query += '&';
		}
		const secStr = toHms(timeAndLabel[i][0]);
		const label = timeAndLabel[i][1];
		query += 't' + (i+1) + '=' + secStr;
		query += '&c' + (i+1) + '=' + encodeURIComponent(label);
	}
	return 'http://www.grun1.com/utils/timeCalc.html?' + query;
}

function makeTitle(rowTitle, numSplits, totalHms) {
	let pageTitle = '';
	if (numSplits > 0) {
		if (rowTitle) {
			pageTitle = rowTitle;
			if (numSplits > 1) {
				pageTitle += ' +' + (numSplits - 1);
			}
		} else {
			pageTitle = numSplits + pluralize(' split', numSplits);
		}
		pageTitle += ', ' + totalHms;
		pageTitle += ' - ';
	}
	pageTitle += gSiteTitle;
	return pageTitle;
}

function recalcTime(timeText, isOnLoad) {
	const lines = timeText.split(/\r?\n/);
	// var totalSeconds = new Decimal('0');
	var totalSeconds = dec(0);
	var segmentTotal = dec(0);
	const timeAndLabel = [];
	const segmentTimes = [];
	let firstValidTitle = '';
	var numSplits = 0;
	// log('1 totalSeconds', totalSeconds.toString());
	for (i in lines) {
		var line = lines[i];
		line = line.trim();
		if (!line && segmentTotal > 0) {
			segmentTimes.push(segmentTotal);
			segmentTotal = dec(0);
			continue;
		}
		// const m = line.match(/^\s*(\d[0-9:]*(\.\d+)?)(\s*(.+))?$/);
		const m = line.match(/^(\d+(:\d+){0,2}(\.\d+)?)(.*)$/);
		if(m) {
			// log(m);
			const timeHms = m[1];
			const lineLabel = (m[4] !== undefined) ? m[4].trim() : '';
			const lineSec = hmsToSeconds(timeHms);
			// log('totalSeconds was:', totalSeconds.toString());
			totalSeconds = totalSeconds.add(lineSec);
			// log('addition:', lineSec.toString());
			// log('totalSeconds now:', totalSeconds.toString());
			segmentTotal = segmentTotal.add(lineSec);
			numSplits += 1;
			timeAndLabel.push([lineSec, lineLabel]);
			if (lineLabel && !firstValidTitle) {
				firstValidTitle = lineLabel;
			}
		}
	}
	if (segmentTotal > 0) {
		segmentTimes.push(segmentTotal);
		// segmentTotal = 0;
	}

	// log('segmentTotal', segmentTotal.toString());
	// log('totalSeconds', totalSeconds.toString());

	if (segmentTimes.length > 1) {
		const text = segmentTimes.map(function(t) {return toHms(t)}).join(" + ");
		$segmentedTimes.innerHTML = '= ' + text;
	} else {
		$segmentedTimes.innerHTML = 'total';
	}

	// log('2 totalSeconds', totalSeconds.toString());

	const grunUrl = makeGrunUrl(timeAndLabel);
	const totalHms = decToHms(totalSeconds);
	$totalTime.innerHTML = totalHms;
	
	// log('totalSeconds.toString:', totalSeconds.toString());
	// log('totalSeconds.toFixed:', totalSeconds.toFixed(0));
	// log('totalHms:', totalHms, typeof totalHms);

	gGrunUrl = grunUrl;
	$grunLink.setAttribute('href', grunUrl ? grunUrl : '');
	$grunLink2.setAttribute('href', grunUrl ? grunUrl : '');

	document.title = makeTitle(firstValidTitle, numSplits, totalHms);
}

function updateUrl(timeText) {
	const metaAndB64 = encodeB64(timeText);
	const meta = metaAndB64[0],
	      b64 = metaAndB64[1];
	let url = document.location.protocol + '//' + document.location.host + document.location.pathname;
	if (b64) {
		url += '#' + meta + ':' + b64;
	}
	gPermUrl = url;
	$permLink.setAttribute('href', url);
	$saveBtn.setAttribute('href', url);
	window.history.replaceState({} , gSiteTitle, url);
}

function changeTimeEditSize() {
  $timeEdit.style.height = "auto";
  $timeEdit.style.height = $timeEdit.scrollHeight + "px";
}

function readTimeTextFromUrl() {
	var val = document.location.hash;
	val = (val && val.indexOf('#') === 0) ? val.substring(1) : '';
	return val ? decodeB64(val) : val;
}

function onSaveButton(e) {
	const anyMod = e.metaKey || e.shiftKey || e.ctrlKey || e.altKey;
	if (anyMod) {
		return;
	}
	e.preventDefault();
	$copyInput.value = gPermUrl;
	$copyInput.select();
	document.execCommand('copy');
	$timeEdit.focus();
}

function onLoad() {
	// Decimal.set({precision: 128});
	// Decimal.set({ defaults: true });

	// const long = new Decimal('1111111111111111111111');
	// log('toString()', long.toString());
	// log('toFixed(0)', long.toFixed(0));

	// log('hmsToSeconds:', hmsToSeconds('60:59.001'));
	// log('hmsToSeconds:', hmsToSeconds('1111111111111111111111'));
	// log('toHms:', decToHms(dec('123')));
	// log('toHms:', decToHms(dec('111111111111111111111111111')));
	// return;
	// return;
	// return;

	//const urlParams = new URLSearchParams(window.location.search);
	$timeEdit.focus();

	const textPlain = readTimeTextFromUrl();
	$timeEdit.value = textPlain;
	recalcTime(textPlain, true);
	if (textPlain) {
		updateUrl(textPlain);
	}
	changeTimeEditSize();

	$timeEdit.addEventListener('input', function(e) {
		const timeText = $timeEdit.value;
		recalcTime(timeText, false);
		updateUrl(timeText);
		changeTimeEditSize();
	}, false);

	$saveBtn.addEventListener("click", onSaveButton, false);

	document.addEventListener("keydown", function (e) {
		if ((isMac ? e.metaKey : e.ctrlKey) && (e.key === 's' || e.keyCode === 83)) {
			// ctrl+s
			log('e.key', e.key);
			e.preventDefault();
		}
	}, false);

	$timeEdit.setAttribute('placeholder', placeholder);
}
