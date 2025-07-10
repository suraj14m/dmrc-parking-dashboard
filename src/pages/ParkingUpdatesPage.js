// src/pages/ParkingUpdatesPage.js
import { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export default function ParkingUpdatesPage() {
  const [data, setData] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [sortKey, setSortKey] = useState('Station');

  useEffect(() => {
    fetch(
      'https://opensheet.elk.sh/1AB21wjJIu5vK69A6OlnJ9I8M5XBbOib7PsO2axvOiu0/Parking updates 18.06.2025'
    )
      .then((res) => res.json())
      .then((rows) => {
        if (!rows || rows.length === 0) return;

        const cleaned = rows.map((r) => {
          const type = r['Type of parking']?.trim().toLowerCase();
          return {
            ...r,
            'Type Of Parking': type,
            Station: r['Station']?.trim() || '',
          };
        });

        setData(cleaned);
      })
      .catch((err) => console.error('Error fetching:', err));
  }, []);

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Parking Updates');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(file, 'parking-updates.xlsx');
  };

  const getTypeBadge = (type) => {
    if (!type) return 'bg-gray-300';
    return type.includes('smart')
      ? 'bg-indigo-500 text-white'
      : 'bg-yellow-500 text-black';
  };

  const cleanKey = (key) => key?.replace(/:$/, '').trim();

  const filteredData = data.filter((row) => {
    const matchesSearch = row['Station'].toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'All') return matchesSearch;
    if (filter === 'SMART' && row['Type Of Parking'] === 'smart') return matchesSearch;
    if (filter === 'Conventional' && row['Type Of Parking'] === 'conventional') return matchesSearch;
    return false;
  });

  const groupedByStation = filteredData
    .sort((a, b) => {
      const valA = a[sortKey]?.toLowerCase() || '';
      const valB = b[sortKey]?.toLowerCase() || '';
      return valA.localeCompare(valB);
    })
    .reduce((acc, row) => {
      const station = row['Station']?.trim();
      if (!station) return acc;
      if (!acc[station]) acc[station] = [];
      acc[station].push(row);
      return acc;
    }, {});

  const smartSites = data.filter((r) => r['Type Of Parking'] === 'smart').length;
  const conventionalSites = data.filter((r) => r['Type Of Parking'] === 'conventional').length;
  const totalSites = data.length;

  return (
    <div className="p-4">
      <div className="mb-4 p-4 bg-gray-100 rounded shadow-sm grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <div className="font-bold">Total Sites: <span className="font-normal">{totalSites}</span></div>
        <div className="font-bold text-indigo-700">Smart: <span className="font-normal">{smartSites}</span></div>
        <div className="font-bold text-yellow-700">Conventional: <span className="font-normal">{conventionalSites}</span></div>
      </div>

      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <h2 className="text-xl font-bold">Parking Updates</h2>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search station..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-2 py-1 rounded"
          />
          <select
            className="border px-2 py-1 rounded"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="SMART">Smart Parking</option>
            <option value="Conventional">Conventional</option>
          </select>
          <select
            className="border px-2 py-1 rounded"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
          >
            <option value="Station">Sort by Station</option>
            <option value="LINE">Sort by Line</option>
            <option value="Name Of Parking Agency">Sort by Contractor</option>
          </select>
          <button
            onClick={exportExcel}
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
          >
            Export to Excel
          </button>
        </div>
      </div>

      {Object.entries(groupedByStation).map(([station, entries]) => (
        <div key={station} className="mb-4 border rounded">
          <button
            onClick={() => setExpanded(expanded === station ? null : station)}
            className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 font-semibold"
          >
            {station} ({entries.length} item{entries.length > 1 ? 's' : ''})
          </button>
          {expanded === station && (
            <div className="p-4 space-y-2">
              {entries.map((row, idx) => (
                <div key={idx} className="p-2 border rounded bg-white shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                    {Object.entries(row).map(([key, value]) => {
                      const displayKey = cleanKey(key);
                      if (displayKey.toLowerCase() === 'type of parking') {
                        return (
                          <div key={key} className="flex gap-1">
                            <span className="font-medium">{displayKey}:</span>
                            <span className={`break-words ${getTypeBadge(value)}`}>{value}</span>
                          </div>
                        );
                      }
                      return (
                        <div key={key} className="flex gap-1">
                          <span className="font-medium">{displayKey}:</span>
                          <span className="break-words">{value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}