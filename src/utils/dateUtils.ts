export const formatDate = (dateString: string): string => {
  const dateObj = new Date(dateString);
  return dateObj.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};
