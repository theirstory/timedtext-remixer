type CallbackFunction = () => void;
export default class Clock {
    private targetFPS;
    private callback;
    private targetFrameTime;
    private lastFrameTime;
    private running;
    constructor(fps: number, callback: CallbackFunction);
    start(): void;
    stop(): void;
    private frame;
}
export {};
//# sourceMappingURL=Clock.d.ts.map