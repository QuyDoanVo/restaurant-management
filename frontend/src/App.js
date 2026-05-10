import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Layout from "./Layout";

import Kitchen from "./Kitchen";
import CreateOrder from "./CreateOrder";
import WaiterOrders from "./WaiterOrders";
import Tables from "./Tables";
import Reservation from "./Reservation";
import ReservationList from "./ReservationList";
import Dashboard from "./Dashboard";

function App() {
  return (
    <Router>
      <Routes>

        <Route
          path="/"
          element={<Layout><CreateOrder /></Layout>}
        />

        <Route
          path="/create-order"
          element={
            <Layout>
              <CreateOrder />
            </Layout>
          }
        />

        <Route
          path="/orders"
          element={
            <Layout>
              <WaiterOrders />
            </Layout>
          }
        />

        <Route
          path="/kitchen"
          element={
            <Layout>
              <Kitchen />
            </Layout>
          }
        />

        <Route
          path="/tables"
          element={
            <Layout>
              <Tables />
            </Layout>
          }
        />

        <Route
          path="/reservation"
          element={
            <Layout>
              <Reservation />
            </Layout>
          }
        />

        <Route
          path="/reservation-list"
          element={
            <Layout>
              <ReservationList />
            </Layout>
          }
        />

        <Route
          path="/dashboard"
          element={<Layout><Dashboard /></Layout>}
        />
      </Routes>
    </Router>
  );
}

export default App;