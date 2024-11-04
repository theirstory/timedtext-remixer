import { ElementType } from 'react';
interface RemixDestinationProps {
    PlayerWrapper?: ElementType;
    DestinationWrapper?: ElementType;
    BlockWrapper?: ElementType;
    SectionContentWrapper?: ElementType;
    ToolbarWrapper?: ElementType;
    tools?: any[] | undefined;
    Empty?: ElementType | undefined;
}
declare const RemixDestination: ({ PlayerWrapper, DestinationWrapper, BlockWrapper, SectionContentWrapper, ToolbarWrapper, tools, Empty, }: RemixDestinationProps) => JSX.Element;
export default RemixDestination;
