// Finds all videos in song_mappings.json where a song name (ua or en) matches the given string.
// Run: node scripts/find_nazva.mjs "Радість"

import { readFileSync } from 'fs'

const query = process.argv[2]
if (!query) {
    console.error('Usage: node scripts/find_nazva.mjs "<song name>"')
    process.exit(1)
}
const queryLower = query.trim().toLowerCase()

const mappings = JSON.parse(readFileSync('D:\\Projects\\GN-Backend\\song_mappings.json', 'utf-8'))

const hits = []
for (const video of mappings) {
    const matched = video.songs.filter(s =>
        s.ua.trim().toLowerCase() === queryLower ||
        s.en.trim().toLowerCase() === queryLower
    )
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
    console.log(`No videos found for "${query}".`)
} else {
    console.log(`Found "${query}" in ${hits.length} video(s):\n`)
    for (const h of hits) {
        console.log(`${h.title}`)
        console.log(`  ${h.published_at}`)
        console.log(`  ${h.url}`)
        for (const s of h.songs) console.log(`  → "${s.ua}" (${s.en})`)
        console.log()
    }
}
