function scoreTracks(tracks) {
  return tracks.map(track => {
    return {
      ...track,
      score: track.votes * 10 - Math.abs(track.bpm - 120)
    };
  });
}
