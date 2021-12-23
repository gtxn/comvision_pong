class Ball {
    constructor() {
        this.img_src = 'resources/beach-ball.png'
        this.img = new Image();
        this.img.src = this.img_src; // can also be a remote URL e.g. http://

        this.size = 50
        this.x = canvasElement.width / 2
        this.y = canvasElement.height / 2
        this.rotation = 180 // in degrees

        this.xspeed = 10
        this.yspeed = Math.random() * 20 - 5

        this.accel = 1.005
        this.maxSpeed = 35
    }

    render() {
        canvasCtx.drawImage(this.img, this.x, this.y, this.size, this.size);
    }
}

class Paddle {
    constructor(x, colour) {
        this.x = x
        this.y = canvasElement.height / 2
        this.height = canvasElement.height / 5
        this.width = 30
        this.colour = colour
    }

    render() {
        canvasCtx.beginPath()
        canvasCtx.fillStyle = this.colour
        canvasCtx.rect(this.x, this.y - this.height / 2, this.width, this.height)
        canvasCtx.fill()
        canvasCtx.closePath()
    }

}