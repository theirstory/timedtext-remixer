import { ElementType } from 'react';
import type { Timeline } from './interfaces';
interface RemixSourcesProps {
    PlayerWrapper?: ElementType;
    SourceWrapper?: ElementType;
    BlockWrapper?: ElementType;
    SelectedBlocksWrapper?: ElementType;
    SelectionWrapper?: ElementType;
    ToolbarWrapper?: ElementType;
    id?: (t: Timeline) => string | undefined;
    active: string | undefined;
    tools?: any[] | undefined;
}
declare const RemixSources: ({ PlayerWrapper, SourceWrapper, BlockWrapper, SelectedBlocksWrapper, SelectionWrapper, ToolbarWrapper, id, active, tools, }: RemixSourcesProps) => JSX.Element;
export default RemixSources;
