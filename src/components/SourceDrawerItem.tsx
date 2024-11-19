import { Box, Typography } from '@mui/material';
import { ExternalSource, Timeline } from '../../lib/interfaces';
import SourceIcon from '@mui/icons-material/Source';
import { formatDate } from '../utils/dateUtils';

export const SourceDrawerItem = ({
  source,
  onClick,
}: {
  source: Timeline | ExternalSource;
  onClick: (source: Timeline | ExternalSource) => void;
}) => {
  const projectName = source.metadata?.story.project?.name || source.project || '';
  const title = source.metadata?.title || source.title || '';
  const creator = source.metadata?.story.author.full_name || source.creator || '';
  const recordDate = source.metadata?.story.record_date || source.created || '';

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
