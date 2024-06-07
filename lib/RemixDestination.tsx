import { useContext, useMemo, useState, useCallback, ElementType, CSSProperties } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';

import { PlainDiv, Section } from './components';
import { Context } from './RemixContext';
import { Player } from './Player';

import type { State, Action, Timeline, Stack, Track, Clip } from './interfaces';

interface RemixDestinationProps {
  PlayerWrapper?: ElementType;
  DestinationWrapper?: ElementType;
  BlockWrapper?: ElementType;
}

const RemixDestination = ({
  PlayerWrapper = PlainDiv as unknown as ElementType,
  DestinationWrapper = PlainDiv as unknown as ElementType,
  BlockWrapper = PlainDiv as unknown as ElementType,
}: RemixDestinationProps): JSX.Element => {
  const { sources, state, dispatch } = useContext(Context);
  const { remix } = state;

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
        <Player transcript={`#B${remix?.metadata?.id}`} pauseMutationObserver={false} />
      </PlayerWrapper>
      <DestinationWrapper>
        <Droppable droppableId={`Remix-${remix?.metadata?.id}`}>
          {(provided, snapshot) => (
            <div {...provided.droppableProps} ref={provided.innerRef} style={getListStyle(snapshot.isDraggingOver)}>
              <article id={`B${remix?.metadata?.id}`}>
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
