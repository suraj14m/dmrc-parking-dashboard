import axios from 'axios';

const SHEET_ID = '1AB21wjJIu5vK69A6OlnJ9I8M5XBbOib7PsO2axvOiu0';
const API_KEY = 'AIzaSyClpkwsvApOuFBAVJl3pF66mdkTOiGmx-s';
const SHEET_NAME = '18.06.2025'; // Sheet tab name

export async function fetchSheetData() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(SHEET_NAME)}?alt=json&key=${API_KEY}`;

  try {
    const response = await axios.get(url);
    const rows = response.data.values;

    const headers = rows[0];
    const data = rows.slice(1).map((row) =>
      Object.fromEntries(headers.map((h, i) => [h, row[i] || ""]))
    );

    return data;
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    return [];
  }
}
