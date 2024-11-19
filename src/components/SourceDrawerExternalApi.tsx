import { Box, CircularProgress, Drawer, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { useRef } from 'react';
import useFetchStories from '../hooks/useFetchStories';
import { Timeline } from '../../lib/interfaces';
import { SourceDrawerItem } from './SourceDrawerItem';

interface SourceDrawerExternalApiProps {
  open: boolean;
  onClose: () => void;
  onClickSource: (source: Timeline) => void;
}

export const SourceDrawerExternalApi = ({ open, onClose, onClickSource }: SourceDrawerExternalApiProps) => {
  const searchTermRef = useRef<string>('');
  const { isFetching, fetchStories, storyList } = useFetchStories();

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') fetchStories(searchTermRef.current);
  };

  return (
    <Drawer open={open} onClose={onClose} sx={{ '& .MuiDrawer-paper': { borderRadius: '0px 4px 4px 0px' } }}>
      <Box padding="16px" width="400px" display="flex" flexDirection="column" gap="16px">
        <Box display="flex" alignItems="center">
          <Typography color="#464C53" fontSize="14px" fontWeight={600}>
            Browse content
          </Typography>
          <IconButton onClick={onClose} sx={{ marginLeft: 'auto' }}>
            <CloseIcon sx={{ color: '#606971' }} />
          </IconButton>
        </Box>
        <TextField
          placeholder="Search"
          size="small"
          onChange={(e) => (searchTermRef.current = e.target.value)}
          onKeyDown={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': { borderColor: '#239B8B' },
            },
          }}
        />
        {isFetching ? (
          <CircularProgress sx={{ color: '#239b8b' }} />
        ) : (
          <Box display="flex" flexDirection="column" gap="12px">
            {storyList.map((story) => (
              <SourceDrawerItem key={story.id} source={story} onClick={onClickSource} />
            ))}
          </Box>
        )}
      </Box>
    </Drawer>
  );
};
