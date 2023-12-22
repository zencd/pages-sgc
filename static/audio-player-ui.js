// function isLeftMouseButton(evt) {
//     if ("buttons" in evt) {
//         return evt.buttons == 1;
//     }
//     var button = evt.which || evt.button;
//     return button == 1;
// }

/**
 * Audio player with UI.
 * @param playerElem player's UI root element
 * @param videoElem element to be replaced with YT iframe
 * @returns {UiPlayer}
 * @constructor
 */
function UiPlayer(playerElem, videoElem) {
    const self = this;
    const PROGRESS_BAR_TIMEOUT = 60;

    const progressBarParent = playerElem.querySelector('.player-bar-seek');
    const progressElem = playerElem.querySelector('.player-bar-progress');
    const playImage = playerElem.getAttribute('data-button-play');
    const pauseImage = playerElem.getAttribute('data-button-pause');

    const ysp = YoutubeSinglePlayer(videoElem);
    this.ysp = ysp;
    ysp.onPlaying = onPlaying
    ysp.onPaused = onPaused
    ysp.onEnded = onEnded

    const newScriptTag = document.createElement('script');
    newScriptTag.src = "https://www.youtube.com/player_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(newScriptTag, firstScriptTag);
    let updateProgressInterval = null;
    const playButton = playerElem.querySelector('.play-button');
    const closeButton = playerElem.querySelector('.close-button');
    self.playerTitle = playerElem.querySelector('.player-bar-title');

    playButton.setAttribute('src', playImage);

    self.currentId = null;

    function updateProgressBar(perc) {
        if (typeof perc !== 'undefined') {
            // keep perc
        } else if (ysp.player) {
            perc = (ysp.player.getCurrentTime() / ysp.player.getDuration()) * 100;
        } else {
            perc = 0;
        }
        progressElem.style.width = perc + '%';
    }

    playButton.addEventListener("click", function () {
        if (ysp.player) {
            if (ysp.playing) {
                ysp.pause()
                playButton.setAttribute('src', playImage);
            } else {
                ysp.play()
                playButton.setAttribute('src', pauseImage);
            }
        }
    });
    closeButton.addEventListener("click", function () {
        playerElem.style.display = 'none';
        if (ysp.player) {
            ysp.stop()
        }
    });

    function startThreadUpdateProgressBar() {
        updateProgressInterval = setInterval(updateProgressBar, PROGRESS_BAR_TIMEOUT);
    }

    function onPlaying(event) {
        playButton.setAttribute('src', pauseImage);
        clearInterval(updateProgressInterval);
        startThreadUpdateProgressBar();
        // todo const percent = timeOffset / ysp.player.getDuration() * 100
        // todo updateProgressBar(percent);
    }

    function onPaused(event) {
        playButton.setAttribute('src', playImage);
        clearInterval(updateProgressInterval);
    }

    function onEnded(event) {
        playButton.setAttribute('src', playImage);
        clearInterval(updateProgressInterval);
    }

    function onProgressBarClick(e) {
        if (ysp.player) {
            const ratio = e.offsetX / progressBarParent.offsetWidth;
            const newTime = ysp.player.getDuration() * ratio;
            updateProgressBar(ratio * 100);
            ysp.player.seekTo(newTime);
        }
    }

    progressBarParent.addEventListener('mouseup', onProgressBarClick, false);
    progressBarParent.addEventListener('touchend', onProgressBarClick, false);

    this.loadClip = function (clipId, timeOffset) {
        const newClip = self.currentId != clipId;
        playerElem.style.display = 'flex';
        if (newClip) {
            updateProgressBar(0);
            clearInterval(updateProgressInterval);
            ysp.loadById(clipId, timeOffset, 'youtube-api-script-xaqdlrwqglw');
            self.currentId = clipId;
        } else {
            ysp.timeOffset = timeOffset
            ysp.player.seekTo(timeOffset);
            if (ysp.player.playerInfo.playerState != 1) {
                ysp.player.playVideo();
            }
        }
    };
    return this;
}

(function () {
    const playerElem = document.getElementById('player-bar');
    const videoElem = document.getElementById('video-player');
    const uiPlayer = new UiPlayer(playerElem, videoElem);

    const aa = document.querySelectorAll('a.audioPlayer[href*="youtube.com"]');
    [].forEach.call(aa, function (a) {
        a.addEventListener('click', function (e) {
            e.preventDefault();
            const href = a.getAttribute('href');
            const offset = parseInt(a.getAttribute('data-offset'));
            const pos = href.indexOf('v=');
            const urlObj = new URL(href);
            const params = new URLSearchParams(urlObj.search);
            const params2 = Object.fromEntries(params.entries());
            const uid = params.get('v');
            const t = params.get('t') || 0;
            if (pos >= 0) {
                uiPlayer.loadClip(uid, t);
                let title = a.getAttribute('title');
                title = title ? title : a.innerText;
                uiPlayer.playerTitle.innerText = title;
            }
        }, false);
    });

    document.body.addEventListener('keydown', function(e) {
        const anyMod = e.metaKey || e.shiftKey || e.ctrlKey || e.altKey
        if (e.code == 'KeyP' && !anyMod) {
            if (uiPlayer.ysp.player) {
                e.preventDefault()
                if (uiPlayer.ysp.player.playerInfo.playerState == 1) {
                    uiPlayer.ysp.pause()
                } else {
                    uiPlayer.ysp.play()
                }
            }
        }
    })
})();
