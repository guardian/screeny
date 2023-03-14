import fs from 'fs'
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

export const readFromFile = (filename) => {
    const file = fs.readFileSync(filename, 'utf8');

    return file.split('\n').map(line => line.trim()).filter(isValidUrl)
}
