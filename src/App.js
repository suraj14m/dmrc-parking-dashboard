
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent } from './components/ui/card';
import { Input } from './components/ui/input';
import { mockData } from './mockData'; //

function Dashboard() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">DMRC Smart Parking Dashboard</h1>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent>Total Sites: {mockData.length}</CardContent>
        </Card>
        <Card>
          <CardContent>Smart Enabled: {mockData.filter(m => m.smartProvider).length}</CardContent>
        </Card>
      </div>
    </div>
  );
}

function SiteList() {
  const [search, setSearch] = useState("");
  const filtered = mockData.filter(site =>
    site.station.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">Parking Sites</h2>
      <Input
        placeholder="Search by station name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />
      <ul className="space-y-2">
        {filtered.map(site => (
          <li key={site.id} className="border p-2 rounded hover:bg-gray-100">
            <Link to={`/sites/${site.id}`} className="text-blue-600">
              {site.station} – {site.line}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SiteDetail({ id }) {
  const site = mockData.find(s => s.id === Number(id));
  if (!site) return <div className="p-4">Site not found</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">{site.station} – Details</h2>
      <p><strong>Line:</strong> {site.line}</p>
      <p><strong>Agency:</strong> {site.agency}</p>
      <p><strong>Contract:</strong> {site.contract}</p>
      <p><strong>Handover Date:</strong> {site.handover || 'N/A'}</p>
      <p><strong>Smart Provider:</strong> {site.smartProvider || 'N/A'}</p>
      <p><strong>Integrated:</strong> {site.integrated}</p>
    </div>
  );
}

function SiteDetailWrapper() {
  const id = window.location.pathname.split("/").pop();
  return <SiteDetail id={id} />;
}

function App() {
  return (
    <Router>
      <nav className="p-4 bg-gray-100 flex gap-4">
        <Link to="/">Dashboard</Link>
        <Link to="/sites">Sites</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/sites" element={<SiteList />} />
        <Route path="/sites/:id" element={<SiteDetailWrapper />} />
      </Routes>
    </Router>
  );
}

export default App;
