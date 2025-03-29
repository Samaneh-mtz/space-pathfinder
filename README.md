space-pathfinder online game is about a spaceship that tries to reach planets using the shortest path!

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Space Pathfinder</title>
    <style>
        body {
            background-color: #1a1a1a;
            color: white;
            font-family: Arial, sans-serif;
            text-align: center;
        }

        canvas {
            border: 1px solid white;
        }

        #end-screen {
            display: none;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            padding: 20px;
            border-radius: 10px;
        }

        button {
            padding: 10px 20px;
            font-size: 16px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <h1>Space Pathfinder</h1>
    <p>Score: <span id="score">0</span> | Time: <span id="timer">0</span>s</p>
    <canvas id="gameCanvas"></canvas>
    <div id="end-screen">
        <h2 id="result"></h2>
        <p>Final Score: <span id="final-score"></span></p>
        <p>Time Spent: <span id="final-time"></span>s</p>
        <div id="map"></div>
        <button id="restart">Restart</button>
    </div>
    <script src="game.js"></script>
</body>
</html>
