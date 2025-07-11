// src/pages/SmartDashboard.js
import { useEffect, useState } from 'react';

export default function SmartDashboard() {
  const [data, setData] = useState([]);
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

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Smart Parking Summary</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Smart Parking Sites" value={smartSites.length} />
        <StatCard label="Integrated with DMRC App" value={integratedSites.length} />
        <StatCard label="Pending Integration" value={pendingSites.length} />
        <StatCard label="Total Entries in Sheet" value={data.length} />
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 text-center border-l-4 border-blue-500">
      <div className="text-sm text-gray-600 mb-2 font-semibold">{label}</div>
      <div className="text-2xl font-bold text-blue-700">{value}</div>
    </div>
  );
}
