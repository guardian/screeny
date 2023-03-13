import fs from 'fs'
import { parse } from 'csv-parse/sync'
import { URL } from 'url'

const isValidUrl = (url) => {
    try {
        new URL(url);
        return true
    } catch (err) {
        console.warn(`Invalid URL "${url}", skipping..."`)
        return false
    }
}

export const readFromCSV = (filename) => {
    const file = fs.readFileSync(filename);

    const records = parse(file, {
        columns: false,
        skip_empty_lines: true
    });

    if (!Array.isArray) {
        new Error('Didn\'t receive expected array from parsing CSV')
    }

    return records.flatMap((url => url)).filter(isValidUrl)
}