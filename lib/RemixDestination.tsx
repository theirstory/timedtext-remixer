import { useContext, useMemo, ElementType, CSSProperties, cloneElement } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';

import { PlainDiv, Section } from './components';
import { Context } from './RemixContext';
import { Player } from './Player';

import type { Stack } from './interfaces';

interface RemixDestinationProps {
  PlayerWrapper?: ElementType;
  DestinationWrapper?: ElementType;
  BlockWrapper?: ElementType;
  SectionContentWrapper?: ElementType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tools?: any[] | undefined;
  Empty?: ElementType | undefined;
}

const RemixDestination = ({
  PlayerWrapper = PlainDiv as unknown as ElementType,
  DestinationWrapper = PlainDiv as unknown as ElementType,
  BlockWrapper = PlainDiv as unknown as ElementType,
  SectionContentWrapper = PlainDiv as unknown as ElementType,
  tools = [],
  Empty = PlainDiv as unknown as ElementType,
}: RemixDestinationProps): JSX.Element => {
  const { state } = useContext(Context);
  const { remix, poster, width, height } = state;

  console.log({ remix });

  const stacks: Stack[] = useMemo(() => {
    // TODO decide which to use and not allow both
    if ((remix?.tracks?.children?.[0]?.children ?? []).every((c) => c.OTIO_SCHEMA === 'Clip.1')) {
      return [remix?.tracks] as Stack[];
    } else {
      return remix?.tracks.children.flatMap((t) => t.children as Stack[]) as Stack[];
    }
  }, [remix]);

  const getListStyle = (isDraggingOver: boolean): CSSProperties => ({
    background: isDraggingOver ? '#F1F2F3' : 'transparent',
    borderRadius: '8px',
    height: '100%',
  });

  const getItemStyle = (isDragging: boolean, draggableStyle: CSSProperties): CSSProperties => ({
    userSelect: 'none',
    background: isDragging ? '#239B8B26' : 'transparent',
    ...draggableStyle,
  });

  return (
    <>
      {/* <button onClick={() => dispatch({ type: 'test', payload: 'test?' })}>test action</button> */}
      <PlayerWrapper>
        <Player
          // key={timestamp}
          transcript={`#B${remix?.metadata?.id}`}
          pauseMutationObserver={false}
          {...{ poster, width, height }}
        />
      </PlayerWrapper>

      {/* this will be ToolBarWrapper */}
      <div className="ToolBarWrapper" style={{ padding: 5 }}>
        <Droppable droppableId="Toolbar" isDropDisabled={true}>
          {(provided, snapshot) => (
            <div {...provided.droppableProps} ref={provided.innerRef} style={getListStyle(snapshot.isDraggingOver)}>
              {tools.map((tool, i) => (
                <Draggable draggableId={tool.name} index={i} key={`tool-${i}`}>
                  {(provided, snapshot) => (
                    <>
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        // style={getItemStyle(snapshot.isDragging, provided.draggableProps.style as CSSProperties)}
                        style={provided.draggableProps.style as CSSProperties}
                      >
                        {snapshot.isDragging ? <tool.timelineComponent /> : tool.toolBarComponent}
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
                        {stack.metadata?.component ? (
                          <Tool
                            key={stack?.metadata?.id ?? `T-${i}`}
                            Component={tools.find((t) => t.type === stack.metadata?.component).timelineComponent}
                            stack={stack}
                            id={stack?.metadata?.id}
                          />
                        ) : (
                          <Section
                            key={stack?.metadata?.id ?? `S-${i}`}
                            stack={stack}
                            offset={stacks.slice(0, i).reduce((acc, b) => acc + (b.source_range?.duration ?? 0), 0)}
                            BlockWrapper={BlockWrapper}
                            SectionContentWrapper={SectionContentWrapper}
                            sourceId={stack?.metadata?.sid}
                          />
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {stacks.length === 1 && <Empty />}
              </article>

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DestinationWrapper>
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Tool = ({
  Component,
  stack,
  id,
}: {
  Component: React.ComponentType<{ value?: unknown; id: string }>;
  stack: Stack;
  id: string;
}): JSX.Element => {
  const props = stack?.metadata ?? {};
  // return Component;
  return <Component id={id} {...props} />;
  // return cloneElement(Component, { id, ...props });
};

export default RemixDestination;
