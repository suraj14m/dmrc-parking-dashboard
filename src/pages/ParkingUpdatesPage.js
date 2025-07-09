// ───────────────────────────────────────────────────────────────
// src/pages/UpdatesPage.js
// ───────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import {
  BarChart4,
  ChevronDown,
  ChevronUp,
  FileDown
} from 'lucide-react';

// If you generated these with shadcn/ui they are *default* exports.
// Otherwise replace with your own simple <input …/> / <button …/> wrappers.
import Input  from '../components/ui/input';
import Button from '../components/ui/button';

/************** 1.  GOOGLE-SHEETS CONFIG  ************************/
const SHEET_ID   = '1AB21wjJIu5vK69A6OlnJ9I8M5XBbOib7PsO2axvOiu0';
const API_KEY    = 'AIzaSyClpkwsvApOuFBAVJl3pF66mdkTOiGmx-s';
const UPDATES_TAB = 'Parking updates 18.06.2025';   // tab name *exactly*
const SHEET_URL  =
  `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/` +
  `${encodeURIComponent(UPDATES_TAB)}?key=${API_KEY}`;

/************** 2.  SMALL  UI HELPERS  ***************************/
// colour-coded tag for any column that contains “status”
function StatusTag({ text = '' }) {
  const lower = text.toLowerCase();
  const colour = lower.includes('done')
    ? 'bg-green-600'
    : lower.includes('pending')
    ? 'bg-yellow-600'
    : 'bg-red-600';
  return (
    <span className={`px-2 py-0.5 rounded-full text-white text-xs font-semibold ${colour}`}>
      {text}
    </span>
  );
}

/********************** 3.  MAIN  COMPONENT  *********************/
export default function UpdatesPage() {
  const [rows,   setRows]   = useState([]);
  const [filter, setFilter] = useState('');          // station filter
  const [open,   setOpen]   = useState({});          // accordion state

  /* ── Fetch once on mount ──────────────────────────────────── */
  useEffect(() => {
    fetch(SHEET_URL)
      .then((r) => r.json())
      .then((json) => {
        const raw  = json.values || [];
        if (!raw.length) return;

        const headers = raw[0].map((h) => h.trim().toLowerCase());
        const body    = raw.slice(1);

        const parsed = body.map((r) => {
          const obj = {};
          headers.forEach((k, i) => (obj[k] = r[i] || ''));
          return obj;
        });
        setRows(parsed);
      })
      .catch(console.error);
  }, []);

  if (!rows.length) return <p className="p-6 text-center">Loading updates…</p>;

  /* ── Group by station ─────────────────────────────────────── */
  const grouped = rows.reduce((acc, r) => {
    const stn = r.station || 'Unknown';
    acc[stn] = acc[stn] ? [...acc[stn], r] : [r];
    return acc;
  }, {});

  const stations = Object.keys(grouped).filter((s) =>
    s.toLowerCase().includes(filter.toLowerCase())
  );

  /* ── CSV export helper ─────────────────────────────────────── */
  const exportCSV = (data, filename) => {
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map((row) => headers.map((h) => `"${row[h]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ── RENDER ───────────────────────────────────────────────── */
  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2 justify-center">
        <BarChart4 className="h-6 w-6" /> Parking Updates
      </h1>

      <Input
        placeholder="Search station…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-6 max-w-md mx-auto block"
      />

      {stations.map((stn) => (
        <div key={stn} className="border rounded-lg mb-6 shadow-sm">
          {/* Accordion header */}
          <button
            className="w-full px-4 py-3 bg-gray-100 flex justify-between items-center text-left"
            onClick={() => setOpen((o) => ({ ...o, [stn]: !o[stn] }))}
          >
            <span className="font-semibold text-lg">{stn}</span>
            {open[stn] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {/* Accordion body */}
          {open[stn] && (
            <div className="p-4 overflow-x-auto">
              <div className="flex justify-end mb-3">
                <Button size="sm" onClick={() => exportCSV(grouped[stn], `${stn}-updates.csv`)}>
                  <FileDown className="w-4 h-4 mr-1" /> Export CSV
                </Button>
              </div>

              <table className="min-w-full text-sm border">
                <thead className="bg-gray-200 text-xs uppercase">
                  <tr>
                    {Object.keys(grouped[stn][0]).map((col) => (
                      <th key={col} className="px-3 py-2 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grouped[stn].map((row, i) => (
                    <tr key={i} className="border-t hover:bg-gray-50">
                      {Object.entries(row).map(([k, v]) => (
                        <td key={k} className="px-3 py-2 whitespace-nowrap">
                          {k.includes('status') ? <StatusTag text={v} /> : v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}