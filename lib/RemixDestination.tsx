import {
  useContext,
  useState,
  useCallback,
  ElementType,
  CSSProperties,
} from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";

import { PlainDiv, Section } from "./components";
import { Context } from "./RemixContext";

import type { State, Action, Stack, Track, Clip } from "./interfaces";

interface RemixDestinationProps {
  PlayerWrapper?: ElementType;
  DestinationWrapper?: ElementType;
  BlockWrapper?: ElementType;
  source: Stack[];
}

const RemixDestination = ({
  PlayerWrapper = PlainDiv as unknown as ElementType,
  DestinationWrapper = PlainDiv as unknown as ElementType,
  BlockWrapper = PlainDiv as unknown as ElementType,
  source = [],
}: RemixDestinationProps): JSX.Element => {
  const { state, dispatch } = useContext(Context);

  const getListStyle = (isDraggingOver: boolean): CSSProperties => ({
    background: isDraggingOver ? "lightyellow" : "transparent",
    width: "100%",
  });

  const getItemStyle = (
    isDragging: boolean,
    draggableStyle: CSSProperties
  ): CSSProperties => ({
    userSelect: "none",
    background: isDragging ? "lightgreen" : "transparent",
    ...draggableStyle,
  });

  console.log({ source });

  return (
    <>
      <button onClick={() => dispatch({ type: "test", payload: "test?" })}>
        test action
      </button>
      <PlayerWrapper style={{}}>
        <p>source video here</p>
      </PlayerWrapper>
      <DestinationWrapper>
        <Droppable droppableId="droppable1">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
            >
              <article>
                {source.map((block: Clip, i, blocks) => (
                  <Draggable
                    key={block.metadata.id ?? `db-${i}`}
                    draggableId={block.metadata.id}
                    index={i}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(
                          snapshot.isDragging,
                          provided.draggableProps.style as CSSProperties
                        )}
                      >
                        <Section
                          key={block.metadata.id ?? `b-${i}`}
                          data={block}
                          offset={blocks
                            .slice(0, i)
                            .reduce(
                              (acc, b) => acc + (b.source_range?.duration ?? 0),
                              0
                            )}
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
