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
  sources: [] as Timeline[],
  state: {
    remix: null,
  } as State,
  dispatch: (action: any) => action,
});

interface RemixContextProps extends PropsWithChildren {
  sources: Timeline[] | undefined;
  remix: Timeline | null | undefined;
}

const RemixContext = ({ sources = [] as Timeline[], remix = null, children }: RemixContextProps): JSX.Element => {
  const initialState: State = {
    // sources,
    remix,
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const onDragEnd = (result: DropResult) => {
    console.log({ result });
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    if (result.source.droppableId === result.destination.droppableId && result.source.droppableId === 'droppable') {
      dispatch({ type: 'move', payload: result });
      return;
    }

    // if (result.source.droppableId === "droppable0") {
    //   console.log({ result, block, interval2 });
    //   if (!block) return;

    //   const _block = trimBlock(block, interval2);
    //   dispatch({ type: "add", payload: [result, _block] });
    //   return;
    // }
  };

  return (
    <Context.Provider value={{ sources, state, dispatch }}>
      <DragDropContext onDragEnd={onDragEnd}>{children}</DragDropContext>
    </Context.Provider>
  );
};

const reducer = (state: State, action: Action): State => {
  console.log({ action });
  const { sources, remix } = state;

  switch (action.type) {
    // case "add":
    //   // Prevent adding a block with a duplicate ID
    //   if (state.find((block) => block.id === action.payload.id)) {
    //     console.warn("Block with this ID already exists.");
    //     return state;
    //   }
    //   return [...state, action.payload];

    // case "remove":
    //   return state.filter((block) => block.id !== action.payload.id);

    // case "update":
    //   return state.map((block) =>
    //     block.id === action.payload.id ? { ...block, ...action.payload } : block
    //   );

    // case 'add': {
    //   const [result, block] = action.payload;
    //   const { source, destination } = result;
    //   const resultState = [...state];
    //   // const [removed] = resultState.splice(source.index, 1);
    //   resultState.splice(destination.index, 0, block);
    //   return resultState;
    // }

    // case 'move': {
    //   const { source, destination } = action.payload;

    //   const result = [...state];
    //   const [removed] = result.splice(source.index, 1);
    //   result.splice(destination.index, 0, removed);
    //   return result;
    // }

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

export default RemixContext;
