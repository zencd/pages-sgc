(function () {
    const aa = document.querySelectorAll('a.ytVideoPLayer1[href*="youtube.com"]');
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
})();
