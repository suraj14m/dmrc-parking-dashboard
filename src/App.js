import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, ListOrdered } from 'lucide-react';

import SiteListPage from './pages/SiteListPage';
import UpdatesPage from './pages/ParkingUpdatesPage';

const navClasses = ({ isActive }) =>
  `flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium
   ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'}`;

export default function App() {
  return (
    <Router>
      <nav className="flex items-center justify-between px-4 py-3 bg-gray-100 shadow-sm">
        <NavLink to="/" className="flex items-center gap-3">
          <img
            src="/dmrc-logo.png"
            alt="DMRC logo"
            className="h-10 w-auto"
            loading="lazy"
          />
          <span className="text-lg font-bold whitespace-nowrap">
            DMRC Parking Dashboard
          </span>
        </NavLink>

        <div className="flex gap-2">
          <NavLink to="/sites" className={navClasses}>
            <ListOrdered className="w-4 h-4" /> Sites
          </NavLink>
          <NavLink to="/updates" className={navClasses}>
            <LayoutDashboard className="w-4 h-4" /> Updates
          </NavLink>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<SiteListPage />} />
        <Route path="/sites" element={<SiteListPage />} />
        <Route path="/updates" element={<UpdatesPage />} />
        <Route path="*" element={<p className="p-8 text-center">404 – page not found</p>} />
      </Routes>
    </Router>
  );
}