import { useState, useCallback } from 'react';
import { axiosInstance } from '../services/axiosInstance';

const useFetchStories = () => {
  const [isFetching, setIsFetching] = useState(false);
  const [storyList, setStoryList] = useState([]);
  const [error, setError] = useState<Error | null>(null);

  const fetchStories = useCallback(async (searchTerm?: string) => {
    try {
      setIsFetching(true);
      setError(null);
      const { data } = await axiosInstance.get('/remixer/search', {
        params: { search: searchTerm },
      });
      setStoryList(data);
    } catch (err) {
      console.error('Error fetching external sources for remixer/search:', err);
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error('An unknown error occurred'));
      }
    } finally {
      setIsFetching(false);
    }
  }, []);

  return { isFetching, storyList, error, fetchStories };
};

export default useFetchStories;
