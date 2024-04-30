function youtubeLink(clipId, hms) {
	return "https://www.youtube.com/watch?v=" + clipId + '&t=' + hmsToSeconds(hms) + 's';
}

function hmsToSeconds(str) {
    var p = str.split(':'), s = 0, m = 1;
    while (p.length > 0) {
        s += m * parseInt(p.pop(), 10);
        m *= 60;
    }
    return s;
}

function prepareAudioLinks() {
	document.querySelectorAll('a[data-offset]').forEach(function($a) {
		const clipId = $a.parentNode.parentNode.getAttribute('data-clip');
		const hms = $a.getAttribute('data-offset');
		if (hms) {
			$a.setAttribute("href", youtubeLink(clipId, hms));
			$a.classList.add("audioPlayer");
			var text = $a.innerText;
			var unrec = text.indexOf("RG") >= 0 || text.indexOf("(?)") >= 0;
			if (unrec) {
				$a.classList.add("unrecognized");
			} else {
				$a.classList.add("recognized");
			}
		}
	});
}

function actualizeListOfUpdates() {
	const MAX_UPDATE_ITEMS = 3;
	var $updateList = document.querySelector('#updateList');
	var $shower = document.querySelector('#updateShower');
	var $updateListAllChildren = $updateList.children;
	var i = 0;
	for ( ; i < $updateListAllChildren.length; i++) {
		var $child = $updateListAllChildren[i];
		if (i >= MAX_UPDATE_ITEMS && $child.getAttribute('id') !== 'updateShower') {
			$child.style.display = 'none'
		}
	}
	if (i >= MAX_UPDATE_ITEMS) {
		$shower.style.display = 'list-item'
	}
	$shower.addEventListener('click', function(e) {
		e.preventDefault();
		for (var i = 0; i < $updateListAllChildren.length; i++) {
			var $child = $updateListAllChildren[i];
			$child.style.display = 'block'
		}
		$shower.style.display = 'none'
	});
}

(function () {
	try {
	prepareAudioLinks();
	actualizeListOfUpdates();
	} catch (e) {
		console.log('' + e)
		for (var prop in e)  {  
			console.log("property: "+ prop+ "\n    value: ["+ e[prop]+ "]\n");
		}
		alert('' + e.stack)
		// alert('' + e)
	}
})();
