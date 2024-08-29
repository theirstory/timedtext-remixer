/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useReducer, useMemo, useEffect, PropsWithChildren, useContext, useState, useCallback } from 'react';
import {
  Box,
  Tab,
  Tabs,
  TextField,
  Chip,
  Typography,
  IconButton,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  SelectChangeEvent,
  FormGroup,
  FormControlLabel,
  Switch,
} from '@mui/material';
import TitleIcon from '@mui/icons-material/Title';
import ShortTextIcon from '@mui/icons-material/ShortText';
import SubjectIcon from '@mui/icons-material/Subject';
import DeleteIcon from '@mui/icons-material/Delete';

import scrollIntoView from 'smooth-scroll-into-view-if-needed';
import Timecode from 'smpte-timecode';

import RemixContext, { Context } from '../lib/RemixContext.js';
import RemixSources from '../lib/RemixSources.js';
import RemixDestination from '../lib/RemixDestination.js';
import { ts2timeline } from '../lib/utils.js';
import type { Timeline } from '../lib/interfaces';

import A from './data/A.json';
import B from './data/B.json';
import C from './data/C.json';
import { EMPTY_REMIX } from '../lib/utils.js';

import './App.css';

function App() {
  const [tabValue, setTabValue] = React.useState(0);
  const [autoscroll, setAutoscroll] = React.useState(false);
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  const handleAutoscrollChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAutoscroll(event.target.checked);
  };

  const sources = useMemo(() => [ts2timeline(A), ts2timeline(B), ts2timeline(C)] as Timeline[], []);
  const remix = EMPTY_REMIX;

  const active = useMemo(() => sources[tabValue]?.metadata?.id, [tabValue, sources]);

  const remixRef = React.useRef<any>();
  const autoscrollRef = React.useRef<any>();
  const [css, dispatchCss] = useReducer((state: any, action: any) => ({ ...state, ...action }), {});

  useEffect(() => {
    autoscrollRef.current = autoscroll;
  }, [autoscroll]);

  useEffect(() => {
    if (!remixRef.current) return;

    const remixRefCurrent = remixRef.current;
    const listener = remixRefCurrent.addEventListener('playhead', (e: any) => {
      const { pseudo, transcript, section, clip, timedText } = e.detail;
      console.log('playhead', e.detail);

      const { sid } = section?.metadata?.data ?? { sid: 'default' };
      const sectionEl = document.querySelector(section.metadata.selector);

      if (timedText) {
        const { selector, element } = timedText.metadata;

        const time = element?.getAttribute('data-t')?.split(',')?.[0];
        const players = Array.from(document.querySelectorAll(`div[data-sid="${sid}"] timedtext-player`));
        players.forEach((player) => {
          if (pseudo && autoscrollRef.current) {
            const sourceIndex = sources.findIndex((s) => s?.metadata?.sid === sid);
            setTabValue(sourceIndex);
          } else {
            // const node = document.querySelector(selector);
            // if (node && autoscrollRef.current)
            //   scrollIntoView(node, {
            //     behavior: 'smooth',
            //   });
          }
          if (pseudo || !time || e.target === player) return;
          (player as any).currentPseudoTime = parseFloat(time);
        });

        const node = sectionEl.querySelector(clip.metadata.selector);
        console.log('node', clip.metadata.selector);
        if (node && (autoscrollRef.current || !pseudo)) {
          // console.log('scrolling', {
          //   node,
          //   selector: clip.metadata.selector,
          //   autoscroll: autoscrollRef.current,
          //   pseudo,
          // });
          scrollIntoView(node, {
            behavior: 'smooth',
          });
        }

        const cssText = `
          ${transcript} {
            ${selector} {
              color: #0944f3 !important;
              text-decoration: underline;
            }

            ${selector} ~ span {
              color: #717171 !important;
            }

            ${clip.metadata.selector} ~ p, div:has(span[data-t="${element.getAttribute('data-t')}"]) ~ div {
              color: #717171;
            }

            ${clip.metadata.selector.replace('> p', '')} ~ div.BlockWrapper, div:has(span[data-t="${element.getAttribute('data-t')}"]) ~ div {
              color: #717171 !important;
            }

            ${section.metadata.selector} ~ section, div[data-rfd-draggable-id="${section.metadata.selector.replace('#', '')}"] ~ div {
              color: #717171;
            }
          }
        `;

        dispatchCss({ [transcript]: cssText });
      }
    });

    return () => remixRefCurrent.removeEventListener('playhead', listener);
  }, [sources]);

  // Left Toolbar tools
  const toolsLeft = useMemo(
    () => [
      // {
      //   name: 'scroll',
      //   type: 'scroll',
      //   draggable: false,
      //   toolBarComponent: <Checkbox defaultChecked />, // <Chip label="Scroll" variant="outlined" />,
      //   timelineComponent: null,
      //   defaults: {
      //     value: true,
      //   },
      // },
    ],
    [],
  );

  // Right Toolbar tools
  const tools = useMemo(
    () => [
      {
        name: 'title',
        type: 'title',
        draggable: true,
        toolBarComponent: <Chip label="Title" variant="outlined" />,
        // timelineComponent: <TitleTool />,
        timelineComponent: TitleTool,
        defaults: {
          title: 'Title',
          subtitle: 'Subtitle',
          template: '#title-full',
          duration: 5,
        },
      },
      {
        name: 'fin',
        type: 'fin',
        draggable: true,
        toolBarComponent: <Chip label="Fade" variant="outlined" />,
        // timelineComponent: <FadeInTool />,
        timelineComponent: FadeInTool,
        defaults: {
          title: 'Fade',
          template: '#fin',
          duration: 5,
        },
      },
    ],
    [],
  );

  return (
    <>
      <style>
        {`
          ${Object.values(css).join('\n\n')}


          /* temp style of the empty remix entry */
          #___S-EMPTY2:only-child {
            display: none;
            border: 1px solid blue;
            opacity: 10;
          }

          #EmptyRemix {
            display: none;
          }

          div[data-rfd-draggable-id="S-EMPTY"] section {
            display: none;
          }

          div[data-rfd-draggable-id="S-EMPTY"] ~ #EmptyRemix {
            display: block;
          }

          section p {
            cursor: pointer;
          }

        `}
      </style>
      <Box id="container" ref={remixRef}>
        <RemixContext
          sources={sources}
          remix={remix}
          poster="https://placehold.co/640x360?text=16:9"
          width={620}
          height={360}
          tools={tools}
        >
          <Box id="tabs-container">
            <FormGroup style={{ float: 'right' }}>
              <FormControlLabel
                control={<Switch checked={autoscroll} onChange={handleAutoscrollChange} size="small" />}
                label={`Live context view ${autoscroll ? 'ON' : 'OFF'}`}
              />
            </FormGroup>
            <Tabs
              TabIndicatorProps={{ style: { display: 'none' } }}
              value={tabValue}
              onChange={handleTabChange}
              aria-label="tabbed content"
              sx={{ minHeight: '0px' }}
            >
              {sources.map((source, i) => (
                <Tab
                  sx={{
                    borderRadius: '8px 8px 0px 0px',
                    borderTop: '1px solid var(--Dark-20, #D9DCDE)',
                    borderRight: '1px solid var(--Dark-20, #D9DCDE)',
                    // borderLeft: '1px solid var(--Dark-20, #D9DCDE)',
                    backgroundColor: 'var(--Light-100, #FFF)',
                    textTransform: 'none',
                    fontSize: '14px',
                    fontWeight: 700,
                    minHeight: '0px',
                    padding: '6px 8px 6px 8px',
                    lineHeight: '20px',
                    '&.Mui-selected': {
                      color: '#239B8B',
                      borderBottom: 'none',
                    },
                    borderBottom: tabValue !== i ? '1px solid var(--Dark-20, #D9DCDE)' : 'none',
                  }}
                  key={i}
                  label={source?.metadata?.story?.title}
                />
              ))}
            </Tabs>
          </Box>
          <Box id="columns-container" display="flex" columnGap="20px">
            <Box
              id="left-column-container"
              borderRadius="0px 8px 8px 8px"
              sx={{ backgroundColor: '#FFFFFF', flex: 1 }}
              paddingX="24px"
            >
              <RemixSources
                active={active}
                PlayerWrapper={LeftPlayerWrapper}
                SourceWrapper={SourceWrapper}
                BlockWrapper={BlockWrapperLeft}
                SelectionWrapper={SelectionWrapper}
                tools={toolsLeft}
              />
            </Box>

            <Box
              id="right-column-container"
              borderRadius="8px"
              sx={{ backgroundColor: '#FFFFFF', flex: 1 }}
              display="flex"
              flexDirection="column"
              paddingX="24px"
            >
              <RemixDestination
                PlayerWrapper={
                  // isDestinationEmpty ? EmptyPlayer :
                  RightPlayerWrapper
                }
                DestinationWrapper={DestinationWrapper}
                SectionContentWrapper={SectionContentWrapper}
                BlockWrapper={BlockWrapperRight}
                tools={tools}
                Empty={EmptyRemix}
              />
            </Box>
          </Box>
        </RemixContext>
      </Box>
    </>
  );
}

// Tools
const FadeInTool = (props: { id?: string; name?: string; template?: string; duration?: number }): JSX.Element => {
  const { dispatch } = useContext(Context);
  const id = props.id ?? `FIN-${Date.now()}`;
  const { template } = props;
  const name = props.name ?? 'Fade In';

  const [duration, setDuration] = useState<number>(props.duration ?? 5);

  const handleDurationChange = useCallback(
    ({ target: { value } }: SelectChangeEvent<{ value: unknown }>) => setDuration(value as unknown as number),
    [],
  );
  const handleSave = useCallback(
    () => dispatch({ type: 'metadata', payload: { id, metadata: { id, template, duration } } }),
    [id, template, duration, dispatch],
  );
  const handleRemove = useCallback(() => dispatch({ type: 'remove', payload: { id } }), [id, dispatch]);

  return (
    <div style={{ backgroundColor: 'white', padding: 5 }} className="widget">
      <TitleIcon />
      {name}
      <IconButton onClick={handleRemove}>
        <DeleteIcon />
      </IconButton>
      <Select value={duration as any} label="seconds" onChange={handleDurationChange} onBlur={handleSave}>
        <MenuItem value={5}>5</MenuItem>
        <MenuItem value={10}>10</MenuItem>
        <MenuItem value={15}>15</MenuItem>
      </Select>
    </div>
  );
};

const TitleTool = (props: {
  id?: string;
  name?: string;
  title?: string;
  subtitle?: string;
  template?: string;
  duration?: number;
}): JSX.Element => {
  const { dispatch } = useContext(Context);
  const id = props.id ?? `Title-${Date.now()}`;
  const name = props.name ?? 'Title';
  const [title, setTitle] = useState<string>(props.title ?? '');
  const [subtitle, setSubtitle] = useState<string>(props.subtitle ?? '');
  const [template, setTemplate] = useState<string>(props.template ?? '#title-full');
  const [duration, setDuration] = useState<number>(props.duration ?? 5);

  const handleTitleChange = useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => setTitle(value),
    [],
  );
  const handleSubtitleChange = useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => setSubtitle(value),
    [],
  );
  const handleTemplateChange = useCallback(
    (_event: React.MouseEvent<HTMLElement>, value: string) => setTemplate(value),
    [],
  );
  const handleDurationChange = useCallback(
    ({ target: { value } }: SelectChangeEvent<{ value: unknown }>) => setDuration(value as unknown as number),
    [],
  );
  const handleSave = useCallback(
    () => dispatch({ type: 'metadata', payload: { id, metadata: { id, title, subtitle, template, duration } } }),
    [id, title, subtitle, template, duration, dispatch],
  );
  const handleRemove = useCallback(() => dispatch({ type: 'remove', payload: { id } }), [id, dispatch]);

  return (
    <div style={{ backgroundColor: 'white', padding: 5 }} className="widget">
      <TitleIcon />
      {name}
      <IconButton onClick={handleRemove}>
        <DeleteIcon />
      </IconButton>
      <ToggleButtonGroup value={template} exclusive onChange={handleTemplateChange} onBlur={handleSave}>
        <ToggleButton value="#title-lower3rds">
          <ShortTextIcon />
        </ToggleButton>
        <ToggleButton value="#title-full">
          <SubjectIcon />
        </ToggleButton>
      </ToggleButtonGroup>
      <Select value={duration as any} label="seconds" onChange={handleDurationChange} onBlur={handleSave}>
        <MenuItem value={5}>5</MenuItem>
        <MenuItem value={10}>10</MenuItem>
        <MenuItem value={15}>15</MenuItem>
      </Select>
      <TextField
        label="Title"
        value={title}
        style={{ width: '100%' }}
        onChange={handleTitleChange}
        onBlur={handleSave}
      />
      <TextField
        label="Subtitle"
        value={subtitle}
        style={{ width: '100%' }}
        onChange={handleSubtitleChange}
        onBlur={handleSave}
      />
    </div>
  );
};

// Wrappers

const EmptyRemix = (): JSX.Element => (
  <Box id="EmptyRemix" height="302px" borderRadius="8px" sx={{ backgroundColor: '#f6e52c', textAlign: 'center' }}>
    <Typography>TheirStory</Typography>
    <p>Drop here</p>
  </Box>
);

// const EmptyPlayer = (): JSX.Element => (
//   <Box id="EmptyPlayer" height="302px" borderRadius="8px" sx={{ backgroundColor: '#464C53', textAlign: 'center' }}>
//     <Typography>TheirStory</Typography>
//   </Box>
// );

const LeftPlayerWrapper = ({ children }: PropsWithChildren): JSX.Element => (
  <Box
    id="leftPlayerWrapper"
    marginTop="16px"
    borderRadius="8px"
    sx={{ backgroundColor: '#8E979F', textAlign: 'center', width: '100%', aspectRatio: '16/9' }}
  >
    {children}
  </Box>
);
const RightPlayerWrapper = ({ children }: PropsWithChildren): JSX.Element => (
  <Box
    id="rightPlayerWrapper"
    marginTop="16px"
    borderRadius="8px"
    sx={{ backgroundColor: '#8E979F', textAlign: 'center', width: '100%', aspectRatio: '16/9' }}
  >
    {children}
  </Box>
);

// Left transcript
const SourceWrapper = ({ children }: PropsWithChildren): JSX.Element => (
  <Box
    id="sourceWrapper"
    sx={{
      backgroundColor: '#FFFFFF',
      paddingY: '16px',
      marginTop: '16px',
      maxHeight: 'calc(100vh - 595px)',
      overflowY: 'auto',
      borderRadius: '8px',
      '& p': {
        fontFamily: 'Public Sans, sans-serif',
        // color: '#000000',
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: '20px',
      },
    }}
  >
    {children}
  </Box>
);

// Right transcript
const DestinationWrapper = ({ children }: PropsWithChildren): JSX.Element => (
  <Box
    id="destinationWrapper"
    sx={{
      backgroundColor: '#FFFFFF',
      paddingY: '16px',
      maxHeight: 'calc(100vh - 622px)',
      minHeight: 'calc(100vh - 622px)',
      overflowY: 'auto',
      borderRadius: '8px',
      '& p': {
        // color: '#000000',
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: '20px',
        margin: '0px',
      },
      '& section': {
        backgroundColor: '#F7F9FC',
        borderRadius: '8px',
        border: '1px solid #D9DCDE',
        padding: '12px',
        marginBottom: '12px',
      },
    }}
  >
    {children}
  </Box>
);

const SelectionWrapper = ({ children }: PropsWithChildren): JSX.Element => (
  <span className="SelectionWrapper" style={{ backgroundColor: '#d3ebe8' }}>
    {children}
  </span>
);

// Paragraph wrapper
interface BlockWrapperProps extends PropsWithChildren {
  metadata?: { [key: string]: any };
  start?: number;
  offset?: number;
}

const BlockWrapperLeft = ({ start = 0, offset = 0, metadata, children }: BlockWrapperProps): JSX.Element => {
  const {
    data: { t },
    speaker,
  } = metadata ?? { data: { t: '' }, speaker: '' };
  const timecode = useMemo(() => {
    const [pStart = 0] = t.split(',').map(parseFloat);
    return new Timecode((pStart - start + offset) * 30, 30).toString().split(':').slice(0, 3).join(':');
  }, [t, start, offset]);
  return (
    <div className="BlockWrapper">
      <div style={{ userSelect: 'none' }}>
        <small>
          <code>{timecode}</code> {speaker}
        </small>
      </div>
      {children}
    </div>
  );
};

const BlockWrapperRight = ({ children }: BlockWrapperProps): JSX.Element => (
  <div className="BlockWrapper">{children}</div>
);

interface SectionContentWrapperProps extends PropsWithChildren {
  metadata?: { [key: string]: any };
}

const SectionContentWrapper = ({ metadata, children }: SectionContentWrapperProps): JSX.Element => {
  const { dispatch } = useContext(Context);
  const { id, title } = metadata ?? { title: 'No title?' };
  const handleRemove = useCallback(() => dispatch({ type: 'remove', payload: { id } }), [id, dispatch]);

  return (
    <div className="SectionContentWrapper">
      <div style={{ userSelect: 'none' }}>
        <small>Title: {title}</small>
        <IconButton onClick={handleRemove}>
          <DeleteIcon />
        </IconButton>
      </div>
      {children}
    </div>
  );
};

// Not used yet
// const ToolBarWrapper = ({ children }: PropsWithChildren): JSX.Element => (
//   <div className="ToolBarWrapper" style={{ border: '1px solid green' }}>
//     {children}
//   </div>
// );

export default App;
