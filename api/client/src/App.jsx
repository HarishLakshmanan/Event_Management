import React, { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function App() {
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({ q: "", from: "", to: "", status: "" });
  const [sort, setSort] = useState("date:asc");
  const [page] = useState(1);
  const [form, setForm] = useState({ title: "", date: "", capacity: 1, location: "" });
  const [selected, setSelected] = useState(null);
  const [reg, setReg] = useState({ name: "", email: "" });
  const [stats, setStats] = useState(null);

  const load = async () => {
    try {
      const params = { ...filters, sort, page };
      const res = await axios.get(API, { params });
      setEvents(res.data.items || []);
    } catch (e) {
      console.error(e);
      alert("Failed to load events");
    }
  };

  useEffect(() => {
    load();
  }, [filters, sort, page]);

  const createEvent = async () => {
    try {
      await axios.post(API, form);
      setForm({ title: "", date: "", capacity: 1, location: "" });
      await load();
      alert("Event created successfully!");
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  const registerAttendee = async (eventId) => {
    try {
      await axios.post(`${API}/${eventId}/register`, reg);
      setReg({ name: "", email: "" });
      await loadStats(eventId);
      alert("Registered successfully!");
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  const cancel = async (id) => {
    try {
      await axios.post(`${API}/${id}/cancel`);
      await load();
      if (selected && selected._id === id) {
        setSelected(null);
        setStats(null);
      }
      alert("Event cancelled");
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  const loadStats = async (id) => {
    try {
      const res = await axios.get(`${API}/${id}/stats`);
      setStats(res.data);
    } catch (e) {
      console.error(e);
      setStats(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-purple-700 drop-shadow">
           Event Registration Portal
        </h1>

        {/* CREATE */}
        <div className="mb-6 p-6 bg-white shadow-lg rounded-xl border border-purple-200">
          <h2 className="font-semibold text-lg mb-4 text-purple-600">Create Event</h2>
          <div className="flex flex-wrap gap-3">
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Title" className="border p-2 rounded-lg w-full sm:w-auto flex-1" />
            <input type="datetime-local" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
              className="border p-2 rounded-lg" />
            <input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: parseInt(e.target.value || 1) })}
              className="border p-2 rounded-lg w-28" />
            <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
              placeholder="Location" className="border p-2 rounded-lg w-full sm:w-auto flex-1" />
            <button onClick={createEvent}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow">
              Create
            </button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="mb-6 p-4 bg-white shadow rounded-lg border border-purple-200 flex flex-wrap justify-between gap-3">
          <input placeholder="Search title" value={filters.q} onChange={e => setFilters({ ...filters, q: e.target.value })}
            className="border p-2 rounded-lg" />
          <input type="date" value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value })}
            className="border p-2 rounded-lg" />
            <span className="mt-2">to</span>
          <input type="date" value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value })}
            className="border p-2 rounded-lg" />
          <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}
            className="border p-2 rounded-lg">
            <option value="">All</option>
            <option value="scheduled">Scheduled</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="border p-2 rounded-lg">
            <option value="date:asc">Date ↑</option>
            <option value="date:desc">Date ↓</option>
            <option value="capacity:asc">Capacity low-high</option>
            <option value="capacity:desc">Capacity high-low</option>
          </select>
        </div>

        {/* LIST */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map(ev => (
            <div key={ev._id} className="bg-white p-4 rounded-xl shadow-lg border border-purple-200 flex flex-col justify-between">
              <div>
                <div className="font-semibold text-lg text-purple-700">
                  {ev.title} {ev.status === 'cancelled' && <span className="text-red-500 text-sm"> (Cancelled)</span>}
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(ev.date).toLocaleString()} • {ev.location} • capacity {ev.capacity}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg"
                  onClick={() => { setSelected(ev); loadStats(ev._id); }}>
                  View
                </button>
                {ev.status !== 'cancelled' && (
                  <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
                    onClick={() => cancel(ev._id)}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* DETAILS */}
        {selected && (
          <div className="mt-8 p-6 bg-white shadow-lg rounded-xl border border-purple-200">
            <h3 className="font-bold text-xl text-purple-700">{selected.title}</h3>
            <p className="text-sm text-gray-600">{new Date(selected.date).toLocaleString()} • {selected.location}</p>

            <div className="mt-4">
              <h4 className="font-semibold text-purple-600">Register</h4>
              {selected.status === 'cancelled' ? (
                <p className="text-red-600">Event cancelled — registrations blocked</p>
              ) : (
                <div className="flex flex-wrap gap-2 mt-2">
                  <input className="border p-2 rounded-lg flex-1" placeholder="Name" value={reg.name}
                    onChange={e => setReg({ ...reg, name: e.target.value })} />
                  <input className="border p-2 rounded-lg flex-1" placeholder="Email" value={reg.email}
                    onChange={e => setReg({ ...reg, email: e.target.value })} />
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                    onClick={() => registerAttendee(selected._id)}>
                    Register
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6">
              <h4 className="font-semibold text-purple-600">Statistics</h4>
              {stats ? (
                <div className="mt-2">
                  <p>Registrations: <span className="font-bold">{stats.registrationsCount}</span></p>
                  <p>Remaining seats: <span className="font-bold">{stats.remainingSeats}</span></p>
                  <div className="mt-2">
                    <strong className="text-sm">Registrants</strong>
                    <ul className="text-sm list-disc list-inside">
                      {stats.registrants.map(r => (
                        <li key={r._id}>{r.name} — {r.email}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Loading...</p>
              )}
            </div>

            <div className="mt-4 text-right">
              <button className="text-sm text-gray-500 hover:text-gray-700"
                onClick={() => { setSelected(null); setStats(null); }}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
