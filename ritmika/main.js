function youtubeLink(clipId, offset) {
	return "https://www.youtube.com/watch?v=" + clipId + '&t=' + hmsToSeconds(offset);
}

function hmsToSeconds(str) {
    var p = str.split(':'), s = 0, m = 1;
    while (p.length > 0) {
        s += m * parseInt(p.pop(), 10);
        m *= 60;
    }
    return s;
}

(function () {
	const MAX_UPDATE_ITEMS = 3;
	$('a[data-offset]').each(function(i, $a) {
		const clipId = $a.parentNode.parentNode.getAttribute('data-clip');
		const offset = $a.getAttribute('data-offset');
		if (offset) {
			$a.setAttribute("href", youtubeLink(clipId, offset));
			$($a).addClass("audioPlayer");
			var text = $($a).text();
			var unrec = text.indexOf("RG") >= 0 || text.indexOf("(?)") >= 0;
			if (unrec) {
				$($a).addClass("unrecognized");
			} else {
				$($a).addClass("recognized");
			}
		}
	});
	$('a[href=""]').each(function(i, $a) {
		// prevent click on the anchors with missing audio
		$a.addEventListener('click', function(e) {
			e.preventDefault();
		});
	});
	var $updateList = document.querySelector('#updateList');
	var $shower = document.querySelector('#updateShower');
	var $hidden = document.querySelector('#updateHiddenArea');
	var $updateListAllChildren = $updateList.children;
	var i = 0;
	for (; i < $updateListAllChildren.length; i++) {
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
})();
