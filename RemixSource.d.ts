import { ElementType } from 'react';
import type { Timeline } from './interfaces';
interface RemixSourceProps {
    PlayerWrapper?: ElementType;
    SourceWrapper?: ElementType;
    BlockWrapper?: ElementType;
    SelectedBlocksWrapper?: ElementType;
    SelectionWrapper?: ElementType;
    ToolbarWrapper?: ElementType;
    source: Timeline;
    active: boolean;
    index: number;
    tools?: any[] | undefined;
    timestamp?: number;
}
declare const RemixSource: ({ PlayerWrapper, SourceWrapper, BlockWrapper, SelectedBlocksWrapper, SelectionWrapper, ToolbarWrapper, source, active, index, tools, timestamp, }: RemixSourceProps) => JSX.Element;
export default RemixSource;
