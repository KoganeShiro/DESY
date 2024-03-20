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

/*
window.onload = function() {
    var constraints = { audio: true, video: true };

    navigator.mediaDevices.getUserMedia(constraints)
        .then(function(mediaStream) {
            var video = document.createElement('video');
            video.srcObject = mediaStream;
            video.play();

            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');

            video.addEventListener('loadedmetadata', function() {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                document.body.appendChild(canvas);

                function processFrame() {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    var data = imageData.data;
                    for (var i = 0; i < data.length; i += 4) {
                        data[i] = 255 - data[i]; // Red
                        data[i + 1] = 255 - data[i + 1]; // Green
                        data[i + 2] = 255 - data[i + 2]; // Blue
                        // data[i + 3] is the alpha channel; we leave it unchanged
                    }
                    ctx.putImageData(imageData, 0, 0);
                    requestAnimationFrame(processFrame);
                }

                processFrame();
            });
        })
        .catch(function(err) {
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                console.log("User denied access to camera and microphone");
            } else {
                console.log("An error occurred: " + err.message);
            }
        });
}
*/