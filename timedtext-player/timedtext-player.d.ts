import { LitElement } from 'lit';
import { Track } from './interfaces';
export declare class TimedTextPlayer extends LitElement {
    static styles: import("lit").CSSResult;
    width: number | undefined;
    height: number | undefined;
    time: number;
    set currentTime(time: number);
    get currentTime(): number;
    set currentPseudoTime(time: number);
    get seeking(): boolean;
    playing: boolean;
    get paused(): boolean;
    play(): void;
    pause(): void;
    _duration: number;
    get duration(): number;
    _muted: boolean;
    set muted(muted: boolean);
    get muted(): boolean;
    _volume: number;
    get volume(): number;
    set volume(volume: number);
    track: Track | null;
    _players: NodeListOf<HTMLMediaElement>;
    _playersReady: HTMLMediaElement[];
    _playersEventsCounter: Map<HTMLMediaElement, Record<string, number>>;
    get playersEventsCounter(): {
        player: HTMLMediaElement;
        eventsCounter: Record<string, number>;
    }[];
    private _dom2otio;
    private getCaptions;
    pauseMutationObserver: string;
    parseTranscript(): void;
    private callback;
    _observer: MutationObserver | undefined;
    playerTemplateSelector: string;
    transcriptTemplateSelector: string;
    render(): import("lit-html").TemplateResult;
    private _countEvent;
    private _relayEvent;
    _start: number;
    _end: number;
    private _ready;
    private _onLoadedMetadata;
    private _onSeeked;
    connectedCallback(): void;
    private _transcriptClick;
    private _playerAtTime;
    private _currentPlayer;
    private _clipAtTime;
    _section: null;
    _clip: null;
    _timedText: null;
    _timedTextTime: number;
    _eventCounter: number;
    private _dispatchTimedTextEvent;
    private _seek;
    _triggerTimeUpdateTimeout: number;
    private _triggerTimeUpdate;
    private _onTimeUpdate;
    private _onCanPlay;
    private _onPlay;
    private _onPause;
    private handleSlotClick;
    private handleSlotchange;
}
declare global {
    interface HTMLElementTagNameMap {
        'timedtext-player': TimedTextPlayer;
    }
}
//# sourceMappingURL=timedtext-player.d.ts.map