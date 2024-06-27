import { useContext, useMemo, ElementType, CSSProperties } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';

import { PlainDiv, Section } from './components';
import { Context } from './RemixContext';
import { Player } from './Player';

import type { Stack } from './interfaces';

interface RemixDestinationProps {
  PlayerWrapper?: ElementType;
  DestinationWrapper?: ElementType;
  BlockWrapper?: ElementType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tools?: any[] | undefined;
}

const RemixDestination = ({
  PlayerWrapper = PlainDiv as unknown as ElementType,
  DestinationWrapper = PlainDiv as unknown as ElementType,
  BlockWrapper = PlainDiv as unknown as ElementType,
  tools = [],
}: RemixDestinationProps): JSX.Element => {
  const { state } = useContext(Context);
  const { remix, timestamp } = state;

  console.log({ remix });

  const stacks: Stack[] = useMemo(() => {
    if (remix?.tracks.children[0].children.every((c) => c.OTIO_SCHEMA === 'Clip.1')) {
      return [remix.tracks] as Stack[];
    } else {
      return remix?.tracks.children.flatMap((t) => t.children as Stack[]) as Stack[];
    }
  }, [remix]);

  const getListStyle = (isDraggingOver: boolean): CSSProperties => ({
    background: isDraggingOver ? 'lightyellow' : 'transparent',
    width: '100%',
  });

  const getItemStyle = (isDragging: boolean, draggableStyle: CSSProperties): CSSProperties => ({
    userSelect: 'none',
    background: isDragging ? 'lightgreen' : 'transparent',
    ...draggableStyle,
  });

  return (
    <>
      {/* <button onClick={() => dispatch({ type: 'test', payload: 'test?' })}>test action</button> */}
      <PlayerWrapper>
        <Player key={timestamp} transcript={`#B${remix?.metadata?.id}`} pauseMutationObserver={false} />
      </PlayerWrapper>

      {/* this will be ToolBarWrapper */}
      <div className="ToolBarWrapper" style={{ padding: 5 }}>
        <Droppable droppableId="toolbar" isDropDisabled={true}>
          {(provided, snapshot) => (
            <div {...provided.droppableProps} ref={provided.innerRef} style={getListStyle(snapshot.isDraggingOver)}>
              {tools.map((tool, i) => (
                <Draggable draggableId={tool.name} index={i}>
                  {(provided, snapshot) => (
                    <>
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        // style={getItemStyle(snapshot.isDragging, provided.draggableProps.style as CSSProperties)}
                        style={provided.draggableProps.style as CSSProperties}
                      >
                        {snapshot.isDragging ? tool.timelineComponent : tool.toolBarComponent}
                      </div>
                      {snapshot.isDragging && tool.toolBarComponent}
                    </>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>

      <DestinationWrapper>
        <Droppable droppableId={`Remix-${remix?.metadata?.id}`}>
          {(provided, snapshot) => (
            <div {...provided.droppableProps} ref={provided.innerRef} style={getListStyle(snapshot.isDraggingOver)}>
              <article id={`B${remix?.metadata?.id}`} style={{ minHeight: '100%' }}>
                {stacks.map((stack: Stack, i, stacks) => (
                  <Draggable key={stack?.metadata?.id ?? `db-${i}`} draggableId={stack?.metadata?.id} index={i}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(snapshot.isDragging, provided.draggableProps.style as CSSProperties)}
                      >
                        <Section
                          key={stack?.metadata?.id ?? `S-${i}`}
                          stack={stack}
                          offset={stacks.slice(0, i).reduce((acc, b) => acc + (b.source_range?.duration ?? 0), 0)}
                          BlockWrapper={BlockWrapper}
                          sourceId={stack?.metadata?.sid}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
              </article>

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DestinationWrapper>
    </>
  );
};

export default RemixDestination;
