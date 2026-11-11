import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { listNotices } from "@/features/notices/api/noticeApi.js";
import { useAuth } from "@/hooks/useAuth.jsx";

const keyFor = (userId) => `rn_notice_seen_${userId}`;

// True when the newest notice is newer than the last one this user opened
export function useNoticeBadge() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [seenAt, setSeenAt] = useState(0);

  const query = useQuery({
    queryKey: ["notices", "latest"],
    queryFn: () => listNotices({ page: 1, limit: 1 }),
    enabled: Boolean(user),
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!user?._id) return;
    setSeenAt(Number(localStorage.getItem(keyFor(user._id))) || 0);
  }, [user?._id]);

  const latest = query.data?.notices?.[0];
  const latestAt = latest ? new Date(latest.createdAt).getTime() : 0;

  const markSeen = useCallback(() => {
    if (!user?._id || !latestAt) return;
    localStorage.setItem(keyFor(user._id), String(latestAt));
    setSeenAt(latestAt);
  }, [user?._id, latestAt]);

  // Opening the notices page counts as seeing the latest notice
  useEffect(() => {
    if (pathname.includes("/notices")) markSeen();
  }, [pathname, markSeen]);

  return { hasUnseen: latestAt > seenAt, markSeen };
}
