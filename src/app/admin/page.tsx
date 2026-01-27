"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { redirect } from "next/navigation";

export default function AdminIndex() {
  redirect("/admin/login");
}

type Stats = {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
  todayCheckIns: number;
  todayCheckOuts: number;
};

type RecentBooking = {
  id: string;
  customer_name: string;
  check_in: string;
  check_out: string;
  status: string;
  total_amount: number;
  created_at: string;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    totalRevenue: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);

    // Fetch all bookings
    const { data: bookings } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (bookings) {
      const today = new Date().toISOString().split("T")[0];

      setStats({
        totalBookings: bookings.length,
        pendingBookings: bookings.filter((b) => b.status === "pending").length,
        confirmedBookings: bookings.filter((b) => b.status === "confirmed")
          .length,
        totalRevenue: bookings
          .filter((b) => b.status === "confirmed")
          .reduce((sum, b) => sum + (b.total_amount || 0), 0),
        todayCheckIns: bookings.filter((b) => b.check_in === today).length,
        todayCheckOuts: bookings.filter((b) => b.check_out === today).length,
      });

      setRecentBookings(bookings.slice(0, 5));
    }

    setLoading(false);
  }

  const statCards = [
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      icon: "📊",
      color: "blue",
    },
    {
      title: "Pending",
      value: stats.pendingBookings,
      icon: "⏳",
      color: "yellow",
    },
    {
      title: "Confirmed",
      value: stats.confirmedBookings,
      icon: "✅",
      color: "green",
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: "💰",
      color: "orange",
    },
    {
      title: "Check-ins Today",
      value: stats.todayCheckIns,
      icon: "🔑",
      color: "purple",
    },
    {
      title: "Check-outs Today",
      value: stats.todayCheckOuts,
      icon: "🚪",
      color: "pink",
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="stats-grid">
            {statCards.map((stat, idx) => (
              <div
                key={idx}
                className={`stat-card ${stat.color}`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-content">
                  <p className="stat-title">{stat.title}</p>
                  <h2 className="stat-value">{stat.value}</h2>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Bookings */}
          <div className="section">
            <div className="section-header">
              <h2>Recent Bookings</h2>
              <a href="/admin/bookings" className="view-all-btn">
                View All →
              </a>
            </div>

            <div className="bookings-table">
              {recentBookings.length === 0 ? (
                <div className="empty-state">
                  <p>No bookings yet</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Guest Name</th>
                      <th>Check-in</th>
                      <th>Check-out</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Booked On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>{booking.customer_name}</td>
                        <td>{booking.check_in}</td>
                        <td>{booking.check_out}</td>
                        <td>₹{booking.total_amount}</td>
                        <td>
                          <span className={`status-badge ${booking.status}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td>
                          {new Date(booking.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="section">
            <h2>Quick Actions</h2>
            <div className="quick-actions">
              <a href="/admin/rooms" className="action-card">
                <span className="action-icon">🏨</span>
                <h3>Manage Rooms</h3>
                <p>Add, edit, or delete rooms</p>
              </a>

              <a href="/admin/bookings" className="action-card">
                <span className="action-icon">📅</span>
                <h3>View Bookings</h3>
                <p>Check and manage bookings</p>
              </a>

              <a href="/admin/block-dates" className="action-card">
                <span className="action-icon">🚫</span>
                <h3>Block Dates</h3>
                <p>Set unavailable dates</p>
              </a>

              <a href="/admin/content" className="action-card">
                <span className="action-icon">📝</span>
                <h3>Edit Content</h3>
                <p>Update website content</p>
              </a>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .dashboard {
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          margin-bottom: 2rem;
        }

        .dashboard-header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #fff, #f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .dashboard-header p {
          color: #94a3b8;
          font-size: 1.1rem;
        }

        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 1rem;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(249, 115, 22, 0.2);
          border-top-color: #f97316;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .loading p {
          color: #94a3b8;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          transition: all 0.3s;
          animation: slideUp 0.6s ease-out both;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .stat-card.blue {
          border-color: rgba(59, 130, 246, 0.4);
        }
        .stat-card.yellow {
          border-color: rgba(234, 179, 8, 0.4);
        }
        .stat-card.green {
          border-color: rgba(34, 197, 94, 0.4);
        }
        .stat-card.orange {
          border-color: rgba(249, 115, 22, 0.4);
        }
        .stat-card.purple {
          border-color: rgba(168, 85, 247, 0.4);
        }
        .stat-card.pink {
          border-color: rgba(236, 72, 153, 0.4);
        }

        .stat-icon {
          font-size: 3rem;
        }

        .stat-content {
          flex: 1;
        }

        .stat-title {
          color: #94a3b8;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: white;
          margin: 0;
        }

        .section {
          margin-bottom: 3rem;
        }

        .section h2 {
          font-size: 1.75rem;
          margin-bottom: 1.5rem;
          color: #f97316;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .view-all-btn {
          padding: 0.75rem 1.5rem;
          background: rgba(249, 115, 22, 0.1);
          border: 1px solid rgba(249, 115, 22, 0.3);
          border-radius: 8px;
          color: #f97316;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s;
        }

        .view-all-btn:hover {
          background: rgba(249, 115, 22, 0.2);
          transform: translateX(5px);
        }

        .bookings-table {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 16px;
          overflow: hidden;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead {
          background: rgba(249, 115, 22, 0.1);
        }

        th {
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #f97316;
          font-size: 0.9rem;
        }

        td {
          padding: 1rem;
          border-top: 1px solid rgba(249, 115, 22, 0.1);
          color: #cbd5e1;
        }

        tbody tr {
          transition: background 0.3s;
        }

        tbody tr:hover {
          background: rgba(249, 115, 22, 0.05);
        }

        .status-badge {
          padding: 0.375rem 0.75rem;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .status-badge.pending {
          background: rgba(234, 179, 8, 0.2);
          color: #fbbf24;
        }

        .status-badge.confirmed {
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
        }

        .status-badge.cancelled {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .empty-state {
          padding: 3rem;
          text-align: center;
          color: #94a3b8;
        }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .action-card {
          padding: 2rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 16px;
          text-decoration: none;
          transition: all 0.3s;
        }

        .action-card:hover {
          transform: translateY(-5px);
          border-color: #f97316;
          box-shadow: 0 10px 30px rgba(249, 115, 22, 0.3);
        }

        .action-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 1rem;
        }

        .action-card h3 {
          color: white;
          margin-bottom: 0.5rem;
          font-size: 1.25rem;
        }

        .action-card p {
          color: #94a3b8;
          margin: 0;
        }

        @media (max-width: 768px) {
          .dashboard-header h1 {
            font-size: 2rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .bookings-table {
            overflow-x: auto;
          }

          table {
            min-width: 800px;
          }
        }
      `}</style>
    </div>
  );
}
