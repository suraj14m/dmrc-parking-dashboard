// src/pages/SmartDashboard.js
import { useEffect, useState } from 'react';

export default function SmartDashboard() {
  const [smartData, setSmartData] = useState([]);
  const [miscData, setMiscData] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    fetch('https://opensheet.elk.sh/1AB21wjJIu5vK69A6OlnJ9I8M5XBbOib7PsO2axvOiu0/18.06.2025')
      .then((res) => res.json())
      .then((rows) => setSmartData(rows))
      .catch((err) => console.error('Error fetching smart sheet:', err));

    fetch('https://opensheet.elk.sh/1AB21wjJIu5vK69A6OlnJ9I8M5XBbOib7PsO2axvOiu0/Misc')
      .then((res) => res.json())
      .then((rows) => setMiscData(rows))
      .catch((err) => console.error('Error fetching misc sheet:', err));
  }, []);

  const integratedSites = smartData.filter((row) => row['Integrated with DMRC App']?.toLowerCase() === 'ok');
  const pendingSites = smartData.filter((row) => row['Integrated with DMRC App']?.toLowerCase() !== 'ok');

  const dayKey = smartData.length ? Object.keys(smartData[0]).find((k) => k.toLowerCase().includes('days since handover')) : null;
  const stationKey = smartData.length ? Object.keys(smartData[0]).find((k) => k.toLowerCase() === 'station') : null;

  const sixtyDaySites = smartData.filter((row) => {
    const days = Number(row[dayKey]);
    return !isNaN(days) && days >= 60;
  });

  const renderEntries = (data) => {
    if (!data) return null;
    return Object.entries(data).map(([key, val], j) => (
      <div key={j}><strong>{key}:</strong> {val}</div>
    ));
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Smart Parking Summary</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Smart Parking Sites" value={smartData.length} />
        <StatCard label="Integrated with DMRC App" value={integratedSites.length} />
        <StatCard label="Pending Integration" value={pendingSites.length} />
        <StatCard
          label="Smart Parkings ≥ 60 Days"
          value={sixtyDaySites.length}
          onClick={() => setShowPopup(true)}
          clickable
        />
      </div>

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
                    <strong>Station:</strong> {site[stationKey] || '—'}<br />
                    <strong>Days Since Handover:</strong> {site[dayKey] || '—'}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {miscData.length > 1 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Miscellaneous Parking Info</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded shadow text-sm">
              <h3 className="font-semibold text-gray-800 mb-2">Summary of Parking at Metro Stations</h3>
              {renderEntries(miscData[0])}
              {renderEntries(miscData[3])}
            </div>

            <div className="bg-white p-4 rounded shadow text-sm">
              <h3 className="font-semibold text-gray-800 mb-2">Line-wise & Allotment Info</h3>
              {renderEntries(miscData[1])}
              {renderEntries(miscData[2])}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, onClick, clickable }) {
  return (
    <div
      className={`bg-white shadow-lg rounded-xl p-6 text-center border-l-4 border-blue-500 ${clickable ? 'cursor-pointer hover:shadow-xl' : ''}`}
      onClick={onClick}
    >
      <div className="text-sm text-gray-600 mb-2 font-semibold">{label}</div>
      <div className="text-2xl font-bold text-blue-700">{value}</div>
    </div>
  );
}
