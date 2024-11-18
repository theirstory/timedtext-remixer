/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementType, useContext, useMemo, useState, useEffect } from 'react';

import { Context } from './RemixContext';
import { PlainDiv, PlainSpan } from './components';
import RemixSource from './RemixSource';

import type { Timeline } from './interfaces';

interface RemixSourcesProps {
  PlayerWrapper?: ElementType;
  SourceWrapper?: ElementType;
  BlockWrapper?: ElementType;
  SelectedBlocksWrapper?: ElementType;
  SelectionWrapper?: ElementType;
  ToolbarWrapper?: ElementType;
  id?: (t: Timeline) => string | undefined;
  active: string | undefined;
  tools?: any[] | undefined;
  Empty?: ElementType | undefined;
}

const RemixSources = ({
  PlayerWrapper = PlainDiv as unknown as ElementType,
  SourceWrapper = PlainDiv as unknown as ElementType,
  BlockWrapper = PlainDiv as unknown as ElementType,
  SelectedBlocksWrapper = PlainDiv as unknown as ElementType,
  SelectionWrapper = PlainSpan as unknown as ElementType,
  ToolbarWrapper = PlainDiv as unknown as ElementType,
  id = (source: Timeline) => source?.metadata?.id,
  active,
  tools = [],
  Empty = PlainDiv as unknown as ElementType,
}: RemixSourcesProps): JSX.Element => {
  const {
    sources,
    state: { timestamp = 0 },
  } = useContext(Context);

  const [activeSourceLastChange, setActiveSourceLastChange] = useState(0);
  const activeSource = useMemo(() => sources?.find((source) => id(source) === active), [active, sources, id]);

  useEffect(() => setActiveSourceLastChange(Date.now()), [activeSource]);

  const latestTimestamp = Math.max(timestamp, activeSourceLastChange);

  return (
    <>
      {sources.length === 0 ? (
        <Empty />
      ) : (
        sources?.map((source, i) => (
          <RemixSource
            key={id(source) ?? `T${i}`}
            index={i}
            active={activeSource ? id(activeSource) === id(source) : i === 0}
            PlayerWrapper={PlayerWrapper}
            SourceWrapper={SourceWrapper}
            BlockWrapper={BlockWrapper}
            SelectedBlocksWrapper={SelectedBlocksWrapper}
            SelectionWrapper={SelectionWrapper}
            ToolbarWrapper={ToolbarWrapper}
            source={source}
            timestamp={latestTimestamp}
            tools={tools}
          />
        ))
      )}
    </>
  );
};

export default RemixSources;
