// Reads song_mappings.json and writes song_review.json grouped by video
// with songs as { en, ua } for manual review and unification of Ukrainian titles.
// Run: node scripts/build_review.mjs

import { readFileSync, writeFileSync } from 'fs'

const mappings = JSON.parse(readFileSync('D:\\Projects\\GN-Backend\\song_mappings.json', 'utf-8'))

const review = mappings.map(video => ({
    video_id: video.video_id,
    video_title: video.video_title,
    published_at: video.published_at,
    url: `https://youtu.be/${video.video_id}`,
    songs: video.songs.map(s => ({ en: s.en, ua: s.ua }))
}))

writeFileSync('D:\\Projects\\GN-Backend\\song_review.json', JSON.stringify(review, null, 2), 'utf-8')
console.log(`Done. ${review.length} videos written to song_review.json`)
