import { PropsWithChildren, LegacyRef } from 'react';
import type { State, Timeline } from './interfaces';
import { TimedTextPlayer } from '../../timedtext-player/dist/timedtext-player.js';
export declare const Context: import("react").Context<{
    sources: Timeline[];
    state: State;
    dispatch: (action: any) => any;
    remixPlayerRef: LegacyRef<TimedTextPlayer>;
}>;
interface RemixContextProps extends PropsWithChildren {
    sources: Timeline[] | undefined;
    remix: Timeline | null | undefined;
    poster?: string;
    width?: number;
    height?: number;
    tools?: any[] | undefined;
}
declare const RemixContext: ({ sources, remix, poster, width, height, tools, children, }: RemixContextProps) => JSX.Element;
export default RemixContext;
