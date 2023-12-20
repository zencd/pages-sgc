// https://developers.google.com/youtube/iframe_api_reference
function YoutubeSinglePlayer(videoElem) {
    const yspThis = this;
    this.player = null;
    this.onReady = null;
    this.onStateChange = null;
    this.loadById = function (videoId) {
        function onYouTubeIframeAPIReady() {
            console.log('onYouTubeIframeAPIReady...');
            yspThis.player = new window.YT.Player(videoElem, {
                videoId: videoId,
                events: {
                    'onReady': function () {
                        if (yspThis.onReady) yspThis.onReady();
                    },
                    'onStateChange': function (event) {
                        if (yspThis.onStateChange) yspThis.onStateChange(event);
                    }
                },
                playerVars: {autoplay: 1}
            });
            // console.log('player created', yspThis.player);
            // console.log('player.loadVideoById', yspThis.player.loadVideoById);
        }

        if (yspThis.player) {
            // console.log('case 1');
            // console.log('player.loadVideoById', yspThis.player.loadVideoById);
            yspThis.player.loadVideoById(videoId);
        } else if (typeof window.YT !== 'undefined') {
            // YT code maybe loaded already (by some other code)
            // so the callback won't be invoked - do it manually
            // console.log('case 2');
            // console.log('window.YT', window.YT);
            onYouTubeIframeAPIReady();
            // XXX implicitly loading video is not needed because of 1) autoplay 2) method `loadVideoById` binds later
            // yspThis.player.loadVideoById(videoId);
        } else {
            console.log('case 3');
            if (!window.onYouTubeIframeAPIReady) { // this if can be removed
                // console.log('setting window.onYouTubeIframeAPIReady');
                // console.log('  existing window.onYouTubeIframeAPIReady:', window.onYouTubeIframeAPIReady);
                // console.log('  existing window.YT', typeof window.YT);
                window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
            }

            const youtubeScriptId = 'youtube-api-script-xaqdlrwqglw';
            const youtubeScript = document.getElementById(youtubeScriptId);
            if (youtubeScript === null) {
                const tag = document.createElement('script');
                const firstScript = document.getElementsByTagName('script')[0];
                tag.src = 'https://www.youtube.com/iframe_api';
                tag.id = youtubeScriptId;
                firstScript.parentNode.insertBefore(tag, firstScript);
            }
        }
    };

    return this;
}
