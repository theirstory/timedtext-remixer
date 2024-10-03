/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useEffect, PropsWithChildren, useContext, useState, useCallback, useReducer } from 'react';
import { renderToString } from 'react-dom/server';
import {
  Box,
  Button,
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
  Toolbar,
  Tooltip,
  Switch,
  Stack,
  Divider,
  Drawer,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LaunchIcon from '@mui/icons-material/Launch';
import InputIcon from '@mui/icons-material/Input';
import SaveIcon from '@mui/icons-material/Save';
import PostAddIcon from '@mui/icons-material/PostAdd';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import TitleIcon from '@mui/icons-material/Title';
import FlipIcon from '@mui/icons-material/Flip';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import ShortTextIcon from '@mui/icons-material/ShortText';
import SubjectIcon from '@mui/icons-material/Subject';
import DeleteIcon from '@mui/icons-material/Delete';

import scrollIntoView from 'smooth-scroll-into-view-if-needed';
import Timecode from 'smpte-timecode';

import RemixContext, { Context } from '../lib/RemixContext.js';
import RemixSources from '../lib/RemixSources.js';
import RemixDestination from '../lib/RemixDestination.js';
import { ts2timeline } from '../lib/utils.js';
import { StaticRemix } from '../lib/StaticRemix.js';
import type { Timeline } from '../lib/interfaces';

import A from './data/A.json';
import B from './data/B.json';
import C from './data/C.json';
import T1 from './data/and_then_there_were_none.json';
import T2 from './data/angel_on_my_shoulder.json';
import T3 from './data/the_great_rupert.json';
import { EMPTY_REMIX } from '../lib/utils.js';

import './App.css';

const TEMPLATES = `
  <template id="video1">
    <video src="\${src}" disablePictureInPicture controlsList="nodownload">
    </video>
  </template>

  <template id="fin">
    <div style="position: absolute; top: 0; left: 0; height: 100%; width: 100%; background-color:  rgba(0, 0, 0, calc(1 - \${progress}));">
    </div>
  </template>

  <template id="fin-reverse">
    <div style="position: absolute; top: 0; left: 0; height: 100%; width: 100%; background-color:  rgba(0, 0, 0, \${progress});">
    </div>
  </template>

  <template id="title-full">
    <div class="title-full" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, .7);">
      <h2 style="color: white; text-align: center; margin-top: 30%;">\${title}</h2>
      <h3 style="color: white; text-align: center;">\${subtitle}</h3>
      <style>
        .title-full {
          container-type: size;
          _opacity: \${fadeIn};
        }

        @container (min-width: 1500px) {
          h3 {
            color: red !important;
          }
        }
      </style>
    </div>
  </template>

  <template id="title-full-reverse">
    <div class="title-full" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, .7);">
      <h2 style="color: white; text-align: center; margin-top: 30%;">\${title}</h2>
      <h3 style="color: white; text-align: center;">\${subtitle}</h3>
      <style>
        .title-full {
          container-type: size;
          _opacity: \${fadeIn};
        }

        @container (min-width: 1500px) {
          h3 {
            color: red !important;
          }
        }
      </style>
    </div>
  </template>

  <template id="title-lower3rds">
    <div class="title-lower3rds" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 33%; background-color: rgba(0, 0, 0, .7);">
      <h2 style="color: white; text-align: left; padding-left: 20px; margin-left: 0">\${title}</h2>
      <h3 style="color: white; text-align: left; padding-left: 20px; margin-left: 0">\${subtitle}</h3>
      <style>
        .title-lower3rds {
          container-type: size;
          _opacity: \${fadeIn};
        }

        @container (min-width: 1500px) {
          h3 {
            color: red !important;
          }
        }
      </style>
    </div>
  </template>

  <template id="title-lower3rds-reverse">
    <div class="title-lower3rds" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 33%; background-color: rgba(0, 0, 0, .7);">
      <h2 style="color: white; text-align: left; padding-left: 20px; margin-left: 0">\${title}</h2>
      <h3 style="color: white; text-align: left; padding-left: 20px; margin-left: 0">\${subtitle}</h3>
      <style>
        .title-lower3rds {
          container-type: size;
          _opacity: \${fadeIn};
        }

        @container (min-width: 1500px) {
          h3 {
            color: red !important;
          }
        }
      </style>
    </div>
  </template>
`;

function App() {
  const [remix, setRemix] = useState<Timeline>(EMPTY_REMIX);
  const [tabValue, setTabValue] = React.useState(0);
  const [autoscroll, setAutoscroll] = React.useState(false);
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  const handleAutoscrollChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAutoscroll(event.target.checked);
  };

  const allSources = useMemo(
    () =>
      [ts2timeline(A), ts2timeline(B), ts2timeline(C), ts2timeline(T1), ts2timeline(T2), ts2timeline(T3)] as Timeline[],
    [],
  );

  const [sources, dispatchSources] = useReducer(
    (state: any, action: any) => {
      switch (action.type) {
        case 'add':
          return [...state, action.payload];
        case 'remove':
          return state.filter((s: any) => s.metadata.id !== action.payload.id);
        default:
          return state;
      }
    },
    [ts2timeline(T1), ts2timeline(T2)],
  );

  // const initRemix = EMPTY_REMIX;

  const active = useMemo(() => sources[tabValue]?.metadata?.id, [tabValue, sources]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [exportDrawerOpen, setExportDrawerOpen] = useState(false);
  const toggleDrawer = (drawerOpen: boolean) => () => {
    setDrawerOpen(drawerOpen);
  };
  const toggleExportDrawer = (exportDrawerOpen: boolean) => () => {
    setExportDrawerOpen(exportDrawerOpen);
  };

  const remixRef = React.useRef<any>();
  const autoscrollRef = React.useRef<any>();
  // const [css, dispatchCss] = useReducer((state: any, action: any) => ({ ...state, ...action }), {});

  useEffect(() => {
    autoscrollRef.current = autoscroll;
  }, [autoscroll]);

  useEffect(() => {
    if (!remixRef.current) return;

    const remixRefCurrent = remixRef.current;
    const listener = remixRefCurrent.addEventListener('playhead', (e: any) => {
      const { pseudo, transcript, section, clip, timedText } = e.detail;
      // console.log('playhead', e.detail);
      const css2: { [key: string]: string } = {};

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

        const node = sectionEl?.querySelector(clip.metadata.selector);
        // console.log('node', clip.metadata.selector);
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

        // dispatchCss({ [transcript]: cssText });
        css2[transcript] = cssText;
        const style = document.getElementById('injected');
        style!.innerHTML = Object.values(css2).join('\n\n');
      }
    });

    return () => remixRefCurrent.removeEventListener('playhead', listener);
  }, [sources]);

  useEffect(() => {
    if (!remixRef.current) return;

    const remixRefCurrent = remixRef.current;
    const listener = remixRefCurrent.addEventListener('remixChange', (e: any) => {
      console.log('remixChange', e.detail);
      setRemix(e.detail);
    });
    return () => remixRefCurrent.removeEventListener('remixChange', listener);
  }, [remixRef]);

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

  const onTabClose = (e: Event, source: Timeline) => {
    e.stopPropagation();
    dispatchSources({ type: 'remove', payload: { id: source?.metadata?.id } });
  };

  const openTab = (source: Timeline) => {
    setDrawerOpen(false);
    const index = sources.findIndex((s: Timeline) => s?.metadata?.id === source?.metadata?.id);
    if (index >= 0) {
      setTabValue(index);
    } else {
      dispatchSources({ type: 'add', payload: source });
      setTabValue(sources.length);
    }
  };

  const saveRemix = useCallback(() => {
    console.log('remix', remix);
    localStorage.setItem('remix', JSON.stringify(remix));
  }, [remix]);

  const loadRemix = useCallback(() => {
    const remix2 = JSON.parse(localStorage.getItem('remix') || 'null');
    console.log('remix', remix2);
    if (remix2) setRemix(remix2);
  }, []);

  // const exportRemix = useCallback(() => {
  //   // const html = renderToString(<StaticRemix remix={remix} />);
  //   // console.log(html);
  // }, []);

  return (
    <>
      <style>
        {`
          /* $ { Object.values(css).join('\n\n') } */


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
      <Drawer open={drawerOpen} onClose={toggleDrawer(false)}>
        {allSources.map((source, i) => (
          <p key={i} onClick={() => openTab(source)}>
            {source?.metadata?.title}
          </p>
        ))}
      </Drawer>
      <Drawer open={exportDrawerOpen} onClose={toggleExportDrawer(false)} anchor="right">
        {exportDrawerOpen ? <ExportRemix remix={remix} /> : null}
      </Drawer>
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
            <Toolbar disableGutters variant="dense">
              <Button
                variant="outlined"
                startIcon={<PostAddIcon />}
                onClick={toggleDrawer(true)}
                style={{ textTransform: 'none', textWrap: 'nowrap' }}
              >
                Open transcript
              </Button>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                &nbsp;
              </Typography>
              <FormGroup style={{ float: 'right' }}>
                <FormControlLabel
                  control={<Switch checked={autoscroll} onChange={handleAutoscrollChange} size="small" />}
                  label={`Live context view ${autoscroll ? 'ON' : 'OFF'}`}
                />
              </FormGroup>
              <Button
                variant="outlined"
                startIcon={<InputIcon />}
                onClick={loadRemix}
                style={{ textTransform: 'none', textWrap: 'nowrap' }}
              >
                Load remix
              </Button>
              &nbsp;
              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={saveRemix}
                style={{ textTransform: 'none', textWrap: 'nowrap' }}
              >
                Save remix
              </Button>
              &nbsp;
              <Button
                variant="outlined"
                startIcon={<LaunchIcon />}
                onClick={toggleExportDrawer(true)}
                style={{ textTransform: 'none', textWrap: 'nowrap' }}
              >
                Export remix
              </Button>
            </Toolbar>
            <Tabs
              TabIndicatorProps={{ style: { display: 'none' } }}
              value={tabValue}
              onChange={handleTabChange}
              aria-label="tabbed content"
              sx={{ minHeight: '0px' }}
              variant="scrollable"
              scrollButtons="auto"
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
                  label={
                    <Toolbar disableGutters variant="dense">
                      {source?.metadata?.story?.title}
                      <IconButton onClick={(e) => onTabClose(e, source)}>
                        <CloseIcon />
                      </IconButton>
                    </Toolbar>
                  }
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
                ToolbarWrapper={ToolbarWrapper}
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
                // ToolbarWrapper={ToolbarWrapper}
                tools={tools}
                Empty={EmptyRemix}
              />
            </Box>
          </Box>
        </RemixContext>
      </Box>
      <div
        dangerouslySetInnerHTML={{
          __html: TEMPLATES,
        }}
      />
    </>
  );
}

// Tools
const FadeInTool = (props: { id?: string; name?: string; template?: string; duration?: number }): JSX.Element => {
  const { dispatch } = useContext(Context);
  const id = props.id ?? `FIN-${Date.now()}`;
  const { template } = props;
  const name = props.name ?? 'Fade';

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
    <div
      style={{
        backgroundColor: '#c1d8fb',
        borderRadius: '8px',
        border: '1px solid #D9DCDE',
        padding: '12px',
        marginBottom: '12px',
      }}
      className="widget"
    >
      <Toolbar disableGutters variant="dense">
        <FlipIcon />
        &nbsp;&nbsp;
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {name}
        </Typography>
        <Select
          value={duration as any}
          label="seconds"
          onChange={handleDurationChange}
          onBlur={handleSave}
          size="small"
        >
          <MenuItem value={5}>5</MenuItem>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={15}>15</MenuItem>
        </Select>
        &nbsp;&nbsp;&nbsp;
        <Divider orientation="vertical" flexItem />
        &nbsp;&nbsp;
        <Tooltip title="Delete">
          <IconButton onClick={handleRemove} size="small">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
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
    <div
      style={{
        backgroundColor: '#fbffe6',
        borderRadius: '8px',
        border: '1px solid #D9DCDE',
        padding: '12px',
        marginBottom: '12px',
      }}
      className="widget"
    >
      <Toolbar disableGutters variant="dense">
        <TitleIcon />
        &nbsp;&nbsp;
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {name}
        </Typography>
        <ToggleButtonGroup value={template} exclusive onChange={handleTemplateChange} onBlur={handleSave}>
          <ToggleButton value="#title-lower3rds" size="small">
            <ShortTextIcon />
          </ToggleButton>
          <ToggleButton value="#title-full" size="small">
            <SubjectIcon />
          </ToggleButton>
        </ToggleButtonGroup>
        <Select
          value={duration as any}
          label="seconds"
          onChange={handleDurationChange}
          onBlur={handleSave}
          size="small"
        >
          <MenuItem value={5}>5</MenuItem>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={15}>15</MenuItem>
        </Select>
        &nbsp;&nbsp;&nbsp;
        <Divider orientation="vertical" flexItem />
        &nbsp;&nbsp;
        <Tooltip title="Delete">
          <IconButton onClick={handleRemove} size="small">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
      <TextField
        label="Title"
        value={title}
        style={{ width: '100%' }}
        onChange={handleTitleChange}
        onBlur={handleSave}
        size="small"
      />
      &nbsp;
      <TextField
        label="Subtitle"
        value={subtitle}
        style={{ width: '100%' }}
        onChange={handleSubtitleChange}
        onBlur={handleSave}
        size="small"
      />
    </div>
  );
};

// Wrappers

const EMPTY_REMIX_SX = {
  height: '302px',
  borderRadius: '8px',
  backgroundColor: '#f6e52c',
  textAlign: 'center',
};

const EmptyRemix = (): JSX.Element => (
  <Box id="EmptyRemix" sx={EMPTY_REMIX_SX}>
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
const SourceWrapper = ({ children }: PropsWithChildren): JSX.Element => {
  const sx = useMemo(
    () => ({
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
    }),
    [],
  );

  return (
    <Box id="sourceWrapper" sx={sx}>
      {children}
    </Box>
  );
};

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

interface SelectionWrapperProps extends PropsWithChildren {
  metadata?: { [key: string]: any };
  first?: boolean;
  droppableId?: string;
  source: Timeline;
}

const SelectionWrapper = ({ first, droppableId, source, children }: SelectionWrapperProps): JSX.Element => {
  const { dispatch, remixPlayerRef } = useContext(Context);

  const handleAdd = useCallback(() => {
    if (!droppableId || !(remixPlayerRef as any).current) return;

    const [, , start, end] = droppableId.split('-');

    const sectionId = (remixPlayerRef as any).current?.getCurrentSection()?.metadata?.id;
    if (sectionId) {
      dispatch({ type: 'add-at', payload: [sectionId, source, [parseFloat(start), parseFloat(end)]] });
    } else {
      const result = { destination: { index: 0 } };
      dispatch({ type: 'add', payload: [result, source, [parseFloat(start), parseFloat(end)]] });
    }
  }, [dispatch, droppableId, source, remixPlayerRef]);

  return (
    <span className="SelectionWrapper" style={{ backgroundColor: '#d3ebe8', position: 'relative' }}>
      {first ? (
        <div style={{ backgroundColor: 'white', position: 'absolute', left: 0, top: -35 }}>
          <Button
            variant="outlined"
            startIcon={<PlaylistAddIcon />}
            onClick={handleAdd}
            style={{ textTransform: 'none', textWrap: 'nowrap' }}
          >
            Add to remix
          </Button>
        </div>
      ) : null}
      {children}
    </span>
  );
};

const ToolbarWrapper = ({ children }: PropsWithChildren): JSX.Element => (
  <Toolbar disableGutters variant="dense">
    <Stack direction="row" spacing={1}>
      {children}
    </Stack>
  </Toolbar>
);

// Paragraph wrapper
interface BlockWrapperProps extends PropsWithChildren {
  metadata?: { [key: string]: any };
  start?: number;
  offset?: number;
}

const USER_SELECT_NONE = { userSelect: 'none' };

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
      <div style={USER_SELECT_NONE}>
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
        <Toolbar disableGutters variant="dense">
          <AutoStoriesIcon />
          &nbsp;&nbsp;
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <Divider orientation="vertical" flexItem />
          &nbsp;&nbsp;
          <Tooltip title="Delete">
            <IconButton onClick={handleRemove}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
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

const ExportRemix = ({ remix }: { remix: Timeline }) => {
  const html = useMemo(
    () =>
      renderToString(<StaticRemix remix={remix} templates={TEMPLATES} />)
        .replace('<timedtext-player ', '<timedtext-player slot="media" ')
        .replaceAll(' suppresshydrationwarning=""', ''),
    [remix],
  );
  return (
    <div style={{ padding: 10 }}>
      <TextField label="HTML" multiline value={html} />
    </div>
  );
};

export default App;
