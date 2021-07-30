// thanks to: https://developers.google.com/sheets/api/quickstart/nodejs
const fs = require('fs');
const {google} = require('googleapis');
const path = require('path');
const readline = require('readline');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.resolve(__dirname, '../token.json');

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  try {
      const token = fs.readFileSync(TOKEN_PATH)
      oAuth2Client.setCredentials(JSON.parse(token));
      return oAuth2Client;
  } catch (e) {
      return getNewToken(oAuth2Client);
  }
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client) {
  return new Promise((resolve, reject) => {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
      });
      console.log('Authorize this app by visiting this url:', authUrl);
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
          if (err) reject(console.error('Error while trying to retrieve access token', err));
          oAuth2Client.setCredentials(token);
          // Store the token to disk for later program executions
          fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
            if (err) reject(console.error(err));
            console.log('Token stored to', TOKEN_PATH);
          });
          resolve(oAuth2Client);
        });
      });
  })
}

const getUrls = async (auth, spreadsheetId, sheetId) => {
    const sheets = google.sheets({version: 'v4', auth});

    return new Promise((resolve, reject) => {
        sheets.spreadsheets.values.get({
            spreadsheetId,
            range: sheetId ? `${sheetId}!A2:A` : 'A2:A', // assuming all urls start from col A row 2
            }, (err, res) => {
            if (err) reject(`The API returned an error: ${err}`);
            const rows = res.data.values;
            
            if (rows.length) {
                resolve(rows.flat(1));
            } else {
                reject('No data found.');
            }
        });
    })
}

const readFromSpreadSheet = async (spreadsheetId, sheetId) => {
    // Load client secrets from a local file.
    try {
        const credentials = fs.readFileSync(path.resolve(__dirname, '../credentials.json'));
        const authClient = await authorize(JSON.parse(credentials));
        return await getUrls(authClient, spreadsheetId, sheetId);
    } catch (e) {
        return console.log('Error loading client secret file:', err);
    }
}
  
module.exports = {
    readFromSpreadSheet
}