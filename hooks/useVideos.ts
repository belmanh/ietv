import { fetchVideosFromStorage, type VideoItem } from '@/lib/storage';
import { useEffect, useState } from 'react';

// Hook pour charger les vidéos avec état loading / error
export function useVideos() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchVideosFromStorage();
        if (active) setVideos(data);
      } catch (e: any) {
        if (active) setError(e instanceof Error ? e : new Error('Impossible de charger les vidéos'));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  return { videos, loading, error };
}
