// src/pages/ParkingUpdatesPage.js
import { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export default function ParkingUpdatesPage() {
  const [data, setData] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [filters, setFilters] = useState({ station: '', line: '', contractor: '', type: '' });

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

  const filteredData = data.filter((row) => {
    const typeKey = Object.keys(row).find((k) => k.toLowerCase().includes('type of parking'));
    return (
      (!filters.station || row['Station']?.toLowerCase().includes(filters.station.toLowerCase())) &&
      (!filters.line || row['LINE']?.toLowerCase() === filters.line.toLowerCase()) &&
      (!filters.contractor || row['Name of Parking Agency']?.toLowerCase().includes(filters.contractor.toLowerCase())) &&
      (!filters.type || (typeKey && row[typeKey]?.toLowerCase().includes(filters.type.toLowerCase())))
    );
  });

  const groupedByStation = filteredData.reduce((acc, row) => {
    const station = row['Station']?.trim() || 'Unknown';
    if (!acc[station]) acc[station] = [];
    acc[station].push(row);
    return acc;
  }, {});

  const smartCount = data.filter((row) => {
    const typeKey = Object.keys(row).find((k) => k.toLowerCase().includes('type of parking'));
    return typeKey && row[typeKey]?.toLowerCase().includes('smart');
  }).length;

  const conventionalCount = data.filter((row) => {
    const typeKey = Object.keys(row).find((k) => k.toLowerCase().includes('type of parking'));
    return typeKey && row[typeKey]?.toLowerCase().includes('conventional');
  }).length;

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Parking Updates');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(file, 'parking-updates.xlsx');
  };

  const handleOpenContractorWindow = () => {
    if (!data || data.length === 0) {
      alert("Parking data not loaded.");
      return;
    }

    const contractorWindow = window.open('', '_blank', 'width=1000,height=700');
    if (!contractorWindow) return;

    const contractorMap = {};

    data.forEach((row) => {
      const contractor = row['Name of Parking Agency']?.trim() || 'Unknown Contractor';
      const contract = row['Parking Contract No.']?.trim() || 'Unknown Contract';

      if (!contractorMap[contractor]) contractorMap[contractor] = {};
      if (!contractorMap[contractor][contract]) {
        contractorMap[contractor][contract] = { stations: [], totalArea: 0 };
      }

      const station = row['Station']?.trim() || 'Unnamed Station';
      const rawArea = (row['Super Area'] || '').toString().replace(/,/g, '').trim();
      const area = !isNaN(rawArea) && rawArea !== '' ? parseFloat(rawArea) : 0;

      contractorMap[contractor][contract].stations.push(station);
      contractorMap[contractor][contract].totalArea += area;
    });

    const htmlContent = `
      <html>
        <head>
          <title>Contractor-wise Parking Sites</title>
          <style>
            body {
              font-family: sans-serif;
              padding: 20px;
              background-color: #f8fafc;
              color: #1e293b;
            }
            h1 {
              text-align: center;
              margin-bottom: 30px;
              color: #1e40af;
            }
            .contractor {
              margin-bottom: 30px;
            }
            .contractor h2 {
              color: #0f172a;
              font-size: 22px;
              margin-bottom: 8px;
            }
            .contract-section {
              margin-left: 20px;
              margin-bottom: 16px;
            }
            .contract-title {
              font-weight: 600;
              margin-bottom: 4px;
            }
            ul {
              margin-left: 20px;
              list-style-type: disc;
            }
          </style>
        </head>
        <body>
          <h1>Contractor-wise Parking Summary</h1>
          ${Object.entries(contractorMap).map(([contractor, contracts]) => {
            const contractEntries = Object.entries(contracts);
            const totalSites = contractEntries.reduce((acc, [_, details]) => acc + new Set(details.stations).size, 0);
            return `
              <div class="contractor">
                <h2>${contractor}</h2>
                <div><strong>Total Contracts:</strong> ${contractEntries.length} | <strong>Total Sites:</strong> ${totalSites}</div>
                ${contractEntries.map(([contractNo, details], i) => {
                  const stationList = [...new Set(details.stations)].sort();
                  const siteCount = stationList.length;
                  const totalArea = details.totalArea.toFixed(2);
                  return `
                    <div class="contract-section">
                      <div class="contract-title">${i + 1}. ${contractNo} (${siteCount} site${siteCount > 1 ? 's' : ''} | ${totalArea} sqm)</div>
                      <ul>
                        ${stationList.map(station => `<li>${station}</li>`).join('')}
                      </ul>
                    </div>
                  `;
                }).join('')}
              </div>
            `;
          }).join('')}
        </body>
      </html>
    `;

    contractorWindow.document.write(htmlContent);
    contractorWindow.document.close();
  };

  const getBadgeColor = (status) => {
    if (!status) return 'bg-gray-400';
    const s = status.toLowerCase();
    if (s.includes('done')) return 'bg-green-500';
    if (s.includes('pending')) return 'bg-red-500';
    if (s.includes('in progress')) return 'bg-yellow-500';
    return 'bg-blue-400';
  };

  const cleanKey = (key) => key?.replace(/:$/, '').trim();

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Parking Updates</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={exportExcel} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Export to Excel</button>
          <button onClick={handleOpenContractorWindow} className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700">Contractor-wise Sites</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-sm text-gray-500">Total Sites</div>
          <div className="text-xl font-bold">{data.length}</div>
        </div>
        <div className="bg-green-100 p-4 rounded shadow text-center">
          <div className="text-sm text-gray-600">Smart</div>
          <div className="text-xl font-bold text-green-700">{smartCount}</div>
        </div>
        <div className="bg-yellow-100 p-4 rounded shadow text-center">
          <div className="text-sm text-gray-600">Conventional</div>
          <div className="text-xl font-bold text-yellow-700">{conventionalCount}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <input type="text" placeholder="Filter by Station" className="border px-2 py-1 rounded" value={filters.station} onChange={(e) => setFilters({ ...filters, station: e.target.value })} />
        <input type="text" placeholder="Filter by Line" className="border px-2 py-1 rounded" value={filters.line} onChange={(e) => setFilters({ ...filters, line: e.target.value })} />
        <input type="text" placeholder="Filter by Contractor" className="border px-2 py-1 rounded" value={filters.contractor} onChange={(e) => setFilters({ ...filters, contractor: e.target.value })} />
        <input type="text" placeholder="Filter by Type (smart/conventional)" className="border px-2 py-1 rounded" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} />
      </div>

      {Object.entries(groupedByStation).map(([station, entries]) => (
        <div key={station} className="mb-6 border border-blue-200 rounded shadow">
          <button onClick={() => setExpanded(expanded === station ? null : station)} className="w-full text-left px-4 py-3 bg-blue-100 hover:bg-blue-200 font-semibold text-blue-900">
            {station} ({entries.length} item{entries.length > 1 ? 's' : ''})
          </button>
          {expanded === station && (
            <div className="p-4 space-y-3 bg-white">
              {entries.map((row, idx) => (
                <div key={idx} className="p-4 border rounded bg-gradient-to-br from-white to-blue-50 shadow-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                    {Object.entries(row).map(([key, value]) => (
                      <div key={key} className="flex gap-1">
                        <span className="font-medium text-gray-700">{cleanKey(key)}:</span>
                        {/https?:\/\//i.test(value) ? (
                          <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">View Link</a>
                        ) : (
                          <span className={`px-2 py-0.5 rounded font-semibold ${cleanKey(key).toLowerCase() === 'status' ? `text-white ${getBadgeColor(value)}` : 'text-gray-800 bg-gray-100'}`}>{value || '—'}</span>
                        )}
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
