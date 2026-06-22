// Finds all videos in song_mappings.json that have "НАЗВА" as a placeholder Ukrainian song name.
// Run: node scripts/find_nazva.mjs

import { readFileSync } from 'fs'

const mappings = JSON.parse(readFileSync('D:\\Projects\\GN-Backend\\song_mappings.json', 'utf-8'))

const hits = []
for (const video of mappings) {
    const matched = video.songs.filter(s => s.ua.trim().toUpperCase() === 'НАЗВА')
    if (matched.length > 0) {
        hits.push({
            title: video.video_title,
            published_at: video.published_at,
            url: `https://youtu.be/${video.video_id}`,
            songs: matched
        })
    }
}

if (hits.length === 0) {
    console.log('No videos with НАЗВА found.')
} else {
    console.log(`Found НАЗВА in ${hits.length} video(s):\n`)
    for (const h of hits) {
        console.log(`${h.title}`)
        console.log(`  ${h.published_at}`)
        console.log(`  ${h.url}`)
        for (const s of h.songs) console.log(`  → "${s.ua}" (${s.en})`)
        console.log()
    }
}
