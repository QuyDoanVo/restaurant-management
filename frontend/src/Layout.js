import { Link } from "react-router-dom";

function Layout({ children }) {
  return (
    <div style={{ display: "flex", height: "100vh" }}>

      {/* SIDEBAR */}
      <div style={{
        width: 220,
        background: "#1e293b",
        color: "white",
        padding: 20
      }}>
        <h2>🍽 Restaurant</h2>

        <div style={{ marginTop: 20 }}>
          <p><Link to="/create-order" style={{ color: "white" }}>🧾 Create Order</Link></p>
          <p><Link to="/orders" style={{ color: "white" }}>📋 Orders</Link></p>
          <p><Link to="/kitchen" style={{ color: "white" }}>🍳 Kitchen</Link></p>
          <p><Link to="/tables" style={{ color: "white" }}>🪑 Tables</Link></p>
          <p><Link to="/reservation" style={{ color: "white" }}>📅 Reservation</Link></p>
          <p><Link to="/reservation-list" style={{ color: "white" }}>📖 Reservations</Link></p>
          <p>
            <Link
              to="/dashboard"
              style={{ color: "white" }}
            >
              📊 Dashboard
            </Link>
          </p>
        </div>
      </div>

      {/* MAIN */}
      <div style={{
        flex: 1,
        padding: 20,
        background: "#f1f5f9"
      }}>
        {children}
      </div>
    </div>


  );
}

export default Layout;