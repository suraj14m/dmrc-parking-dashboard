import { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export default function ParkingUpdatesPage() {
  const [data, setData] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetch(
      'https://opensheet.elk.sh/1AB21wjJIu5vK69A6OlnJ9I8M5XBbOib7PsO2axvOiu0/Parking updates 18.06.2025'
    )
      .then((res) => res.json())
      .then((rows) => {
        if (!rows || rows.length === 0) return;
        setData(rows);
      })
      .catch((err) => console.error('Error fetching:', err));
  }, []);

  const groupedByStation = data.reduce((acc, row) => {
    const station = row['Station']?.trim() || 'Unknown';
    if (!acc[station]) acc[station] = [];
    acc[station].push(row);
    return acc;
  }, {});

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Parking Updates');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(file, 'parking-updates.xlsx');
  };

  const getBadgeColor = (status) => {
    if (!status) return 'bg-gray-400';
    const s = status.toLowerCase();
    if (s.includes('done')) return 'bg-green-500';
    if (s.includes('pending')) return 'bg-red-500';
    if (s.includes('in progress')) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  // Normalizing key like "Valid Upto:" → "Valid Upto"
  const cleanKey = (key) => key?.replace(/:$/, '').trim();

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Parking Updates</h2>
        <button
          onClick={exportExcel}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
        >
          Export to Excel
        </button>
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
                    {Object.entries(row).map(([key, value]) => (
                      <div key={key} className="flex gap-1">
                        <span className="font-medium">{cleanKey(key)}:</span>
                        <span
                          className={`px-2 rounded ${
                            cleanKey(key).toLowerCase() === 'status'
                              ? `text-white ${getBadgeColor(value)}`
                              : ''
                          }`}
                        >
                          {value}
                        </span>
                      </div>
                    ))}
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