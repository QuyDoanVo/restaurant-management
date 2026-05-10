import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,

  PieChart,
  Pie,
  Cell
} from "recharts";

function Dashboard() {

  const [data, setData] = useState(null);

  // ======================
  // FETCH
  // ======================
  const fetchDashboard = async () => {

    const res = await axios.get(
      "http://localhost:5000/dashboard"
    );

    setData(res.data);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (!data) return <h2>Loading...</h2>;

  return (
    <div>

      <h1 style={{ marginBottom: 20 }}>
        📊 Dashboard
      </h1>

      {/* CARDS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
        gap: 20,
        marginBottom: 30
      }}>

        <Card
          title="Revenue"
          value={`${data.totalRevenue} VND`}
        />

        <Card
          title="Orders"
          value={data.totalOrders}
        />

        <Card
          title="Occupied Tables"
          value={data.occupiedTables}
        />

        <Card
          title="Reservations Today"
          value={data.reservationsToday}
        />

        <Card
          title="Pending Orders"
          value={data.pendingOrders}
        />

      </div>

      {/* REVENUE CHART */}
      <div style={{
        background: "white",
        padding: 20,
        borderRadius: 12,
        marginBottom: 30
      }}>

        <h2>Revenue Last 7 Days</h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.revenueChart}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" />
          </BarChart>
        </ResponsiveContainer>

      </div>

      {/* STATUS CHART */}
      <div style={{
        background: "white",
        padding: 20,
        borderRadius: 12
      }}>

        <h2>Order Status</h2>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>

            <Pie
              data={data.statusChart}
              dataKey="count"
              nameKey="status"
              outerRadius={100}
              label
            >
              {data.statusChart.map((entry, index) => (
                <Cell key={index} />
              ))}
            </Pie>

            <Tooltip />

          </PieChart>
        </ResponsiveContainer>

      </div>

    </div>
  );
}

// ======================
// CARD COMPONENT
// ======================
function Card({ title, value }) {

  return (
    <div style={{
      background: "white",
      padding: 20,
      borderRadius: 12,
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    }}>
      <h3>{title}</h3>

      <h1>{value}</h1>
    </div>
  );
}

export default Dashboard;