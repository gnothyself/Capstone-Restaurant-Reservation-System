import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import useQuery from "../utils/useQuery";
import { listReservations, listTables } from "../utils/api";
import { today, previous, next } from "../utils/date-time";
import formatDisplayDate from "../utils/format-display-date";
import ErrorAlert from "../layout/ErrorAlert";
import Reservation from "../reservations/Reservation";
import Table from "../tables/Table"; 

function Dashboard({ date }) {
  const history = useHistory();
  const query = useQuery();
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tables, setTables] = useState([]);

  const dateInUrl = useQuery().get("date");
  if (dateInUrl) {
    date = dateInUrl;
  }

  useEffect(() => {
    if (!dateInUrl) history.push(`/dashboard?date=${date}`);
  }, [query, history, dateInUrl, date]);

  useEffect(loadDashboard, [date, history, dateInUrl]);

  useEffect(() => {
    const abortController = new AbortController();
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
  }, [tables, date]);


  function loadDashboard() {
    if (dateInUrl !== date) {
      history.push(`/dashboard?date=${date}`);
    }
    const abortController = new AbortController();
    const abortController2 = new AbortController();
    setReservationsError(null);
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch((err)=> {
        setReservationsError(new Error(err))
      });
    listTables(abortController2.signal).then(setTables);
    return () => abortController.abort();
  }

  function DateNavigation() {
    return (
      <>
        <Link to={`/dashboard?date=${previous(date)}`}>
          <button type="button">Previous</button>
        </Link>
        <Link to={`/dashboard?date=${today()}`}>
          <button type="button">Today</button>
        </Link>
        <Link to={`/dashboard?date=${next(date)}`}>
          <button type="button">Next</button>
        </Link>
      </>
    );
  }
  
  const displayDate = formatDisplayDate(date, "long");

  return (
    <main>
      <h1>Dashboard</h1>
      <h4>{displayDate}</h4>
      <DateNavigation />
      <div className="d-md-flex mb-3"></div>
      {reservationsError ? <ErrorAlert error={reservationsError} /> : null}
      <div className="row">
        <div className="col-md-6 col-sm-12">
          <h4>Reservations for date: {date}</h4>
          {reservations.map((reservation) =>
            reservation.status === "finished" ||
            reservation.status === "cancelled" ? null : (
              <div key={reservation.reservation_id}>
              <Reservation
                data={reservation}
                setReservations={setReservations}
                date={date}
              />
              </div>
            )
          )}
        </div>
        <div className="col-md-6 col-sm-12">
          <h4>Tables</h4>
          {tables.map((table) => (
            <div key={table.table_id}>
            <Table data={table} setTables={setTables}/>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
