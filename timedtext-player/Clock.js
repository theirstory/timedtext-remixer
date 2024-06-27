export default class Clock {
    constructor(fps, callback) {
        this.targetFPS = fps;
        this.callback = callback;
        this.targetFrameTime = 1000 / this.targetFPS;
        this.lastFrameTime = performance.now();
        this.running = false;
    }
    start() {
        this.running = true;
        requestAnimationFrame(this.frame.bind(this));
    }
    stop() {
        this.running = false;
    }
    frame(time) {
        if (!this.running)
            return;
        const delta = time - this.lastFrameTime;
        if (delta > this.targetFrameTime) {
            this.lastFrameTime = time - (delta % this.targetFrameTime);
            this.callback();
        }
        requestAnimationFrame(this.frame.bind(this));
    }
}
//# sourceMappingURL=Clock.js.map