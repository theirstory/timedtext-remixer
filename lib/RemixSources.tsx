import { ElementType, useContext, useMemo } from 'react';

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
  id?: (t: Timeline) => string | undefined;
  active: string | undefined;
}

const RemixSources = ({
  PlayerWrapper = PlainDiv as unknown as ElementType,
  SourceWrapper = PlainDiv as unknown as ElementType,
  BlockWrapper = PlainDiv as unknown as ElementType,
  SelectedBlocksWrapper = PlainDiv as unknown as ElementType,
  SelectionWrapper = PlainSpan as unknown as ElementType,
  id = (source: Timeline) => source?.metadata?.id,
  active,
}: RemixSourcesProps): JSX.Element => {
  const {
    state: { sources },
  } = useContext(Context);

  const activeSource = useMemo(() => sources?.find((source) => id(source) === active), [active, sources, id]);

  return (
    <>
      {sources?.map((source, i) => (
        <RemixSource
          key={id(source) ?? `T${i}`}
          active={activeSource ? id(activeSource) === id(source) : i === 0}
          PlayerWrapper={PlayerWrapper}
          SourceWrapper={SourceWrapper}
          BlockWrapper={BlockWrapper}
          SelectedBlocksWrapper={SelectedBlocksWrapper}
          SelectionWrapper={SelectionWrapper}
          source={source}
        />
      ))}
    </>
  );
};

export default RemixSources;
