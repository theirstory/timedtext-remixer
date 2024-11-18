import { Box, Drawer, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { Timeline } from '../../lib/interfaces';
import SourceIcon from '@mui/icons-material/Source';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { useCallback, useEffect, useState } from 'react';
import { axiosInstance } from '../services/axiosInstance';

export const SourceDrawer = ({
  open,
  onClose,
  defaultSources,
  onClickSource,
}: {
  open: boolean;
  onClose: () => void;
  defaultSources: Timeline[];
  onClickSource: (source: Timeline) => void;
}) => {
  // const [filteredSources, setFilteredSources] = useState<Timeline[]>(sources);

  const [sourcesList, setSourcesList] = useState<Timeline[]>([]);
  const [filteredSources, setFilteredSources] = useState(sourcesList);
  const [searchTerm, setSearchTerm] = useState('');
  const hasExternalSources = axiosInstance.defaults.baseURL && axiosInstance.defaults.headers['Authorization'];

  const formatDate = (dateString: string): string => {
    const dateObj = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    return dateObj.toLocaleDateString('en-GB', options);
  };

  const fetchStories = useCallback(async () => {
    // Check if external sources are available
    // otherwise use defaultSources
    if (hasExternalSources) {
      try {
        const response = await axiosInstance.get('/remixer/search', {
          params: { search: searchTerm },
        });
        setSourcesList(response.data.items);
      } catch (error) {
        console.error('Error fetching external sources for remixer/search:', error);
      }
    } else {
      setSourcesList(defaultSources);
    }
  }, [defaultSources, hasExternalSources, searchTerm]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (!sourcesList) return;

      // Check if external sources are available and fetch them with the search term
      if (hasExternalSources) {
        fetchStories();
        return;
      }

      // Filter the default sources with the search term
      setFilteredSources(
        sourcesList.filter((source) => {
          if (!source.metadata) return false;
          const { title, story } = source.metadata;
          return (
            title?.toLowerCase().includes(searchTerm) ||
            story.author.full_name.toLowerCase().includes(searchTerm) ||
            story.project?.name.toLowerCase().includes(searchTerm) ||
            formatDate(story.record_date).toLowerCase().includes(searchTerm)
          );
        }),
      );
    }
  };

  console.log('sourcesList:', sourcesList);

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
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
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
        <Box id="sources-container" display="flex" flexDirection="column" rowGap="12px"></Box>
      </Box>
    </Drawer>
  );
};
