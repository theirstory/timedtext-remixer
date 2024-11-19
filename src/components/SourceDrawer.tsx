import { Box, CircularProgress, Drawer, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import SourceIcon from '@mui/icons-material/Source';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { useCallback, useRef, useState } from 'react';
import { axiosInstance } from '../services/axiosInstance';
import { Timeline } from '../../lib/interfaces';
import useFetchStories from '../hooks/useFetchStories';

const formatDate = (dateString: string): string => {
  const dateObj = new Date(dateString);
  return dateObj.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const SourceDrawerItem = ({ source, onClick }: { source: Timeline; onClick: (source: Timeline) => void }) => {
  const projectName = source.metadata?.story.project?.name || source.project || 'Diversity';
  const title = source.metadata?.title || source.title || '';
  const creator = source.metadata?.story.author.full_name || source.creator || '';
  const recordDate = source.metadata?.story.record_date || source.record_date || '';

  return (
    <Box
      id="item-container"
      borderRadius="8px"
      border="1px solid #D9DCDE"
      padding="12px"
      display="flex"
      flexDirection="column"
      rowGap="12px"
      sx={{
        cursor: 'pointer',
        '&:hover': { backgroundColor: '#F1F2F3' },
      }}
      onClick={() => onClick(source)}
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
          {projectName}
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
          {title}
        </Typography>
        <Typography
          color="#606971"
          fontSize="14px"
          fontWeight={700}
          textOverflow="ellipsis"
          overflow="hidden"
          whiteSpace="nowrap"
        >
          {creator} • {formatDate(recordDate)}
        </Typography>
      </Box>
    </Box>
  );
};

interface SourceDrawerProps {
  open: boolean;
  onClose: () => void;
  defaultSources: Timeline[];
  onClickSource: (source: Timeline) => void;
}

export const SourceDrawer = ({ open, onClose, defaultSources, onClickSource }: SourceDrawerProps) => {
  /*
  // Refs
  */
  const searchTermRef = useRef<string>('');

  /*
  // Constants
  */
  const baseURL = axiosInstance.defaults.baseURL;
  const authorization = axiosInstance.defaults.headers['Authorization'];
  const hasExternalSources = !!baseURL && !!authorization;

  /*
  // Custom hooks
  */
  const { isFetching, fetchStories, storyList } = useFetchStories(searchTermRef.current);
  console.log('storyList:', storyList);
  /*
  // State
  */
  const [filteredDefaultSources, setFilteredDefaultSources] = useState<Timeline[]>(defaultSources);

  /*
  // Helpers
  */
  const filterSources = useCallback(() => {
    if (!filteredDefaultSources.length) return;
    const filtered = defaultSources.filter((source) => {
      const metadata = source.metadata;
      const { title, story } = metadata;
      const projectName = story?.project?.name || source.project || '';
      return (
        title?.toLowerCase().includes(searchTermRef.current.toLowerCase()) ||
        story?.author?.full_name.toLowerCase().includes(searchTermRef.current.toLowerCase()) ||
        projectName.toLowerCase().includes(searchTermRef.current.toLowerCase()) ||
        formatDate(story?.record_date || '')
          .toLowerCase()
          .includes(searchTermRef.current.toLowerCase())
      );
    });
    setFilteredDefaultSources(filtered);
  }, [defaultSources, filteredDefaultSources.length]);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (hasExternalSources) fetchStories();
      else filterSources();
    }
  };

  /*
  // Effects
  */
  // useEffect(() => {
  //   if (!hasExternalSources) setSourcesList(defaultSources);
  // }, [defaultSources, hasExternalSources]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': { borderRadius: '0px 4px 4px 0px' },
      }}
    >
      <Box paddingX="16px" paddingY="32px" width="400px" display="flex" flexDirection="column" rowGap="16px">
        <Box display="flex" alignItems="center">
          <Typography color="#464C53" fontSize="14px" fontWeight={600}>
            Browse content
          </Typography>
          <IconButton onClick={onClose} sx={{ marginLeft: 'auto' }}>
            <CloseIcon sx={{ width: '20px', height: '20px', color: '#606971' }} />
          </IconButton>
        </Box>
        <TextField
          placeholder="Search"
          size="small"
          onChange={(e) => (searchTermRef.current = e.target.value)}
          onKeyDown={handleSearch}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': { borderColor: '#239B8B' },
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
        {isFetching && <CircularProgress sx={{ color: '#239b8b' }} />}
        {!isFetching && (
          <Box display="flex" flexDirection="column" rowGap="12px">
            {(hasExternalSources ? storyList : filteredDefaultSources).map((source) => (
              <SourceDrawerItem key={source.id} source={source} onClick={onClickSource} />
            ))}
          </Box>
        )}
      </Box>
    </Drawer>
  );
};
