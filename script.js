console.log(WIDTH, HEIGHT)

function disp_hand(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
    canvasCtx.drawImage(
        results.image, 0, 0, WIDTH, HEIGHT);

    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
                { color: '#00FF00', lineWidth: 5 });
            drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 });
        }
    }

    canvasCtx.restore();
}
function get_hand_landmarks(results, hand = 0) {
    let hand_results = []
    if (results.multiHandLandmarks) {
        hand_results = results.multiHandLandmarks[hand]
    }
    return hand_results
}
function draw_circle(x, y, rad) {
    canvasCtx.beginPath()
    canvasCtx.arc(x, y, rad, 0, 2 * Math.PI, true)
    canvasCtx.fillStyle = 'rgb(255, 255, 0)'
    canvasCtx.fill()
    canvasCtx.closePath()
}

function update_paddle_pos(results, paddle, hand) {
    let all_fingers = get_hand_landmarks(results, hand = hand)
    if (all_fingers) {
        let chosen_finger = all_fingers[8]
        let x = chosen_finger['x'] * WIDTH
        let y = chosen_finger['y'] * HEIGHT
        let z = Math.sqrt(chosen_finger['z']) * WIDTH * 0.02

        paddle.y = y
        prevY = y

    } else {
        paddle.y = prevY
    }
}
function game_play(results, ball, player1_paddle, player2_paddle) {
    update_paddle_pos(results, player1_paddle, 0)

    // Update computer paddle position
    if (ball.y - player2_paddle.y > 5) {
        player2_paddle.y += 8
    } else if (player2_paddle.y - ball.y > 5) {
        player2_paddle.y -= 8
    }

    // check ball collision with paddle
    if ((ball.x <= player1_paddle.x + player1_paddle.width && ball.y + ball.size >= player1_paddle.y - player1_paddle.height / 2 && ball.y <= player1_paddle.y + player1_paddle.height / 2 && ball.x >= player1_paddle.x)
        || (ball.x + ball.size >= player2_paddle.x && ball.y + ball.size >= player2_paddle.y - player2_paddle.height / 2 && ball.y <= player2_paddle.y + player2_paddle.height / 2 && ball.x < player2_paddle.x + player2_paddle.width)) {

        ball.xspeed = ball.xspeed * -1
        ball.yspeed = Math.random() * 15 - 5
    }

    // check ball in frame
    if (ball.y + ball.size > HEIGHT || ball.y < 0) {
        ball.yspeed = ball.yspeed * -1
    }

    ball.x -= ball.xspeed
    ball.y += ball.yspeed


    if (Math.abs(ball.xspeed) < ball.maxSpeed) { ball.xspeed = ball.xspeed * ball.accel }
    if (Math.abs(ball.yspeed) < ball.maxSpeed) { ball.yspeed = ball.yspeed * ball.accel }

}
function render_txt(text) {
    canvasCtx.save()

    // translate context to center of canvas
    canvasCtx.translate(WIDTH / 2, HEIGHT / 2);

    // flip context horizontally
    canvasCtx.scale(-1, 1);

    canvasCtx.font = '50px Arial'

    let bg_w = canvasCtx.measureText(text).width
    let bg_h = parseInt(canvasCtx.font.match(/\d+/), 10);

    // draw rect
    canvasCtx.fillStyle = 'white'
    canvasCtx.rect(0 - bg_w, 0 - bg_h, bg_w * 2, bg_h)
    canvasCtx.fill()

    // fill text
    canvasCtx.fillStyle = 'blue'
    canvasCtx.textAlign = "center";
    canvasCtx.fillText(text, 0, 0)

    canvasCtx.restore()
}

let ball, player1_paddle, player2_paddle, countdown, firstcountdown, gameon, won
let prevY

function start_game() {
    ball = new Ball()
    player1_paddle = new Paddle(WIDTH * 1 / 7, "rgb(255, 0, 0)")
    player2_paddle = new Paddle(WIDTH * 6 / 7, "rgb(0, 0, 255)")

    countdown = true
    firstcountdown = true
    gameon = true
    prevY = player1_paddle.y
}

async function render_game(results) {
    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

    if (gameon) {
        document.getElementById('flipper').classList = 'flip'

        console.log(WIDTH, HEIGHT)
        canvasCtx.drawImage(
            results.image, 0, 0, WIDTH, HEIGHT);

        ball.render()
        player1_paddle.render()
        player2_paddle.render()

        if (countdown) {
            let c_time = new Date().getTime()
            if (firstcountdown) {
                i_time = c_time
                firstcountdown = false
            }

            let t_elapsed = (c_time - i_time) / 1000
            let to_disp = `${Math.round(3 - t_elapsed)}`

            // Render countdown text
            render_txt(to_disp)

            if (t_elapsed >= 3) {
                gameon = true
                countdown = false
            }
        } else {
            game_play(results, ball, player1_paddle, player2_paddle)

            // check win
            if (ball.x > WIDTH) {
                gameon = false
                won = 'Player'
            } else if (ball.x < 0) {
                won = 'Computer'
                gameon = false
            }
        }

    } else {
        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT)

        if (won) {
            render_txt(`Game Over. ${won} won.`)
        } else {
            render_txt('Click Start Game Button to start')
        }
    }
}


const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});
hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

hands.onResults(render_game);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: WIDTH,
    height: HEIGHT
});

camera.start();