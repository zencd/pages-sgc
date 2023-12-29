(function () {
})();

(function () {
    const log = console.log
    const $pageContent = document.getElementById('pageContent')
    const $pageSpecificStyle = document.getElementById('pageSpecificStyle')
    function setupYoutubeVideoPlayerLinks(root) {
        const aa = root.querySelectorAll('a.ytVideoPLayer1[href*="youtube.com"]');
        [].forEach.call(aa, function (a) {
            const yid = a.getAttribute('data-yid')
            a.addEventListener('click', function (e) {
                e.preventDefault();
                const iframe = document.createElement('iframe')
                iframe.setAttribute('class', 'ytVideoPLayer2')
                iframe.setAttribute('width', '590')
                iframe.setAttribute('height', '351')
                iframe.setAttribute('src', 'https://www.youtube-nocookie.com/embed/' + yid + '?autoplay=1')
                iframe.setAttribute('title', 'YouTube video player')
                iframe.setAttribute('frameborder', '0')
                iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share')
                iframe.setAttribute('allowfullscreen', '')
                a.parentNode.insertBefore(iframe, a)
                a.parentNode.removeChild(a)
            }, false);
        });
    }
    function setupInternalLinks(root) {
        const aa = root.querySelectorAll('a');
        [].forEach.call(aa, function (a) {
            const matches = !a.classList.contains('audioPlayer') &&
                !a.classList.contains('ytVideoPLayer1') &&
                a.getAttribute('target') != '_blank' &&
                a.getAttribute('href').startsWith('/')
            //log('a', a.classList.contains('audioPlayer'))
            if (matches) {
                a.addEventListener('click', function (e) {
                    e.preventDefault();
                    loadPage(a.getAttribute('href'), true)
                }, false);
            }
        });
    }
    function findSubstring(text, startPattern, endPattern) {
        const i1 = text.indexOf(startPattern)
        if (i1 < 0) return ''
        const i2 = text.indexOf(endPattern, i1 + startPattern.length)
        if (i2 < 0) return ''
        return text.substring(i1 + startPattern.length, i2)
    }
    async function loadPage(url, doPushState) {
        console.log('loadPage', url)
        const resp = await fetch(url)
        const text = await resp.text()
        const pageContent = findSubstring(text, '<!-- pageContent begin -->', '<!-- pageContent end -->')
        if (!pageContent) {
            alert("Failed loading " + url)
            return
        }
        const title = findSubstring(text, '<title>', '</title>')
        $pageContent.innerHTML = pageContent
        if (title) {
            document.title = title
        }
        if (doPushState) {
            window.history.pushState({}, null, url);
        }
        setupInternalLinks($pageContent)
        setupYoutubeVideoPlayerLinks($pageContent)
        setupYoutubeAudioPlayerLinks($pageContent, window.g_uiPlayer)
        const bgStyle = findSubstring(text, '<style id="pageSpecificStyle">', '</style>')
        if (bgStyle) {
            //log('bgStyle', bgStyle)
            $pageSpecificStyle.innerText = bgStyle
        }
    }

    //console.log('replaceState', '')
    //window.history.replaceState({}, null, '');

    window.onpopstate = (e) => {
        loadPage(window.location.pathname, false)
    }

//    window.onpopstate = function(e) {
//        //console.log('e.state', e.state)
//        //console.log('window.location.pathname', window.location.pathname)
//        loadPage(window.location.pathname)
//        if (e.state) {
//            //document.getElementById("content").innerHTML = e.state.html;
//            //document.title = e.state.pageTitle;
//        }
//    };

    setupInternalLinks(document)
    setupYoutubeVideoPlayerLinks(document)
})();
