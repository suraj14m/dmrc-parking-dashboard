// src/pages/SmartDashboard.js
import { useEffect, useState } from 'react';

export default function SmartDashboard() {
  const [data, setData] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const SHEET_URL = 'https://opensheet.elk.sh/1AB21wjJIu5vK69A6OlnJ9I8M5XBbOib7PsO2axvOiu0/18.06.2025';

  useEffect(() => {
    fetch(SHEET_URL)
      .then((res) => res.json())
      .then((rows) => {
        if (!Array.isArray(rows)) {
          console.error('Invalid data format:', rows);
          return;
        }
        setData(rows);
      })
      .catch((err) => console.error('Error fetching:', err));
  }, []);

  const smartSites = data;
  const integratedSites = smartSites.filter((row) => row['Integrated with DMRC App']?.toLowerCase() === 'ok');
  const pendingSites = smartSites.filter((row) => row['Integrated with DMRC App']?.toLowerCase() !== 'ok');

  // Find smart parking entries with ≥ 60 days since handover
  const sixtyDaySites = smartSites.filter((row) => {
    const dayKey = Object.keys(row).find(k =>
      k.toLowerCase().includes('days since handover')
    );
    const days = Number(row[dayKey]);
    return !isNaN(days) && days >= 60;
  });

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Smart Parking Summary</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Smart Parking Sites" value={smartSites.length} />
        <StatCard label="Integrated with DMRC App" value={integratedSites.length} />
        <StatCard label="Pending Integration" value={pendingSites.length} />
        <StatCard
          label="Smart Parkings ≥ 60 Days"
          value={sixtyDaySites.length}
          onClick={() => setShowPopup(true)}
          clickable
        />
      </div>

      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start pt-20 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Smart Sites ≥ 60 Days</h2>
              <button
                className="text-gray-600 hover:text-red-600 text-sm"
                onClick={() => setShowPopup(false)}
              >
                ✕
              </button>
            </div>
            <ul className="space-y-2">
              {sixtyDaySites.map((site, i) => (
                <li key={i} className="border rounded p-3 bg-blue-50 shadow-sm">
                  <p className="text-sm">
                    <strong>Station:</strong> {site['Station'] || '—'}<br />
                    <strong>Days Since Handover:</strong>{' '}
                    {site[Object.keys(site).find(k => k.toLowerCase().includes('days since handover'))] || '—'}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, onClick, clickable }) {
  return (
    <div
      className={`bg-white shadow-lg rounded-xl p-6 text-center border-l-4 border-blue-500 cursor-${clickable ? 'pointer' : 'default'}`}
      onClick={onClick}
    >
      <div className="text-sm text-gray-600 mb-2 font-semibold">{label}</div>
      <div className="text-2xl font-bold text-blue-700">{value}</div>
    </div>
  );
}