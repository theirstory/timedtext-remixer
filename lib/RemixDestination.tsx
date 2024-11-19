/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useMemo, ElementType, CSSProperties, useRef, useState, useLayoutEffect } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Box } from '@mui/material';

import { PlainDiv, Section } from './components';
import { Context } from './RemixContext';
import { Player } from './Player';

import type { Stack } from './interfaces';
// import TheirsToryLogo from '../src/Assets/TheirStory.png';

interface RemixDestinationProps {
  PlayerWrapper?: ElementType;
  DestinationWrapper?: ElementType;
  BlockWrapper?: ElementType;
  SectionContentWrapper?: ElementType;
  ToolbarWrapper?: ElementType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Settings?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tools?: any[] | undefined;
  Empty?: ElementType | undefined;
}

const RemixDestination = ({
  PlayerWrapper = PlainDiv as unknown as ElementType,
  DestinationWrapper = PlainDiv as unknown as ElementType,
  BlockWrapper = PlainDiv as unknown as ElementType,
  SectionContentWrapper = PlainDiv as unknown as ElementType,
  ToolbarWrapper = PlainDiv as unknown as ElementType,
  Settings = null,
  tools = [],
  Empty = PlainDiv as unknown as ElementType,
}: RemixDestinationProps): JSX.Element => {
  const { state } = useContext(Context);
  const { remix, poster } = state;

  const stacks: Stack[] = useMemo(() => {
    // TODO decide which to use and not allow both
    if ((remix?.tracks?.children?.[0]?.children ?? []).every((c) => c.OTIO_SCHEMA === 'Clip.1')) {
      return [remix?.tracks] as Stack[];
    } else {
      return remix?.tracks.children.flatMap((t) => t.children as Stack[]) as Stack[];
    }
  }, [remix]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getListStyle = (_isDraggingOver?: boolean): CSSProperties => ({
    background: 'transparent',
    borderRadius: '8px',
    // height: '100%',
    width: '100%',
  });

  const getItemStyle = (isDragging: boolean, draggableStyle: CSSProperties): CSSProperties => ({
    userSelect: 'none',
    background: 'transparent',
    borderRadius: '8px',
    boxShadow: isDragging ? '0px 10px 12px 0px rgba(0, 0, 0, 0.20)' : 'none',
    ...draggableStyle,
  });

  const [width, setWidth] = useState<string | number>('auto');
  const widthRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (widthRef.current) {
      setWidth(widthRef.current.offsetWidth);
    }
  }, [widthRef]);

  return (
    <>
      <PlayerWrapper>
        <Player transcript={`#B${remix?.metadata?.id}`} pauseMutationObserver={false} {...{ poster }} />
      </PlayerWrapper>

      <div ref={widthRef} style={{ width: '100%', height: 0 }}></div>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <ToolbarWrapper>
          <Droppable droppableId="Toolbar" isDropDisabled={true}>
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} style={getListStyle()}>
                {tools.map((tool, i) => (
                  <Draggable draggableId={tool.name} index={i} key={`tool-${i}`}>
                    {(provided, snapshot) => (
                      <>
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          // style={getItemStyle(snapshot.isDragging, provided.draggableProps.style as CSSProperties)}
                          // style={provided.draggableProps.style as CSSProperties}
                          style={{
                            ...(provided.draggableProps.style as CSSProperties),
                            ...{
                              display: snapshot.isDragging ? 'block' : 'inline-block',
                              width: snapshot.isDragging ? width : 'auto',
                              paddingTop: '8px',
                              paddingBottom: '8px',
                            },
                          }}
                        >
                          {/* {tool.toolBarComponent} */}
                          {snapshot.isDragging ? <tool.draggableComponent /> : tool.toolBarComponent}
                        </div>
                        {snapshot.isDragging ? (
                          <div
                            style={{
                              display: 'inline-block',
                              width: 'auto',
                              paddingTop: '16px',
                            }}
                          >
                            {tool.toolBarComponent}
                          </div>
                        ) : null}
                      </>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </ToolbarWrapper>
        {Settings}
      </Box>

      <DestinationWrapper>
        <Droppable droppableId={`Remix-${remix?.metadata?.id}`}>
          {(provided, snapshot) => (
            <div {...provided.droppableProps} ref={provided.innerRef} style={getListStyle(snapshot.isDraggingOver)}>
              <article id={`B${remix?.metadata?.id}`}>
                {stacks.map((stack: Stack, i, stacks) => (
                  <Draggable
                    key={stack?.metadata?.id ?? `db-${i}`}
                    draggableId={stack?.metadata?.id as string}
                    index={i}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(snapshot.isDragging, provided.draggableProps.style as CSSProperties)}
                      >
                        {(stack.metadata as any)?.component ? (
                          <Tool
                            key={stack?.metadata?.id ?? `T-${i}`}
                            Component={
                              tools.find((t) => t.type === (stack.metadata as any)?.component).timelineComponent
                            }
                            stack={stack}
                            id={stack?.metadata?.id as string}
                          />
                        ) : (
                          <Section
                            key={stack?.metadata?.id ?? `S-${i}`}
                            stack={stack}
                            offset={stacks.slice(0, i).reduce((acc, b) => acc + (b.source_range?.duration ?? 0), 0)}
                            BlockWrapper={BlockWrapper}
                            SectionContentWrapper={SectionContentWrapper}
                            sourceId={(stack?.metadata as any)?.sid}
                            tools={tools}
                          />
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {stacks.length === 1 && <Empty />}
                {/* <Draggable draggableId="END" index={stacks.length}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={{
                        display: 'none',
                        ...getItemStyle(snapshot.isDragging, provided.draggableProps.style as CSSProperties),
                        ...{ height: 200, backgroundColor: 'blanchedalmond' },
                      }}
                    >
                      <div {...provided.dragHandleProps}></div>
                      THE END
                    </div>
                  )}
                </Draggable> */}
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
export const Tool = ({
  Component,
  stack,
  id,
}: {
  Component: React.ComponentType<{ value?: unknown; id: string; stack?: Stack }>;
  stack: Stack;
  id: string;
}): JSX.Element => {
  const props = stack?.metadata ?? {};
  return <Component id={id} {...props} stack={stack} />;
};

export default RemixDestination;
