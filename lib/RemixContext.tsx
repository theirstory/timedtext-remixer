/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PropsWithChildren, createContext, useReducer } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';

import type { State, Action, Timeline } from './interfaces';

// type State = {
//   metadata?: Metadata;
//   tracks?: any[];
// };

// type Action =
//   | { type: "move"; payload: DropResult }
//   | { type: "add"; payload: [DropResult, Clip] };

export const Context = createContext({
  state: {
    sources: [] as Timeline[],
    remix: null,
  } as State,
  dispatch: (action: any) => action,
});

interface RemixContextProps extends PropsWithChildren {
  sources: Timeline[] | null | undefined;
  remix: Timeline | null | undefined;
}

const RemixContext = ({ sources = [], remix = null, children }: RemixContextProps): JSX.Element => {
  const initialState: State = {
    sources,
    remix,
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const onDragEnd = (result: DropResult) => {
    console.log({ result });
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    // if (
    //   result.source.droppableId === result.destination.droppableId &&
    //   result.source.droppableId === "droppable"
    // ) {
    //   dispatch({ type: "move", payload: result });
    //   return;
    // }

    // if (result.source.droppableId === "droppable0") {
    //   console.log({ result, block, interval2 });
    //   if (!block) return;

    //   const _block = trimBlock(block, interval2);
    //   dispatch({ type: "add", payload: [result, _block] });
    //   return;
    // }
  };

  return (
    <Context.Provider value={{ state, dispatch }}>
      <DragDropContext onDragEnd={onDragEnd}>{children}</DragDropContext>
    </Context.Provider>
  );
};

const reducer = (state: State, action: Action): State => {
  // Your reducer logic
  console.log({ action });
  return state;
};

export default RemixContext;
