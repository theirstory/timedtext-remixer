/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useEffect, useState, useCallback, useReducer } from 'react';
import {
  Box,
  Button,
  Tab,
  Tabs,
  Chip,
  Typography,
  IconButton,
  FormGroup,
  FormControlLabel,
  Toolbar,
  Switch,
  Drawer,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LaunchIcon from '@mui/icons-material/Launch';
import InputIcon from '@mui/icons-material/Input';
import SaveIcon from '@mui/icons-material/Save';
import PostAddIcon from '@mui/icons-material/PostAdd';

import scrollIntoView from 'smooth-scroll-into-view-if-needed';

import RemixContext from '../lib/RemixContext.js';
import RemixSources from '../lib/RemixSources.js';
import RemixDestination from '../lib/RemixDestination.js';
import { ts2timeline } from '../lib/utils.js';
import type { Timeline } from '../lib/interfaces';

import T4 from './data/66043ea15b6357760d02b9a4.json';
import T5 from './data/61929022c65d8e0005450522.json';
import T6 from './data/64380a5ea0e98efaffc0d029.json';
import T7 from './data/6165da2ee1d20f0005a0fc0a.json';
import T8 from './data/63e4ea003770cdb1733b6199.json';
import { EMPTY_REMIX } from '../lib/utils.js';

import './App.css';

import {
  TEMPLATES,
  FadeInTool,
  TitleTool,
  EmptyRemix,
  LeftPlayerWrapper,
  RightPlayerWrapper,
  SourceWrapper,
  DestinationWrapper,
  SelectionWrapper,
  ToolbarWrapper,
  BlockWrapperLeft,
  BlockWrapperRight,
  SectionContentWrapper,
  ExportRemix,
} from './wrappers.tsx';

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
    () => [ts2timeline(T4), ts2timeline(T5), ts2timeline(T6), ts2timeline(T7), ts2timeline(T8)] as Timeline[],
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
    [ts2timeline(T4), ts2timeline(T5), ts2timeline(T6), ts2timeline(T7), ts2timeline(T8)],
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
            content-visibility: auto;
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
          <Box id="columns-container" display={'grid'} gap={'8px'} gridTemplateColumns={'1fr 1fr'}>
            <Box
              id="left-column-container"
              borderRadius="0px 8px 8px 8px"
              sx={{ backgroundColor: '#FFFFFF' }}
              padding="16px"
            >
              <Box id="tabs-container">
                {/* <Toolbar disableGutters variant="dense">
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
                   </Toolbar> */}
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
                        borderLeft: i === 0 ? '1px solid var(--Dark-20, #D9DCDE)' : 'none',
                        backgroundColor: tabValue !== i ? '#F7F9FC' : '#FFF',
                        textTransform: 'none',
                        // fontSize: '14px',
                        // fontWeight: 700,
                        minHeight: '0px',
                        padding: '6px 8px 6px 8px',
                        // lineHeight: '20px',
                        '&.Mui-selected': {
                          color: '#239B8B',
                          borderBottom: 'none',
                        },
                        borderBottom: tabValue !== i ? '1px solid var(--Dark-20, #D9DCDE)' : 'none',
                      }}
                      key={i}
                      label={
                        <Toolbar disableGutters variant="dense" sx={{ minHeight: '0px' }}>
                          <Typography
                            sx={{ width: '90px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                            fontSize="14px"
                            fontWeight={700}
                            lineHeight="20px"
                          >
                            {source?.metadata?.story?.title}
                          </Typography>
                          <IconButton sx={{ padding: 0 }} onClick={(e) => onTabClose(e, source)}>
                            <CloseIcon style={{ width: '20px', height: '20px' }} />
                          </IconButton>
                        </Toolbar>
                      }
                    />
                  ))}
                </Tabs>
              </Box>
              <Box>
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
            </Box>

            <Box
              id="right-column-container"
              borderRadius="8px"
              sx={{ backgroundColor: '#FFFFFF', flex: 1 }}
              display="flex"
              flexDirection="column"
              paddingX="24px"
              paddingTop="24px"
            >
              <Typography fontSize="14px" fontWeight={700} lineHeight="20px" color="#464C53">
                Remix
              </Typography>
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

export default App;
