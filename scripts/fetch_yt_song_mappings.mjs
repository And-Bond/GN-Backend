// FILL IN YOUR VALUES HERE
const API_KEY             = ''
const UPLOADS_PLAYLIST_ID = 'UUNVHUqVaS1TQTwWAvC34kbw'
const TITLE_PREFIX        = 'БЛАГА ВІСТЬ СМІЛА //'
const DATE_FROM           = new Date('2024-08-11T00:00:00Z')  // only videos ON OR AFTER this date
const OUT_DIR             = 'D:\\Projects\\GN-Backend'

// Fetches all live service videos from YouTube, parses timestamp lines for UA/EN song pairs,
// and writes song_mappings.json, song_mappings_flat.json, conflicts.json to OUT_DIR.
// Run: node scripts/fetch_yt_song_mappings.mjs

import { writeFileSync } from 'fs'
import { join } from 'path'

const delay = ms => new Promise(r => setTimeout(r, ms))

async function apiFetch(url) {
    const res = await fetch(url)
    const json = await res.json()
    if (!res.ok) throw new Error(JSON.stringify(json?.error ?? json))
    return json
}

// Step 1: collect videoIds + titles from playlistItems
async function collectVideos() {
    const videos = []
    let pageToken = ''
    let totalItems = 0
    let skippedDate = 0
    let skippedTitle = 0

    console.log('Step 1: scanning playlist…')

    while (true) {
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${UPLOADS_PLAYLIST_ID}&key=${API_KEY}${pageToken ? `&pageToken=${pageToken}` : ''}`
        const data = await apiFetch(url)
        const items = data.items ?? []
        totalItems += items.length

        for (const item of items) {
            const s = item.snippet
            const videoId     = s?.resourceId?.videoId
            const title       = s?.title ?? ''
            const publishedAt = s?.publishedAt ?? ''

            if (!videoId) continue
            if (!publishedAt || new Date(publishedAt) < DATE_FROM) { skippedDate++; continue }
            if (!title.startsWith(TITLE_PREFIX)) { skippedTitle++; continue }

            videos.push({ videoId, title, publishedAt })
        }

        console.log(`  page: ${items.length} items | kept: ${videos.length} | skippedDate: ${skippedDate} | skippedTitle: ${skippedTitle}`)

        if (!data.nextPageToken) break
        pageToken = data.nextPageToken
        await delay(200)
    }

    return { videos, totalItems, skippedDate, skippedTitle }
}

// Step 2: batch fetch full descriptions via videos endpoint (50 per request)
async function fetchDescriptions(videos) {
    const descMap = new Map()

    for (let i = 0; i < videos.length; i += 50) {
        const batch = videos.slice(i, i + 50)
        const ids = batch.map(v => v.videoId).join(',')
        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${ids}&key=${API_KEY}`
        try {
            const data = await apiFetch(url)
            for (const item of data.items ?? []) {
                descMap.set(item.id, item.snippet?.description ?? '')
            }
            console.log(`  batch ${Math.floor(i/50)+1}: fetched ${data.items?.length ?? 0} descriptions`)
        } catch (err) {
            console.error(`  ERROR on batch at index ${i}:`, err.message)
        }
        if (i + 50 < videos.length) await delay(200)
    }

    return descMap
}

// Step 3: parse timestamp lines "09:20 - Радість (The Joy)"
function parseDescription(description) {
    if (!description) return []
    const pairs = []
    for (const raw of description.split('\n')) {
        const line = raw.trim()
        if (!/^\d+:\d+/.test(line)) continue
        const afterTimestamp = line.replace(/^\d[\d:]+\s*[-–—]\s*/, '').trim()
        if (!afterTimestamp) continue
        const match = afterTimestamp.match(/^(.+?)\s*\(([^)]+)\)\s*$/)
        if (!match) continue
        const ua = match[1].trim()
        const en = match[2].trim()
        if (ua.length < 2 || en.length < 2) continue
        pairs.push({ ua, en })
    }
    return pairs
}

async function main() {
    const { videos, totalItems, skippedDate, skippedTitle } = await collectVideos()
    console.log(`\nPlaylist done. Kept ${videos.length} live service videos.\n`)

    console.log('Step 2: fetching full descriptions…')
    const descMap = await fetchDescriptions(videos)

    console.log('\nStep 3: parsing…')
    const result = []
    for (const { videoId, title, publishedAt } of videos) {
        const description = descMap.get(videoId) ?? ''
        const songs = parseDescription(description)
        result.push({ video_id: videoId, video_title: title, published_at: publishedAt, songs })
    }

    // Flat dedup by English name; conflicts list duplicate UA variants
    const seen = new Map()
    const conflictsMap = new Map()
    const flat = []

    for (const video of result) {
        for (const { ua, en } of video.songs) {
            const key = en.toLowerCase().trim()
            if (!seen.has(key)) {
                seen.set(key, ua)
                flat.push({ ua, en })
            } else if (seen.get(key) !== ua) {
                console.warn(`  CONFLICT: "${en}" ← "${seen.get(key)}" vs "${ua}"`)
                if (!conflictsMap.has(key)) conflictsMap.set(key, new Set([seen.get(key)]))
                conflictsMap.get(key).add(ua)
            }
        }
    }

    const conflicts = []
    for (const [key, uaSet] of conflictsMap.entries()) {
        const en = flat.find(p => p.en.toLowerCase().trim() === key)?.en ?? key
        conflicts.push({ en, found: [...uaSet] })
    }

    const mappingsPath  = join(OUT_DIR, 'song_mappings.json')
    const flatPath      = join(OUT_DIR, 'song_mappings_flat.json')
    const conflictsPath = join(OUT_DIR, 'conflicts.json')

    writeFileSync(mappingsPath,  JSON.stringify(result,    null, 2), 'utf-8')
    writeFileSync(flatPath,      JSON.stringify(flat,      null, 2), 'utf-8')
    writeFileSync(conflictsPath, JSON.stringify(conflicts, null, 2), 'utf-8')

    const totalPairs = result.reduce((acc, v) => acc + v.songs.length, 0)

    console.log('\n══════════════════════════════════════════')
    console.log(`Total playlist items:     ${totalItems}`)
    console.log(`Skipped (before cutoff):  ${skippedDate}`)
    console.log(`Skipped (wrong title):    ${skippedTitle}`)
    console.log(`Videos processed:         ${result.length}`)
    console.log(`Total song pairs found:   ${totalPairs}`)
    console.log(`Unique pairs (flat):      ${flat.length}`)
    console.log(`Conflicts:                ${conflicts.length}`)
    console.log('──────────────────────────────────────────')
    console.log(`song_mappings.json → ${mappingsPath}`)
    console.log(`song_mappings_flat → ${flatPath}`)
    console.log(`conflicts.json     → ${conflictsPath}`)
    console.log('══════════════════════════════════════════')
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1) })
