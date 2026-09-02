import { useState, useCallback } from 'react';
import axios from '../../../api/client';
import { mapActivity } from '../../../lib/apiMappers';

export function useUserActivity() {
  const [userActivityEntries, setUserActivityEntries] = useState<any[]>([]);
  const [userActivityLoading, setUserActivityLoading] = useState(false);
  const [userActivitySearch, setUserActivitySearch] = useState('');
  const [userActivityActionFilter, setUserActivityActionFilter] = useState('all');
  const [userActivityPage, setUserActivityPage] = useState(1);
  const [userActivityItemsPerPage, setUserActivityItemsPerPage] = useState(10);

  const loadUserActivity = useCallback(async () => {
    setUserActivityLoading(true);
    try {
      const response = await axios.get('/api/users/activity?all=true');
      setUserActivityEntries((response.data as any[]).map(mapActivity));
    } catch (error) {
      console.error('Error loading user activity:', error);
    } finally {
      setUserActivityLoading(false);
    }
  }, []);

  // Filtered activity entries
  const filteredUserActivityEntries = userActivityEntries.filter(entry => {
    const matchesSearch = !userActivitySearch ||
      entry.action?.toLowerCase().includes(userActivitySearch.toLowerCase()) ||
      entry.actorUserId?.username?.toLowerCase().includes(userActivitySearch.toLowerCase()) ||
      entry.actorUserId?.email?.toLowerCase().includes(userActivitySearch.toLowerCase()) ||
      entry.targetUserId?.username?.toLowerCase().includes(userActivitySearch.toLowerCase()) ||
      entry.targetUserId?.email?.toLowerCase().includes(userActivitySearch.toLowerCase()) ||
      entry.description?.toLowerCase().includes(userActivitySearch.toLowerCase()) ||
      entry.ipAddress?.toLowerCase().includes(userActivitySearch.toLowerCase());

    const matchesAction = userActivityActionFilter === 'all' || entry.action === userActivityActionFilter;

    return matchesSearch && matchesAction;
  });

  // Available actions for filter
  const availableUserActions = Array.from(new Set(
    userActivityEntries.map(entry => entry.action).filter(Boolean)
  )).sort();

  // Pagination
  const userActivityTotalPages = Math.ceil(filteredUserActivityEntries.length / userActivityItemsPerPage);
  const safeUserActivityPage = Math.min(userActivityPage, Math.max(1, userActivityTotalPages));
  const userActivityStartIndex = (safeUserActivityPage - 1) * userActivityItemsPerPage;
  const paginatedUserActivityEntries = filteredUserActivityEntries.slice(
    userActivityStartIndex,
    userActivityStartIndex + userActivityItemsPerPage
  );

  const handleUserActivityItemsPerPageChange = (newItemsPerPage: number) => {
    setUserActivityItemsPerPage(newItemsPerPage);
    setUserActivityPage(1);
  };

  return {
    userActivityEntries,
    userActivityLoading,
    userActivitySearch,
    setUserActivitySearch,
    userActivityActionFilter,
    setUserActivityActionFilter,
    userActivityPage,
    setUserActivityPage,
    userActivityItemsPerPage,
    filteredUserActivityEntries,
    availableUserActions,
    userActivityTotalPages,
    safeUserActivityPage,
    userActivityStartIndex,
    paginatedUserActivityEntries,
    loadUserActivity,
    handleUserActivityItemsPerPageChange,
  };
}
