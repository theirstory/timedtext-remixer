import { TimedTextPlayer } from '@theirstoryinc/timedtext-player/dist/timedtext-player.js';
export declare const TimedTextPlayerComponent: import("@lit/react").ReactWebComponent<TimedTextPlayer, {
    onactivate: string;
    onchange: string;
}>;
export declare const Player: ({ transcript, poster, pauseMutationObserver, }: {
    transcript: string;
    poster: string | undefined;
    pauseMutationObserver: boolean;
}) => import("react/jsx-runtime").JSX.Element | null;
