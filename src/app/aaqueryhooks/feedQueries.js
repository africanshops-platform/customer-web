import { useInfiniteQuery, useQuery } from "react-query";
import { getStoreFeedApi, getStoreStatusesApi } from "../configs/data/client/RepositoryClient";

export const FEED_PAGE_SIZE = 10;

/** A shop's published posts, newest first, loaded a page at a time ("Show more posts"). */
export function useStoreFeed(shopId) {
  return useInfiniteQuery(
    ["__store_feed", shopId],
    ({ pageParam = 0 }) =>
      getStoreFeedApi(shopId, { limit: FEED_PAGE_SIZE, offset: pageParam * FEED_PAGE_SIZE }),
    {
      enabled: Boolean(shopId),
      getNextPageParam: (lastPage, allPages) =>
        lastPage?.data?.pagination?.hasMore ? allPages.length : undefined,
      staleTime: 30000,
    },
  );
}

/** A shop's live statuses. Short stale time: they come and go within a day. */
export function useStoreStatuses(shopId) {
  return useQuery(["__store_statuses", shopId], () => getStoreStatusesApi(shopId), {
    enabled: Boolean(shopId),
    staleTime: 30000,
  });
}
