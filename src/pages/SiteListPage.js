// ───────────────────────────────────────────────────────────────
// src/pages/SiteListPage.js
// ───────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import {
  MapPinned,
  ChevronDown,
  ChevronUp,
  FileDown,
  ExternalLink
} from 'lucide-react';

import Input  from '../components/ui/input';
import Button from '../components/ui/button';

/*********************** GOOGLE SHEETS CONFIG ************************/
const SHEET_ID   = '1AB21wjJIu5vK69A6OlnJ9I8M5XBbOib7PsO2axvOiu0';   // same workbook
const API_KEY    = 'AIzaSyClpkwsvApOuFBAVJl3pF66mdkTOiGmx-s';
const SITES_TAB  = '18.06.2025';                                     // master site list
const SHEET_URL  = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(
  SITES_TAB
)}?key=${API_KEY}`;

/*********************** SMALL HELPERS ******************************/
const exportCSV = (rows, filename) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(','), ...rows.map((r) =>
      headers.map((h) => `"${(r[h] ?? '').replace(/"/g, '""')}"`).join(',')
    )].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

/************************* PAGE COMPONENT **************************/
export default function SiteListPage() {
  const [sites, setSites] = useState([]);
  const [filter, setFilter] = useState('');
  const [open,   setOpen]   = useState({});      // per-station collapse

  /* ─── Fetch once on mount ───────────────────────────── */
  useEffect(() => {
    fetch(SHEET_URL)
      .then((r) => r.json())
      .then((json) => {
        const rows = json.values || [];
        if (!rows.length) return;
        const headers = rows[0].map((h) => h.trim().toLowerCase());
        const body    = rows.slice(1);

        const parsed = body.map((row) => {
          const entry = {};
          headers.forEach((key, i) => {
            entry[key] = row[i] || '';
          });
          return {
            station:       entry['station'],
            line:          entry['line'],
            agency:        entry['parking agency'],
            contract:      entry['contract'],
            handover:      entry['handing over'],
            loaIssued:     entry['loa issued date'],
            daysSince:     entry['days since handover'],
            smartProvider: entry['smart solution provider'],
            integrated:    entry['integrated with dmrc app'],
            loaPDF:        entry['loa pdf'],
            gtcPDF:        entry['gtc pdf']
          };
        });
        setSites(parsed);
      })
      .catch(console.error);
  }, []);

  if (!sites.length)
    return <p className="p-4 text-center">Loading sites…</p>;

  const filtered = sites.filter((s) =>
    s.station.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2 justify-center">
        <MapPinned className="h-6 w-6" /> Site List
      </h1>

      <Input
        placeholder="Search station…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-6 max-w-md mx-auto block"
      />

      <div className="flex justify-end mb-4">
        <Button size="sm" onClick={() => exportCSV(filtered, 'dmrc-sites.csv')}>
          <FileDown className="w-4 h-4 mr-1" /> Export CSV
        </Button>
      </div>

      {filtered.map((site) => (
        <div key={site.station} className="border rounded-lg mb-4 shadow-sm">
          <button
            className="w-full px-4 py-3 bg-gray-100 flex justify-between items-center text-left"
            onClick={() =>
              setOpen((o) => ({ ...o, [site.station]: !o[site.station] }))
            }
          >
            <span className="font-semibold">
              {site.station} <span className="text-sm text-gray-500">({site.line})</span>
            </span>
            {open[site.station] ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>

          {open[site.station] && (
            <div className="p-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
                <Info label="Line"          value={site.line} />
                <Info label="Agency"        value={site.agency} />
                <Info label="Contract"      value={site.contract} />
                <Info label="LOA Issued"    value={site.loaIssued} />
                <Info label="Handover"      value={site.handover} />
                <Info label="Days since"    value={site.daysSince} />
                <Info label="Smart Provider" value={site.smartProvider} />
                <Info label="Integrated"     value={site.integrated} />
                {site.loaPDF && (
                  <FileLink label="LOA PDF" url={site.loaPDF} />
                )}
                {site.gtcPDF && (
                  <FileLink label="GTC PDF" url={site.gtcPDF} />
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ───────────── reusable mini components ────────────── */
const Info = ({ label, value }) => (
  <p>
    <span className="font-medium">{label}:</span>{' '}
    <span className="text-gray-700">{value || '—'}</span>
  </p>
);

const FileLink = ({ label, url }) => (
  <p>
    <span className="font-medium">{label}:</span>{' '}
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline inline-flex items-center gap-1"
    >
      View PDF <ExternalLink className="w-4 h-4" />
    </a>
  </p>
);