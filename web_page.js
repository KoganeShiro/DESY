//https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia

window.onload = function() {
    var constraints = { audio: true, video: true };

    // Call getUserMedia
    navigator.mediaDevices.getUserMedia(constraints)
        .then(function(mediaStream) {
            var video = document.querySelector('video');
            video.srcObject = mediaStream;
            video.play();
        })
        .catch(function(err) {
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                console.log("User denied access to camera and microphone");
            } else {
                console.log("An error occurred: " + err.message);
            }
        });
}

