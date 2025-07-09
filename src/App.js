import { useState } from 'react';
import {
  BarChart4,
  ChevronDown,
  ChevronUp,
  Download,
  FileDown
} from 'lucide-react';

// 👉 if these give a “module not found” error run:
//    npm i lucide-react
// --------------------------------------------------
// Tailwind‑styled primitives (these are **default** exports, not named)
// If you generated them with shadcn/ui they are already default.
// Otherwise replace these with your own simple components.
import Input from './components/ui/input';
import Button from './components/ui/button';

/*********************** GOOGLE SHEETS CONFIG ************************/
const SHEET_ID  = '1AB21wjJIu5vK69A6OlnJ9I8M5XBbOib7PsO2axvOiu0';
const API_KEY   = 'AIzaSyClpkwsvApOuFBAVJl3pF66mdkTOiGmx-s';
const UPDATES_TAB = 'Parking updates 18.06.2025';
const SHEET_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(
  UPDATES_TAB
)}?key=${API_KEY}`;

/************************ SMALL  UI HELPERS *************************/
// colour‑coded tags for status column
const statusTag = (text) => {
  if (!text) return null;
  const lower = text.toLowerCase();
  const colour = lower.includes('done')
    ? 'bg-green-600'
    : lower.includes('pending')
    ? 'bg-yellow-600'
    : 'bg-red-600';
  return (
    <span className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${colour}`}>{text}</span>
  );
};

/*************************** COMPONENT  *****************************/
export default function UpdatesPage() {
  const [data, setData]   = useState([]);
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState({});

  // ─── Fetch once on mount ────────────────────────────────────────
  useState(() => {
    fetch(SHEET_URL)
      .then((r) => r.json())
      .then((json) => {
        const rows = json.values || [];
        if (!rows.length) return;
        const headers = rows[0].map((h) => h.trim().toLowerCase());
        const body    = rows.slice(1);
        const parsed  = body.map((row) => {
          const entry = {};
          headers.forEach((key, i) => {
            entry[key] = row[i] || '';
          });
          return entry;
        });
        setData(parsed);
      })
      .catch(console.error);
  }, []);

  if (!data.length) return <p className="p-4 text-center">Loading updates…</p>;

  // group by station
  const grouped = data.reduce((acc, row) => {
    const station = row.station || 'Unknown';
    acc[station] = acc[station] ? [...acc[station], row] : [row];
    return acc;
  }, {});

  const stations = Object.keys(grouped).filter((s) =>
    s.toLowerCase().includes(filter.toLowerCase())
  );

  const exportCSV = (rows, filename) => {
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => `"${r[h]}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

      {stations.map((station) => (
        <div key={station} className="border rounded-lg mb-6 shadow-sm">
          {/* Header row */}
          <button
            className="w-full px-4 py-3 bg-gray-100 flex justify-between items-center text-left"
            onClick={() => setOpen((o) => ({ ...o, [station]: !o[station] }))}
          >
            <span className="font-semibold text-lg">{station}</span>
            {open[station] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>

          {open[station] && (
            <div className="p-4 overflow-x-auto">
              <div className="flex justify-end mb-2">
                <Button size="sm" onClick={() => exportCSV(grouped[station], `${station}-updates.csv`)}>
                  <FileDown className="w-4 h-4 mr-1" /> Export CSV
                </Button>
              </div>
              <table className="min-w-full text-sm border">
                <thead className="bg-gray-200 text-xs uppercase">
                  <tr>
                    {Object.keys(grouped[station][0]).map((col) => (
                      <th key={col} className="px-3 py-2 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grouped[station].map((row, idx) => (
                    <tr key={idx} className="border-t hover:bg-gray-50">
                      {Object.entries(row).map(([key, val]) => (
                        <td key={key} className="px-3 py-2 whitespace-nowrap">
                          {key.toLowerCase().includes('status') ? statusTag(val) : val}
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
