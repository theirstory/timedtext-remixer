import { Box, Drawer, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { useCallback, useRef, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { SourceDrawerItem } from './SourceDrawerItem';
import { Timeline } from '../../lib/interfaces';
import { formatDate } from '../utils/dateUtils';

interface SourceDrawerProps {
  open: boolean;
  onClose: () => void;
  defaultSources: Timeline[];
  onClickSource: (source: Timeline) => void;
}

export const SourceDrawer = ({ open, onClose, defaultSources, onClickSource }: SourceDrawerProps) => {
  const searchTermRef = useRef<string>('');
  const [filteredSources, setFilteredSources] = useState<Timeline[]>(defaultSources);

  const filterSources = useCallback(() => {
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
    setFilteredSources(filtered);
  }, [defaultSources]);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') filterSources();
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
        <Box display="flex" flexDirection="column" gap="12px">
          {filteredSources.map((source) => (
            <SourceDrawerItem key={source.id} source={source} onClick={onClickSource} />
          ))}
        </Box>
      </Box>
    </Drawer>
  );
};
