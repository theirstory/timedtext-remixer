import { Box, Drawer, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { Timeline } from '../../lib/interfaces';
import SourceIcon from '@mui/icons-material/Source';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useState } from 'react';

export const SourceDrawer = ({
  open,
  onClose,
  sources,
  onClickSource,
}: {
  open: boolean;
  onClose: () => void;
  sources: Timeline[];
  onClickSource: (source: Timeline) => void;
}) => {
  // const [filteredSources, setFilteredSources] = useState<Timeline[]>(sources);
  const [stories, setStories] = useState<any>([]);

  const [searchText, setSearchText] = useState('');

  const formatDate = (dateString: string): string => {
    const dateObj = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    return dateObj.toLocaleDateString('en-GB', options);
  };

  useEffect(() => {
    window.addEventListener('message', (event) => {
      if (event.origin !== 'http://localhost:8001') return;
      const results = event.data;
      console.log('results en el ifram', results);
      setStories(results.items);
    });
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      window.parent.postMessage(searchText, 'http://localhost:8001');
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          borderRadius: '0px 4px 4px 0px',
        },
      }}
    >
      <Box
        id="drawer-container"
        paddingX="16px"
        paddingY="32px"
        width="400px"
        display="flex"
        flexDirection="column"
        rowGap="16px"
      >
        <Box display="flex" alignItems="center">
          <Typography color="#464C53" fontSize="14px" fontWeight={600} lineHeight="20px">
            Browse content
          </Typography>
          <IconButton onClick={onClose} sx={{ marginLeft: 'auto' }}>
            <CloseIcon sx={{ width: '20px', height: '20px', color: '#606971' }} />
          </IconButton>
        </Box>
        <TextField
          placeholder="Search"
          size="small"
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={handleKeyDown}
          // onChange={(e) => {
          //   const searchTerm = e.target.value.toLowerCase();
          //   setFilteredSources(
          //     sources.filter((source) => {
          //       if (!source.metadata) return false;
          //       const { title, story } = source.metadata;
          //       return (
          //         title?.toLowerCase().includes(searchTerm) ||
          //         story.author.full_name.toLowerCase().includes(searchTerm) ||
          //         story.project?.name.toLowerCase().includes(searchTerm) ||
          //         formatDate(story.record_date).toLowerCase().includes(searchTerm)
          //       );
          //     }),
          //   );
          // }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': {
                borderColor: '#239B8B',
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Box id="sources-container" display="flex" flexDirection="column" rowGap="12px">
          {stories?.map((story) => {
            const { _id, title } = story;
            return (
              <Box
                key={_id}
                id="item-container"
                borderRadius="8px"
                border="1px solid #D9DCDE"
                padding="12px"
                display="flex"
                flexDirection="column"
                rowGap="12px"
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#F1F2F3',
                  },
                }}
                // onClick={() => onClickSource(source)}
              >
                <Box display="flex" alignItems="center" columnGap="4px">
                  <SourceIcon sx={{ width: '16px', height: '16px', color: '#75808A' }} />
                  <Typography
                    color="#75808A"
                    fontSize="14px"
                    fontWeight={700}
                    textOverflow="ellipsis"
                    overflow="hidden"
                    whiteSpace="nowrap"
                  >
                    {/* project */}
                    {story?.project?.name ?? 'Diversity'}
                  </Typography>
                </Box>
                <Box display="flex" flexDirection="column">
                  <Typography
                    color="#606971"
                    fontSize="14px"
                    fontWeight={700}
                    textOverflow="ellipsis"
                    overflow="hidden"
                    whiteSpace="nowrap"
                  >
                    {title ?? ''}
                  </Typography>
                  <Typography
                    color="#606971"
                    fontSize="14px"
                    fontWeight={700}
                    textOverflow="ellipsis"
                    overflow="hidden"
                    whiteSpace="nowrap"
                  >
                    {story.creator.full_name ?? ''} • {formatDate(story.record_date ?? '')}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Drawer>
  );
};
