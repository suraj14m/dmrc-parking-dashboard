import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent } from './components/ui/card';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Download, FileText, Train, CheckCircle, XCircle } from 'lucide-react';

const SHEET_ID = '1AB21wjJIu5vK69A6OlnJ9I8M5XBbOib7PsO2axvOiu0';
const API_KEY = 'AIzaSyClpkwsvApOuFBAVJl3pF66mdkTOiGmx-s';
const SHEET_NAME = '18.06.2025';
const SHEET_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;

/********************  helpers  ********************/
const lineColors = {
  red: 'bg-red-600',
  blue: 'bg-blue-600',
  green: 'bg-green-600',
  yellow: 'bg-yellow-500',
  airport: 'bg-purple-600',
  violet: 'bg-violet-600',
  orange: 'bg-orange-600',
  pink: 'bg-pink-600',
  grey: 'bg-gray-500',
  silver: 'bg-slate-400',
  'line 8': 'bg-amber-600',
  'line 9': 'bg-lime-600'
};

const badge = (text) => (
  <span
    className={`inline-block px-2 py-1 text-xs font-semibold text-white rounded-full ${
      lineColors[text?.toLowerCase()] || 'bg-gray-400'
    }`}
  >
    {text}
  </span>
);

/********************  UI COMPONENTS  ********************/
function Dashboard({ data }) {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6 text-center flex items-center justify-center gap-2">
        <Train className="h-8 w-8" /> DMRC Smart Parking Dashboard
      </h1>
      <div className="grid grid-cols-2 gap-6 max-sm:grid-cols-1">
        <Card className="shadow-xl p-6">
          <CardContent className="flex flex-col items-center">
            <span className="text-4xl font-bold">{data.length}</span>
            <span className="mt-1 text-lg">Total Sites</span>
          </CardContent>
        </Card>
        <Card className="shadow-xl p-6">
          <CardContent className="flex flex-col items-center">
            <span className="text-4xl font-bold">{data.filter(m => m.smartProvider).length}</span>
            <span className="mt-1 text-lg">Smart Enabled</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SiteList({ data }) {
  const [search, setSearch] = useState('');
  const filtered = data.filter(
    site => site.station && site.station.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Parking Sites</h2>
      <Input
        placeholder="Search by station name..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-6 mx-auto max-w-md block"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((site, index) => (
          <Link
            to={`/sites/${index}`}
            key={index}
            className="block border rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-semibold">{site.station}</h3>
              {badge(site.line)}
            </div>
            <p className="text-gray-600 text-sm">Agency: {site.agency}</p>
            <div className="mt-2 flex items-center gap-2">
              {site.integrated?.toLowerCase() === 'yes' ? (
                <CheckCircle className="text-green-600 h-4 w-4" />
              ) : (
                <XCircle className="text-red-600 h-4 w-4" />
              )}
              <span className="text-xs text-gray-500">{site.integrated === 'Yes' ? 'Integrated' : 'Not Integrated'}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function PdfButton({ url, label }) {
  if (!url) return null;
  return (
    <Button
      asChild
      className="flex gap-2 items-center px-4 py-2 w-full justify-center"
    >
      <a href={url} target="_blank" rel="noopener noreferrer" download>
        <Download className="h-4 w-4" /> {label}
      </a>
    </Button>
  );
}

function SiteDetail({ id, data }) {
  const site = data[Number(id)];
  if (!site) return <div className="p-4 text-center">Site not found</div>;

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-3xl font-bold flex items-center gap-3">
        <FileText className="h-7 w-7" /> {site.station}
      </h2>
      <div className="space-y-2 text-base">
        <p><strong>Line:</strong> {badge(site.line)}</p>
        <p><strong>Agency:</strong> {site.agency}</p>
        <p><strong>Contract:</strong> {site.contract}</p>
        <p><strong>Handover Date:</strong> {site.handover || 'N/A'}</p>
        <p><strong>LoA Issued:</strong> {site.loaIssued || 'N/A'}</p>
        <p><strong>Days Since Handover:</strong> {site.daysSince || 'N/A'}</p>
        <p><strong>Smart Provider:</strong> {site.smartProvider || 'N/A'}</p>
        <p>
          <strong>Integrated:</strong>{' '}
          {site.integrated?.toLowerCase() === 'yes' ? (
            <span className="text-green-600 font-semibold">Yes</span>
          ) : (
            <span className="text-red-600 font-semibold">No</span>
          )}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
        <PdfButton url={site.loaPDF} label="Download LoA" />
        <PdfButton url={site.gtcPDF} label="Download GTC" />
      </div>
    </div>
  );
}

function SiteDetailWrapper({ data }) {
  const id = window.location.pathname.split('/').pop();
  return <SiteDetail id={id} data={data} />;
}

/********************  MAIN APP  ********************/
function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(SHEET_URL)
      .then(res => res.json())
      .then(res => {
        if (!res.values) return;
        const rows = res.values;
        const headers = rows[0].map(h => h.trim().toLowerCase());
        const body = rows.slice(1);

        const mapped = body.map(row => {
          const entry = {};
          headers.forEach((key, i) => {
            entry[key] = row[i] || '';
          });
          return {
            station: entry['station'] || '',
            line: entry['line'] || '',
            agency: entry['parking agency'] || '',
            contract: entry['contract'] || '',
            handover: entry['handing over'] || '',
            loaIssued: entry['loa issued date'] || '',
            daysSince: entry['days since handover'] || '',
            smartProvider: entry['smart solution provider'] || '',
            integrated: entry['integrated with dmrc app'] || '',
            loaPDF: entry['loa pdf'] || '',
            gtcPDF: entry
