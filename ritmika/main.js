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
	// console.log('ritmika.html js started')
	$('a[data-offset]').each(function(i, $a) {
		const clipId = $a.parentNode.parentNode.getAttribute('data-clip');
		const offset = $a.getAttribute('data-offset');
		if (offset) {
			$a.setAttribute("href", youtubeLink(clipId, offset));
			$($a).addClass("audioPlayer");
			var text = $($a).text();
			if (text.indexOf("RG") < 0 && text.indexOf("Недзвецкий") < 0 && text.indexOf("(?)") < 0) {
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
})();