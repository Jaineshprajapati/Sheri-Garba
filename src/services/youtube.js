export async function getYouTubePlaylist() {
    const API_KEY =
        import.meta.env.VITE_YOUTUBE_API_KEY;

    const PLAYLIST_ID =
        import.meta.env.VITE_YOUTUBE_PLAYLIST_ID;

    const url =
        `https://www.googleapis.com/youtube/v3/playlistItems` +
        `?part=snippet` +
        `&maxResults=50` +
        `&playlistId=${PLAYLIST_ID}` +
        `&key=${API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            "Failed to fetch YouTube playlist"
        );
    }

    const data = await response.json();

    return data.items.map((item) => ({
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        artist:
            item.snippet.videoOwnerChannelTitle ||
            "YouTube",
        thumbnail:
            item.snippet.thumbnails?.high?.url,
    }));
}