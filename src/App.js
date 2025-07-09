import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent } from './components/ui/card';
import { Input } from './components/ui/input';

const SHEET_ID = '1AB21wjJIu5vK69A6OlnJ9I8M5XBbOib7PsO2axvOiu0';
const API_KEY = 'AIzaSyClpkwsvApOuFBAVJl3pF66mdkTOiGmx-s';
const SHEET_NAME = '18.06.2025';
const SHEET_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;

/********************  UI COMPONENTS  ********************/
function Dashboard({ data }) {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">DMRC Smart Parking Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        <Card>
          <CardContent>Total Sites: {data.length}</CardContent>
        </Card>
        <Card>
          <CardContent>Smart Enabled: {data.filter(m => m.smartProvider).length}</CardContent>
        </Card>
      </div>
    </div>
  );
}

function SiteList({ data }) {
  const [search, setSearch] = useState('');
  console.log('Fetched Data:', data);

  const filtered = data.filter(
    site => site.station && site.station.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">Parking Sites</h2>
      <Input
        placeholder="Search by station name..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-4"
      />
      <ul className="space-y-2">
        {filtered.map((site, index) => (
          <li key={index} className="border p-4 rounded hover:bg-gray-100 text-sm max-sm:text-xs">
            <Link to={`/sites/${index}`} className="text-blue-600 block">
              <div><strong>{site.station}</strong></div>
              <div className="text-gray-600">{site.line}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PdfLink({ url, label }) {
  if (!url) return null;
  return (
    <p className="text-sm max-sm:text-xs">
      <strong>{label}:</strong>{' '}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline"
      >
        View {label}
      </a>
    </p>
  );
}

function SiteDetail({ id, data }) {
  const site = data[Number(id)];
  if (!site) return <div className="p-4">Site not found</div>;

  return (
    <div className="p-4 text-sm max-sm:text-xs">
      <h2 className="text-xl font-bold mb-2">{site.station} – Details</h2>
      <p><strong>Line:</strong> {site.line}</p>
      <p><strong>Agency:</strong> {site.agency}</p>
      <p><strong>Contract:</strong> {site.contract}</p>
      <p><strong>Handover Date:</strong> {site.handover || 'N/A'}</p>
      <p><strong>LoA Issued:</strong> {site.loaIssued || 'N/A'}</p>
      <p><strong>Days Since Handover:</strong> {site.daysSince || 'N/A'}</p>
      <p><strong>Smart Provider:</strong> {site.smartProvider || 'N/A'}</p>
      <p><strong>Integrated:</strong> {site.integrated}</p>
      <PdfLink url={site.loaPDF} label="LoA PDF" />
      <PdfLink url={site.gtcPDF} label="GTC PDF" />
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
            gtcPDF: entry['gtc pdf'] || ''
          };
        });

        console.log('Mapped Data:', mapped);
        setData(mapped);
      });
  }, []);

  return (
    <Router>
      <nav className="p-4 bg-gray-100 flex flex-wrap items-center justify-between">
        <Link to="/" className="flex items-center gap-4 mb-2 sm:mb-0">
          <img src="/dmrc-logo.png" alt="DMRC Logo" className="h-10 w-auto" />
          <span className="text-lg font-bold">DMRC Parking Dashboard</span>
        </Link>
        <div className="flex gap-4 flex-wrap">
          <Link to="/" className="text-blue-600 hover:underline">Dashboard</Link>
          <Link to="/sites" className="text-blue-600 hover:underline">Sites</Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard data={data} />} />
        <Route path="/sites" element={<SiteList data={data} />} />
        <Route path="/sites/:id" element={<SiteDetailWrapper data={data} />} />
      </Routes>
    </Router>
  );
}

export default App;