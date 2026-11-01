<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flower Video Background</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background-color: #000000;
            min-height: 100vh;
            overflow: hidden;
            position: relative;
        }

        .video-container {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100vw;
            height: 90vh;
            overflow: hidden;
            z-index: -1;
        }

        #bg-video {
            width: 100%;
            height: 110%;
            object-fit: cover;
            display: block;
            transform: translateY(0%);
        }
    </style>
</head>
<body>
    <div class="video-container">
        <video autoplay muted loop playsinline id="bg-video">
            <source src="https://api.getlayers.ai/storage/v1/object/public/public/assets/loopstack-f8c64439bf/flower.mp4" type="video/mp4">
        </video>
    </div>
</body>
</html>