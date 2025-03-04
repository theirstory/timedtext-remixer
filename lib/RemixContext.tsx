/* eslint-disable @typescript-eslint/no-explicit-any */
import { PropsWithChildren, createContext, useReducer, useRef, LegacyRef, useEffect, useCallback } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { current, produce } from 'immer';
// import { useImmerReducer } from 'use-immer';
import { intersection } from 'interval-operations';
import { nanoid } from 'nanoid';

import type { State, Action, Timeline, Stack, Clip, Effect } from './interfaces';
import { timelineStacks } from './utils';
// import { TimedTextPlayerComponent } from './Player';
// import { ReactWebComponent } from '@lit/react';
import { TimedTextPlayer } from '@theirstoryinc/timedtext-player/dist/timedtext-player.js';

export const Context = createContext({
  sources: [] as Timeline[],
  state: {
    timestamp: Date.now(),
    remix: null,
  } as State,
  dispatch: (action: any) => action,
  // remixPlayerRef: null as LegacyRef<ReactWebComponent<TimedTextPlayer, { onactivate: string; onchange: string }>>,
  remixPlayerRef: null as LegacyRef<TimedTextPlayer>,
});

interface RemixContextProps extends PropsWithChildren {
  sources: Timeline[] | undefined;
  remix: Timeline | null | undefined;
  poster?: string;
  width?: number;
  height?: number;
  tools?: any[] | undefined;
}

const RemixContext = ({
  sources = [] as Timeline[],
  remix = null,
  poster,
  width,
  height,
  tools = [],
  children,
}: RemixContextProps): JSX.Element => {
  const initialState: State = {
    // sources,
    remix,
    poster,
    width, // FIXME
    height,
    playhead: 0,
  };

  const remixPlayerRef = useRef<TimedTextPlayer>(null);
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!remix) return;
    dispatch({ type: 'update', payload: remix });
  }, [remix]);

  useEffect(() => {
    try {
      console.log('reloadRemix', state.playhead, remixPlayerRef);
      const data = remixPlayerRef.current!.reloadRemix(state.playhead ?? 0); // TODO this dies on bad network?
      console.log({ data });
    } catch (error) {
      console.log('FIXME', error);
    }
  }, [state.remix, state.playhead, remixPlayerRef]);

  const onDragEnd = useCallback(
    (result: DropResult) => {
      // console.log({ result });
      // dropped outside the list
      // FIXME global
      // if (
      //   (!result.destination || result.draggableId !== globalThis?.foo) &&
      //   result.source.droppableId !== 'Remix-EMPTY'
      // ) {
      //   return;
      // }

      if (
        result.source.droppableId === result.destination?.droppableId &&
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

      if (result.source.droppableId.startsWith('Toolbar')) {
        dispatch({ type: 'add-widget', payload: { result, metadata: { component: result.draggableId }, tools } });
        return;
      }
    },
    [dispatch, sources, tools],
  );

  return (
    <Context.Provider value={{ sources, state, dispatch, remixPlayerRef }}>
      <DragDropContext onDragEnd={onDragEnd}>{children}</DragDropContext>
    </Context.Provider>
  );
};

const reducer = (state: State, action: Action): State => {
  console.log({ action, state });
  const nextState = produce(state, (draftState) => {
    draftState.timestamp = Date.now();
    switch (action.type) {
      case 'update': {
        draftState.remix = action.payload;
        return draftState;
      }
      case 'metadata': {
        const { id, metadata } = action.payload;
        const stackIndex = draftState.remix?.tracks.children[0].children.findIndex((s) => s.metadata?.id === id) ?? -1;
        if (stackIndex === -1) return draftState;

        const stack = draftState.remix?.tracks.children[0].children?.[stackIndex];
        stack!.metadata = { ...stack?.metadata, ...metadata };

        // update gap stack
        if (stack?.metadata?.gap && stack!.effects?.length !== undefined && stack!.effects?.length > 0) {
          console.log({ stack: current(stack) });
          stack!.source_range!.duration = stack?.metadata?.duration ?? 0;
          stack!.metadata!.data!.t = `1,${stack?.metadata?.duration}`;
          stack!.effects![0].source_range!.duration = stack?.metadata?.duration ?? 0;
          stack!.effects![0].metadata = { ...stack!.effects![0].metadata, ...stack!.metadata };
          stack!.effects![0].metadata!.data = {
            ...stack!.effects![0].metadata!.data,
            ...stack!.metadata,
            effect: { ...stack!.effects![0].metadata!.data, ...stack!.metadata }.template,
          };
        }

        applyEffects(draftState.remix?.tracks.children[0].children as Stack[]);
        const offset = draftState.remix?.tracks.children[0].children
          .slice(0, stackIndex)
          .reduce((acc, s) => acc + (s?.source_range?.duration ?? 0), 0);
        draftState.playhead = offset === 0 ? 0.1 : offset;
        return draftState;
      }

      case 'add-widget': {
        const { result, metadata, tools } = action.payload;
        const tool = tools.find((t: any) => t.name === result.draggableId) ?? { defaults: {} };

        const GAP = tool.defaults?.gap ?? false;
        const id = `E-${nanoid()}`;
        const stack = GAP
          ? {
              OTIO_SCHEMA: 'Stack.1',
              metadata: {
                ...metadata,
                ...tool.defaults,
                id: metadata.id ?? id,
                data: {
                  t: `1,${({ ...tool.defaults, ...metadata }.duration ?? 5) + 1}`,
                  'media-src': 'https://lab.hyperaud.io/tmp/black_video.mp4',
                },
                gap: true,
                title: 'GAP2',
                widget: 'title',
                component: false,
              },
              media_reference: {
                OTIO_SCHEMA: 'MediaReference.1',
                target: 'https://lab.hyperaud.io/tmp/black_video.mp4',
              },
              source_range: {
                OTIO_SCHEMA: 'TimeRange.1',
                start_time: 1,
                duration: ({ ...tool.defaults, ...metadata }.duration ?? 5) + 1,
              },
              children: [],
              effects: [
                {
                  OTIO_SCHEMA: 'Effect.1',
                  name: metadata?.title,
                  metadata: {
                    id: metadata?.id,
                    ...metadata,
                    data: {
                      ...tool.defaults,
                      ...metadata,
                      t: `1,5`,
                      effect: { ...tool.defaults, ...metadata }.template,
                    },
                  },
                  source_range: {
                    OTIO_SCHEMA: 'TimeRange.1',
                    start_time: 1,
                    duration: ({ ...tool.defaults, ...metadata }.duration ?? 5) + 1,
                  },
                },
              ],
            }
          : {
              OTIO_SCHEMA: 'Stack.1',
              metadata: {
                id: metadata.id ?? id,
                type: 'effect',
                ...tool.defaults,
                ...metadata,
              },
              source_range: {
                OTIO_SCHEMA: 'TimeRange.1',
                start_time: 0,
                duration: metadata.duration ?? 1,
              },
              children: [],
            };

        if (stack) draftState.remix?.tracks.children[0].children.splice(result?.destination?.index ?? 0, 0, stack);

        applyEffects(draftState.remix?.tracks.children[0].children as Stack[]);
        const stackIndex = draftState.remix?.tracks.children[0].children.findIndex((s) => s.metadata?.id === id) ?? -1;
        if (stackIndex === -1) return draftState;
        const offset = draftState.remix?.tracks.children[0].children
          .slice(0, stackIndex)
          .reduce((acc, s) => acc + (s?.source_range?.duration ?? 0), 0);
        draftState.playhead = offset === 0 ? 0.1 : offset;
        return draftState;
      }

      case 'add': {
        const [result, source, [start, end]] = action.payload;
        const stack = subClip(source, start, end);

        if (stack) draftState.remix?.tracks.children[0].children.splice(result?.destination?.index ?? 0, 0, stack);

        applyEffects(draftState.remix?.tracks.children[0].children as Stack[]);
        const stackIndex =
          draftState.remix?.tracks.children[0].children.findIndex((s) => s.metadata?.id === stack?.metadata?.id) ?? -1;
        if (stackIndex === -1) return draftState;
        const offset = draftState.remix?.tracks.children[0].children
          .slice(0, stackIndex)
          .reduce((acc, s) => acc + (s?.source_range?.duration ?? 0), 0);
        draftState.playhead = offset === 0 ? 0.1 : offset;
        return draftState;
      }

      case 'add-at': {
        const [sectionId, source, [start, end]] = action.payload;
        const stack = subClip(source, start, end);

        let index = draftState.remix?.tracks.children[0].children.findIndex((s) => s.metadata?.id === sectionId) ?? -1;
        if (index === -1) {
          index = 0;
        } else {
          index += 1;
        }
        if (stack) draftState.remix?.tracks.children[0].children.splice(index ?? 0, 0, stack);

        applyEffects(draftState.remix?.tracks.children[0].children as Stack[]);
        const stackIndex =
          draftState.remix?.tracks.children[0].children.findIndex((s) => s.metadata?.id === stack?.metadata?.id) ?? -1;
        if (stackIndex === -1) return draftState;
        const offset = draftState.remix?.tracks.children[0].children
          .slice(0, stackIndex)
          .reduce((acc, s) => acc + (s?.source_range?.duration ?? 0), 0);
        draftState.playhead = offset === 0 ? 0.1 : offset;
        return draftState;
      }

      case 'move': {
        const { source, destination } = action.payload;

        // eslint-disable-next-line no-unsafe-optional-chaining
        const [removed] = draftState.remix?.tracks.children[0].children.splice(source.index, 1) as Stack[];
        draftState.remix?.tracks.children[0].children.splice(destination?.index ?? 0, 0, removed);

        applyEffects(draftState.remix?.tracks.children[0].children as Stack[]);
        const stackIndex =
          draftState.remix?.tracks.children[0].children.findIndex((s) => s.metadata?.id === removed?.metadata?.id) ??
          -1;
        if (stackIndex === -1) return draftState;
        const offset = draftState.remix?.tracks.children[0].children
          .slice(0, stackIndex)
          .reduce((acc, s) => acc + (s?.source_range?.duration ?? 0), 0);
        draftState.playhead = offset === 0 ? 0.1 : offset;
        return draftState;
      }

      case 'move-down': {
        const { id } = action.payload;
        const stackIndex = draftState.remix?.tracks.children[0].children.findIndex((s) => s.metadata?.id === id) ?? -1;
        if (stackIndex === -1) return draftState;

        const stack = draftState.remix?.tracks.children[0].children[stackIndex];
        if (!stack) return draftState;

        draftState.remix?.tracks.children[0].children.splice(stackIndex, 1);
        draftState.remix?.tracks.children[0].children.splice(stackIndex + 1, 0, stack);

        applyEffects(draftState.remix?.tracks.children[0].children as Stack[]);
        const offset = draftState.remix?.tracks.children[0].children
          .slice(0, stackIndex)
          .reduce((acc, s) => acc + (s?.source_range?.duration ?? 0), 0);
        draftState.playhead = offset === 0 ? 0.1 : offset;

        return draftState;
      }

      case 'move-up': {
        const { id } = action.payload;
        const stackIndex = draftState.remix?.tracks.children[0].children.findIndex((s) => s.metadata?.id === id) ?? -1;
        if (stackIndex === -1) return draftState;

        const stack = draftState.remix?.tracks.children[0].children[stackIndex];
        if (!stack) return draftState;

        draftState.remix?.tracks.children[0].children.splice(stackIndex, 1);
        draftState.remix?.tracks.children[0].children.splice(stackIndex - 1, 0, stack);

        applyEffects(draftState.remix?.tracks.children[0].children as Stack[]);
        const offset = draftState.remix?.tracks.children[0].children
          .slice(0, stackIndex)
          .reduce((acc, s) => acc + (s?.source_range?.duration ?? 0), 0);
        draftState.playhead = offset === 0 ? 0.1 : offset;

        return draftState;
      }

      case 'remove': {
        const { id } = action.payload;
        const stackIndex = draftState.remix?.tracks.children[0].children.findIndex((s) => s.metadata?.id === id) ?? -1;
        if (stackIndex === -1) return draftState;

        draftState.remix?.tracks.children[0].children.splice(stackIndex, 1);

        applyEffects(draftState.remix?.tracks.children[0].children as Stack[]);

        if (draftState.remix?.tracks.children[0].children.length === 0) {
          //
        }

        const offset = draftState.remix?.tracks.children[0].children
          .slice(0, stackIndex)
          .reduce((acc, s) => acc + (s?.source_range?.duration ?? 0), 0);
        draftState.playhead = offset === 0 ? 0.1 : offset;

        return draftState;
      }

      case 'change-duration': {
        const { id, duration } = action.payload;
        const stackIndex = draftState.remix?.tracks.children[0].children.findIndex((s) => s.metadata?.id === id) ?? -1;
        if (stackIndex === -1) return draftState;

        const stack = draftState.remix?.tracks.children[0].children[stackIndex];
        if (!stack) return draftState;

        stack.source_range!.duration = duration;
        (stack.metadata as any)!.data!.t = [0, duration];

        const offset = draftState.remix?.tracks.children[0].children
          .slice(0, stackIndex)
          .reduce((acc, s) => acc + (s?.source_range?.duration ?? 0), 0);
        draftState.playhead = offset === 0 ? 0.1 : offset;

        return draftState;
      }

      default:
        console.error('Unhandled action', action);
      // throw new Error(`Unhandled action type: ${(action as Action).type}`);
    }
  }) as State;

  // console.log({ nextState: nextState });
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
        tt.metadata!.id = `TTC-${nanoid()}`;
        return tt;
      });

    const firstClipStart = clips[0]?.source_range?.start_time ?? 0;
    const firstClipDuration = clips[0]?.source_range?.duration ?? 0;
    const firstTTstart = (clips[0] as Clip)?.timed_texts?.[0].marked_range.start_time ?? 0;
    clips[0]!.source_range!.duration = firstClipDuration - (firstClipStart - firstTTstart);
    clips[0]!.source_range!.start_time = firstTTstart;
    (clips[0]!.metadata as any)!.data!.t = `${firstTTstart},${firstTTstart + firstClipDuration}`;

    // console.log({ firstClipStart, firstClipDuration, firstTTstart, sourceRange: current(clips[0]?.source_range) });

    clips.slice(1, -1).forEach((c) => {
      (c as Clip).timed_texts = (c as Clip)?.timed_texts?.map((tt) => {
        tt.metadata!.id = `TTC-${nanoid()}`;
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
        tt.metadata!.id = `TTC-${nanoid()}`;
        return tt;
      });

    const lastClipStart = clips[clips.length - 1]?.source_range?.start_time ?? 0;
    // const lastClipDuration = clips[clips.length - 1]?.source_range?.duration ?? 0; // FIXME
    const lastTTs = (clips[clips.length - 1] as Clip)?.timed_texts ?? [];
    const lastTTend =
      (lastTTs[lastTTs.length - 1]?.marked_range?.start_time ?? 0) +
      (lastTTs[lastTTs.length - 1]?.marked_range?.duration ?? 0);

    // clips[clips.length - 1]!.source_range!.duration = lastClipDuration - (lastClipStart - lastTTend);
    clips[clips.length - 1]!.source_range!.duration = lastTTend - lastClipStart;

    (clips[clips.length - 1]!.metadata as any)!.data!.t = `${lastClipStart},${lastTTend}`;

    // console.log({
    //   lastClipStart,
    //   lastClipDuration,
    //   lastTTend,
    //   sourceRange: current(clips[clips.length - 1]?.source_range),
    // });

    if (draft.source_range) {
      draft.source_range.start_time = start - offset;
      draft.source_range.duration = end - start;
    }

    draft.children[0].children = clips;

    if (!draft.metadata) (draft.metadata as any) = {};
    draft.metadata!.id = `SS-${nanoid()}`;
    (draft.metadata as any)!.data.t = [start - offset, end];
  });

  return trimmedStack;
};

const applyGaps = (stacks: Stack[]): Stack[] => {
  return stacks;
};

// TODO: fix component/widget use

export const applyEffects = (stacks: Stack[]): Stack[] => {
  // convert gaps
  stacks.forEach((stack) => {
    // skip proper gap
    if (stack?.metadata?.gap && stack!.effects?.length !== undefined && stack!.effects?.length > 0) return;
    // make gap
    if (
      stack?.metadata?.gap &&
      (stack!.effects?.length === undefined || (stack!.effects?.length !== undefined && stack!.effects?.length === 0))
    ) {
      const metadata = stack.metadata;
      const id = metadata?.id ?? `E-${nanoid()}`;

      stack.metadata = {
        ...metadata,
        id,
        data: {
          t: `1,${(metadata?.duration ?? 5) + 1}`,
          'media-src': 'https://lab.hyperaud.io/tmp/black_video.mp4',
        },
        gap: true,
        widget: 'title',
        component: false,
      };

      stack.media_reference = {
        OTIO_SCHEMA: 'MediaReference.1',
        target: 'https://lab.hyperaud.io/tmp/black_video.mp4',
      };

      stack.source_range = {
        OTIO_SCHEMA: 'TimeRange.1',
        start_time: 1,
        duration: (metadata?.duration ?? 5) + 1,
      };

      stack.effects = [
        {
          OTIO_SCHEMA: 'Effect.1',
          name: metadata?.title,
          metadata: {
            ...metadata,
            id,
            data: {
              ...metadata,
              t: `0,5`, // FIXME this is overrided in apply effects?
              effect: metadata?.template,
            },
          },
          source_range: {
            OTIO_SCHEMA: 'TimeRange.1',
            start_time: 1,
            duration: (metadata?.duration ?? 5) + 1,
          },
        },
      ];
    }
    // remove gap
    if (stack?.metadata?.gap === false && stack!.effects?.length !== undefined && stack!.effects?.length > 0) {
      const metadata = stack.metadata;
      const id = metadata?.id ?? `E-${nanoid()}`;

      stack.metadata = {
        ...metadata,
        id,
        type: 'effect',
        gap: false,
        component: 'title',
        widget: false,
      };
      stack.source_range = {
        OTIO_SCHEMA: 'TimeRange.1',
        start_time: 0,
        duration: metadata.duration ?? 1,
      };
      stack.effects = [];
    }
  });
  applyGaps(stacks); // TODO move above into this

  // iterate effects and insert to next stack
  stacks.forEach((stack, i, arr) => {
    if ((stack.metadata as any)?.type !== 'effect') return;

    const nextNonEffect = arr.slice(i + 1).find((s) => (s.metadata as any)?.type !== 'effect');
    // console.log({ nextNonEffect: nextNonEffect ? current(nextNonEffect) : null });
    if (!nextNonEffect) return;

    const prevNonEffect = arr
      .slice(0, i)
      .reverse()
      .find((s) => (s.metadata as any)?.type !== 'effect');
    // console.log({ prevNonEffect: prevNonEffect ? current(prevNonEffect) : null });

    const { metadata } = stack;
    const duration = prevNonEffect
      ? ((metadata as any)?.duration ?? 0) / ((metadata as any)?.apply === 'both' ? 2 : 1)
      : ((metadata as any)?.duration ?? 0);
    if (!nextNonEffect.source_range) throw new Error("nextNonEffect doesn't have source_range");
    const stackStart = nextNonEffect.source_range.start_time;

    const effect = {
      OTIO_SCHEMA: 'Effect.1',
      name: metadata?.title,
      metadata: {
        id: metadata?.id,
        ...metadata,
        data: {
          ...metadata,
          t: `${stackStart},${stackStart + (duration ?? 1)}`,
          effect: (metadata as any)?.template,
        },
      },
      source_range: {
        OTIO_SCHEMA: 'TimeRange.1',
        start_time: 0,
        duration: duration ?? 1,
      },
    } as Effect;

    if (!nextNonEffect.effects) nextNonEffect.effects = [];
    const effectIndex = nextNonEffect.effects?.findIndex((e) => e.metadata?.id === metadata?.id) ?? -1;
    if (effectIndex === -1) {
      if (nextNonEffect.effects.length === 0) {
        nextNonEffect.effects = [effect];
      } else nextNonEffect.effects?.push(effect);
    } else {
      nextNonEffect.effects?.splice(effectIndex, 1, effect);
    }
  });

  // reverse iterate effects and insert to next (aka prev) stack
  Array.from(stacks)
    .reverse()
    .forEach((stack, i, arr) => {
      if ((stack.metadata as any)?.type !== 'effect') return;

      const nextNonEffect = arr.slice(i + 1).find((s) => (s.metadata as any)?.type !== 'effect');
      if (!nextNonEffect) return;

      const prevNonEffect = arr
        .slice(0, i)
        .reverse()
        .find((s) => (s.metadata as any)?.type !== 'effect');

      const { metadata } = stack;
      if ((metadata as any)?.apply === 'next') return;
      const duration = prevNonEffect
        ? ((metadata as any)?.duration ?? 0) / ((metadata as any)?.apply === 'both' ? 2 : 1)
        : ((metadata as any)?.duration ?? 0);

      const stackStart = nextNonEffect.source_range?.start_time ?? 0;
      const stackEnd = stackStart + (nextNonEffect.source_range?.duration ?? 0);

      const effect = {
        OTIO_SCHEMA: 'Effect.1',
        name: metadata?.title,
        metadata: {
          id: metadata?.id,
          ...metadata,
          reverse: true,
          data: {
            ...metadata,
            t: `${stackEnd - (duration ?? 1)},${stackEnd}`,
            // effect: metadata.template,
            effect: (metadata as any)?.template + '-reverse',
            reverse: true,
          },
        },
        source_range: {
          OTIO_SCHEMA: 'TimeRange.1',
          start_time: stackEnd - (duration ?? 1),
          duration: duration ?? 1,
        },
      } as Effect;

      if (!nextNonEffect.effects) nextNonEffect.effects = [];
      const effectIndex = nextNonEffect.effects?.findIndex((e) => e.metadata?.id === metadata?.id) ?? -2;
      console.log({ effect, nextNonEffect, effectIndex });
      if (effectIndex === -1) {
        if (nextNonEffect.effects.length === 0) {
          nextNonEffect.effects = [effect];
        } else nextNonEffect.effects?.push(effect);
      } else {
        nextNonEffect.effects?.splice(effectIndex, 1, effect);
      }
    });

  // iterate non-effects and check for next effects
  stacks.forEach((stack, i, arr) => {
    if ((stack.metadata as any)?.type === 'effect') return;
    if ((stack.metadata as any)?.gap) return;

    if (!stack.effects) stack.effects = [];

    stack.effects.forEach((effect) => {
      let inEffect = false;
      const prevStackEffectIndex = arr
        .slice(0, i)
        .findIndex((s) => s.metadata?.id === effect.metadata?.id && !s.metadata?.gap);
      if (prevStackEffectIndex > -1) {
        inEffect = !arr.slice(prevStackEffectIndex, i).find((s) => (s.metadata as any)?.type !== 'effect');
      }

      const nextStackEffectIndex = arr
        .slice(i + 1)
        .findIndex((s) => s.metadata?.id === effect.metadata?.id && !s.metadata?.gap);
      if (nextStackEffectIndex > -1) {
        inEffect = !arr.slice(i + 1, i + 1 + nextStackEffectIndex).find((s) => (s.metadata as any)?.type !== 'effect');
      }

      if (!inEffect) {
        stack.effects = stack.effects?.filter((e) => e.metadata?.id !== effect.metadata?.id);
      }
    });
  });

  // console.log({ applyEffects: current(stacks) });

  return stacks;
};

export default RemixContext;
