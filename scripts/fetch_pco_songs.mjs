// FILL IN YOUR VALUES HERE
// PLANNING CENTER CLIENT ID
const APP_ID      = ''
// PLANNING CENTER SECRET
const SECRET      = ''
const OUTPUT_FILE = 'D:\\Projects\\GN-Backend\\songs.json'

// Fetches all songs from Planning Center Online and saves titles to OUTPUT_FILE.
// Run: node scripts/fetch_pco_songs.mjs

import { writeFileSync } from 'fs'

const BASE_HEADERS = {
    'Authorization': 'Basic ' + Buffer.from(`${APP_ID}:${SECRET}`).toString('base64'),
    'Content-Type': 'application/json'
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

async function fetchPage(url) {
    const res = await fetch(url, { headers: BASE_HEADERS })
    if (!res.ok) {
        const body = await res.text()
        throw new Error(`HTTP ${res.status}: ${body}`)
    }
    return res.json()
}

async function fetchAllSongs() {
    const songs = []
    let url = 'https://api.planningcenteronline.com/services/v2/songs?per_page=100'

    while (url) {
        const data = await fetchPage(url)
        const page = data.data ?? []

        for (const song of page) {
            songs.push({
                id: song.id,
                title: song.attributes?.title ?? '',
                alternate_title: song.attributes?.alternate_title ?? ''
            })
        }

        console.log(`Fetched ${page.length} songs (total so far: ${songs.length})`)
        url = data.links?.next ?? null
        if (url) await delay(300)
    }

    return songs
}

fetchAllSongs()
    .then(songs => {
        writeFileSync(OUTPUT_FILE, JSON.stringify(songs, null, 2), 'utf-8')
        console.log(`\nDone. Total songs saved: ${songs.length}`)
        console.log(`Output file: ${OUTPUT_FILE}`)
    })
    .catch(err => {
        console.error('Failed:', err.message)
        process.exit(1)
    })
