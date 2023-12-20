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
    ysp.onStateChange = onStateChange;

    const newScriptTag = document.createElement('script');
    newScriptTag.src = "https://www.youtube.com/player_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(newScriptTag, firstScriptTag);
    let updateProgressInterval = null;
    let playing = false;
    const playButton = playerElem.querySelector('.play-button');
    const closeButton = playerElem.querySelector('.close-button');
    // const playerTitle = playerElem.querySelector('.player-bar-title');
    self.playerTitle = playerElem.querySelector('.player-bar-title');

    playButton.setAttribute('src', playImage);

    self.timeOffset = 0;
    self.currentId = null;

    function updateProgressBar(perc) {
        if (typeof perc !== 'undefined') {
            // keep perc
        } else if (ysp.player) {
            perc = (ysp.player.getCurrentTime() / ysp.player.getDuration()) * 100;
        } else {
            perc = 0;
        }
        // console.log('updateProgressBar: ' + perc);
        progressElem.style.width = perc + '%';
    }

    playButton.addEventListener("click", function () {
        if (ysp.player) {
            if (playing) {
                ysp.player.pauseVideo();
                playing = false;
                playButton.setAttribute('src', playImage);
            } else {
                ysp.player.playVideo();
                playing = true;
                playButton.setAttribute('src', pauseImage);
            }
        }
    });
    closeButton.addEventListener("click", function () {
        playerElem.style.display = 'none';
        if (ysp.player) {
            ysp.player.stopVideo();
            playing = false;
        }
    });

    function startThreadUpdateProgressBar() {
        updateProgressInterval = setInterval(updateProgressBar, PROGRESS_BAR_TIMEOUT);
    }

    function onStateChange(event) {
        // console.log('onStateChange: event.data: ' + event.data);
        if (event.data === YT.PlayerState.PLAYING) {
            playing = true;
            playButton.setAttribute('src', pauseImage);
            clearInterval(updateProgressInterval);
            startThreadUpdateProgressBar();
            const timeOffset = self.timeOffset
            self.timeOffset = 0
            //console.log('timeOffset', timeOffset);
            if (timeOffset) {
                ysp.player.seekTo(timeOffset);
                const percent = timeOffset / ysp.player.getDuration() * 100
                updateProgressBar(percent);
            }
        } else if (event.data === YT.PlayerState.PAUSED) {
            playing = false;
            playButton.setAttribute('src', playImage);
            clearInterval(updateProgressInterval);
        } else if (event.data === YT.PlayerState.ENDED) {
            playing = false;
            playButton.setAttribute('src', playImage);
            clearInterval(updateProgressInterval);
        }
    }

    function onProgressBarClick(e) {
        if (ysp.player) {
            const ratio = e.offsetX / progressBarParent.offsetWidth;
            //console.log('dur', ysp.player.getDuration());
            const newTime = ysp.player.getDuration() * ratio;
            updateProgressBar(ratio * 100);
            //console.log('ratio * 100', ratio * 100);
            ysp.player.seekTo(newTime);
        }
    }

    progressBarParent.addEventListener('mouseup', onProgressBarClick, false);
    progressBarParent.addEventListener('touchend', onProgressBarClick, false);
    this.loadClip = function (clipId) {
        const newClip = self.currentId != clipId;
        playerElem.style.display = 'flex';
        if (newClip) {
            //console.log('loading new video:', clipId);
            updateProgressBar(0);
            clearInterval(updateProgressInterval);
            ysp.loadById(clipId);
            self.currentId = clipId;
        } else {
            // playerState: 1 (playing), 2 (not playing)
            //console.log('reusing existing video:', clipId);
            //console.log('state', ysp.player.playerInfo.playerState);
            const time = self.timeOffset;
            self.timeOffset = 0;
            ysp.player.seekTo(time);
            if (ysp.player.playerInfo.playerState != 1) {
                ysp.player.playVideo();
            }
        }
    };
    this.setTimeOffset = function (timeOffset) {
        this.timeOffset = timeOffset;
        //console.log('this.timeOffset has been set to', this.timeOffset)
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
            const t = params.get('t');
            if (pos >= 0) {
                uiPlayer.setTimeOffset(t);
                uiPlayer.loadClip(uid);
                let title = a.getAttribute('title');
                title = title ? title : a.innerText;
                uiPlayer.playerTitle.innerText = title;
            }
        }, false);
    });
})();
