# 🎛️ Playlist-Remix-Engine

> A lightweight JavaScript pipeline that merges, scores, deduplicates, and schedules tracks from multiple playlists into a single optimised broadcast queue.

---

## Overview

**Playlist-Remix-Engine** takes an array of playlists — each containing track objects with metadata — and runs them through a deterministic five-stage pipeline to produce a clean, ranked, artist-balanced schedule. It's designed to be framework-agnostic, side-effect-free, and easy to drop into any JavaScript or Node.js project.

---

## Pipeline

```
playlists[][]
     │
     ▼
flattenPlaylists()     — merge all playlists into a single flat array,
     │                   tagging each track with its [playlistIndex, trackIndex] source
     ▼
scoreTracks()          — compute score = (votes × 10) − |bpm − 120|
     │                   rewards popular tracks closest to 120 BPM
     ▼
dedupeTracks()         — remove duplicate trackIds, keeping first occurrence
     │
     ▼
enforceArtistQuota()   — cap each artist at maxPerArtist tracks
     │
     ▼
buildSchedule()        — assign sequential slot numbers → final schedule
```

---

## API

### `remixPlaylist(playlists, maxPerArtist)`

The main entry point. Runs the full pipeline.

| Parameter | Type | Description |
|---|---|---|
| `playlists` | `Array<Array<Track>>` | Nested array of playlist track arrays |
| `maxPerArtist` | `number` | Maximum tracks allowed per artist in the final schedule |

**Returns** `Array<{ slot: number, trackId: string }>`

---

### Track Object Shape

```js
{
  trackId: string,   // unique identifier
  artist:  string,   // artist name (used for quota enforcement)
  title:   string,   // track title
  votes:   number,   // community votes
  bpm:     number    // beats per minute
}
```

---

### Scoring Formula

```
score = (votes × 10) − |bpm − 120|
```

Tracks are **not re-sorted** after scoring — order is preserved from the flattened input. The score field is attached to each track object and can be used downstream for custom sorting if needed.

---

## Usage

```js
import { remixPlaylist } from './playlist-remix-engine.js';

const playlists = [
  [
    { trackId: 'trk101', artist: 'Velvet Comet',  title: 'Crimson Afterglow',   votes: 5, bpm: 122 },
    { trackId: 'trk102', artist: 'Neon Harbor',   title: 'Static Horizon',      votes: 2, bpm: 108 },
    { trackId: 'trk103', artist: 'Lunar Arcade',  title: 'Midnight Frequency',  votes: 4, bpm: 128 },
  ],
  [
    { trackId: 'trk201', artist: 'Solar Echo',    title: 'Glass Skyline',       votes: 3, bpm: 115 },
    { trackId: 'trk202', artist: 'Velvet Comet',  title: 'Satellite Hearts',    votes: 6, bpm: 124 },
  ]
];

const schedule = remixPlaylist(playlists, 1);

console.log(schedule);
// [
//   { slot: 1, trackId: 'trk101' },
//   { slot: 2, trackId: 'trk102' },
//   { slot: 3, trackId: 'trk103' },
//   { slot: 4, trackId: 'trk201' },
//   // trk202 excluded — Velvet Comet already at quota (maxPerArtist: 1)
// ]
```

---

## Individual Functions

Each stage is exported and can be used independently.

| Function | Signature | Description |
|---|---|---|
| `flattenPlaylists` | `(playlists) → Track[]` | Flattens nested playlists, adds `source` field |
| `scoreTracks` | `(tracks) → ScoredTrack[]` | Attaches a `score` to each track |
| `dedupeTracks` | `(tracks) → Track[]` | Removes duplicate `trackId` entries |
| `enforceArtistQuota` | `(tracks, max) → Track[]` | Filters to at most `max` tracks per artist |
| `buildSchedule` | `(tracks) → Schedule[]` | Maps tracks to `{ slot, trackId }` objects |

---

## Edge Cases

- `flattenPlaylists` returns `[]` if the argument is not an array.
- `dedupeTracks` preserves the **first** occurrence of a duplicate `trackId` and discards subsequent ones.
- `enforceArtistQuota` processes tracks **in order** — earlier tracks take priority when the quota is reached.
- An empty `playlists` input produces an empty schedule with no errors thrown.

---

## Project Structure

```
Playlist-Remix-Engine/
├── playlist-remix-engine.js   # core pipeline (all functions)
└── README.md
```

---

## Contributing

Pull requests are welcome. For significant changes, please open an issue first to discuss what you'd like to change.
