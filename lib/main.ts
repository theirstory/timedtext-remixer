/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    DropResult,
  } from "@hello-pangea/dnd";

import { createComponent } from "@lit/react";
import { TimedTextPlayer } from "../../timedtext-player/dist/timedtext-player.js";
interface Block {
    id: string;
    data: any; // Replace 'any' with a more specific type if possible
    metadata: any; // Replace 'any' with a more specific type if possible
  }
  
  type State = Block[];
  
  type Action =
    | { type: "move"; payload: DropResult }
    | { type: "add"; payload: [DropResult, Block] };
  // | { type: "remove"; payload: { id: string } }
  // | { type: "update"; payload: Block };
  
  const emptyState: State = [];

  const TimedTextPlayerComponent = createComponent({
    tagName: "timedtext-player",
    elementClass: TimedTextPlayer,
    react: React,
    events: {
      onactivate: "activate",
      onchange: "change",
    },
  });

  function blockReducer(state: State, action: Action): State {
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
  
      case "add": {
        const [result, block] = action.payload;
        const { source, destination } = result;
        const resultState = [...state];
        // const [removed] = resultState.splice(source.index, 1);
        resultState.splice(destination.index, 0, block);
        return resultState;
      }
  
      case "move": {
        const { source, destination } = action.payload;
        const result = [...state];
        const [removed] = result.splice(source.index, 1);
        result.splice(destination.index, 0, removed);
        return result;
      }
  
      default:
        throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
  
  function track2blocks(track: any): State {
    if (!track) return [];
  
    return track.children.map((section: any) => {
      return {
        id: section?.metadata?.id ?? nanoid(), // TODO use urlAlphabet
        data: section,
        metadata: section?.metadata ?? {},
      };
    });
  }
  
  function trimBlock(block: Block, interval: [number, number]): Block {
    const { data, metadata } = block;
    const { children } = data;
    const start = data.source_range.start_time;
    const end = data.source_range.duration + start;
  
    const trimmedChildren = children
      .filter((child) => {
        const childStart = child.source_range.start_time;
        const childEnd = child.source_range.duration + childStart;
        return intersection([childStart, childEnd], interval);
      })
      .map((child) => {
        // trim timed_texts
        const { timed_texts } = child;
        const trimmedTexts = timed_texts.filter((text) => {
          const textStart = text.marked_range.start_time;
          const textEnd = text.marked_range.duration + textStart;
          return intersection([textStart, textEnd], interval);
        });
        return {
          ...child,
          timed_texts: trimmedTexts,
        };
      });
  
    return {
      id: nanoid(),
      data: {
        ...data,
        source_range: {
          start_time: interval[0],
          duration: interval[1] - interval[0],
        },
        children: trimmedChildren,
      },
      metadata, // TODO fix data-t
    };
  }