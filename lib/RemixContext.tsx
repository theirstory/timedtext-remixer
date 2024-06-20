/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PropsWithChildren, createContext, useReducer } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { original, produce } from 'immer';
import { useImmerReducer } from 'use-immer';
import { intersection } from 'interval-operations';
import { nanoid } from 'nanoid';

import type { State, Action, Timeline, Stack, Track, Clip, TimedText } from './interfaces';
import { timelineStacks } from './utils';
import { Tty } from '@mui/icons-material';

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
    timestamp: Date.now(),
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

    if (
      result.source.droppableId === result.destination.droppableId &&
      result.source.droppableId.startsWith('Remix-')
    ) {
      dispatch({ type: 'move', payload: result });
      return;
    }

    if (result.source.droppableId.startsWith('Source-')) {
      const [, index, start, end] = result.source.droppableId.split('-');
      const source = sources[parseInt(index)];

      dispatch({ type: 'add', payload: [result, source, [parseFloat(start), parseFloat(end)]] });
      return;
    }
  };

  return (
    <Context.Provider value={{ sources, state, dispatch }}>
      <DragDropContext onDragEnd={onDragEnd}>{children}</DragDropContext>
    </Context.Provider>
  );
};

const reducer = (state: State, action: Action): State => {
  console.log({ action, state });
  const nextState = produce(state, (draftState) => {
    draftState.timestamp = Date.now();
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

      case 'add': {
        const [result, source, [start, end]] = action.payload;
        const stack = subClip(source, start, end);

        console.log({ stack });

        if (stack) draftState.remix?.tracks.children[0].children.splice(result?.destination?.index ?? 0, 0, stack);
        return draftState;
      }

      case 'move': {
        const { source, destination } = action.payload;

        // eslint-disable-next-line no-unsafe-optional-chaining
        const [removed] = draftState.remix?.tracks.children[0].children.splice(source.index, 1) as Stack[];
        draftState.remix?.tracks.children[0].children.splice(destination?.index ?? 0, 0, removed);
        return draftState;
      }

      default:
        throw new Error(`Unhandled action type: ${action.type}`);
    }
  }) as State;

  console.log({ nextState: nextState });
  return nextState;
};

const subClip = (source: Timeline, start: number, end: number): Stack | undefined => {
  const stacks = timelineStacks(source);

  // find stack that intersects the time range start,end
  const stackIndex = stacks.findIndex((s, i, arr) => {
    const offset = arr.slice(0, i).reduce((acc, p) => acc + (p.source_range?.duration ?? 0), 0);
    const start_time = s.source_range?.start_time ?? 0;
    const end_time = start_time + (s.source_range?.duration ?? 0);

    // return start_time <= start - offset && end - offset <= end_time;
    return intersection([start_time, end_time], [start - offset, end - offset]);
  });

  const stack = stacks[stackIndex];
  const offset = stacks.slice(0, stackIndex).reduce((acc, p) => acc + (p.source_range?.duration ?? 0), 0);

  // console.log({ stack, offset });
  const trimmedStack = produce(stack, (draft) => {
    // select intersecting clips
    const clips = draft?.children?.[0].children.filter((c) => {
      const start_time = (c as Clip).source_range?.start_time ?? 0;
      const end_time = start_time + ((c as Clip).source_range?.duration ?? 0);

      return intersection([start_time, end_time], [start - offset, end - offset]);
    });

    (clips[0] as Clip).timed_texts = (clips[0] as Clip)?.timed_texts
      ?.filter((tt) =>
        intersection(
          [tt.marked_range.start_time, tt.marked_range.start_time + tt.marked_range.duration],
          [start - offset, end - offset],
        ),
      )
      .map((tt) => {
        tt.metadata.id = `TTC-${nanoid()}`;
        return tt;
      });

    clips.slice(1, -1).forEach((c) => {
      (c as Clip).timed_texts = (c as Clip)?.timed_texts?.map((tt) => {
        tt.metadata.id = `TTC-${nanoid()}`;
        return tt;
      });
    });

    (clips[clips.length - 1] as Clip).timed_texts = (clips[clips.length - 1] as Clip)?.timed_texts
      ?.filter((tt) =>
        intersection(
          [tt.marked_range.start_time, tt.marked_range.start_time + tt.marked_range.duration],
          [start - offset, end - offset],
        ),
      )
      .map((tt) => {
        tt.metadata.id = `TTC-${nanoid()}`;
        return tt;
      });

    if (draft.source_range) {
      draft.source_range.start_time = start - offset;
      draft.source_range.duration = end - start;
    }

    draft.children[0].children = clips;

    if (!draft.metadata) draft.metadata = {};
    draft.metadata.id = `SS-${nanoid()}`;
    draft.metadata.data.t = [start - offset, end];
  });

  return trimmedStack;
};

export default RemixContext;
