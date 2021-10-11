import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useQuery from "../utils/useQuery";
import { listReservations } from "../utils/api";
import { today, previous, next } from "../utils/date-time";
import formatDisplayDate from "../utils/format-display-date";
import ErrorAlert from "../layout/ErrorAlert";
import Reservations from "../reservations/Reservations";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {

  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);

  const dateInUrl = useQuery().get("date");
  if (dateInUrl) {
    date = dateInUrl;
  }

  // useEffect(() => {
  //   fetch(`http://localhost:5000/reservations`)
  //     .then((response) => response.json())
  //     .then(setReservations)
  //     .catch((error) => {
  //       console.log(error)
  //     });
  // }, []);

  useEffect(loadReservations, [date]);

  function loadReservations() {
    const abortController = new AbortController();
    setReservationsError(null);

    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);

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
      {/* <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for date</h4>
      </div> */}
      <ErrorAlert error={reservationsError} />
      {/* {JSON.stringify(reservations)} */}
      <div className="d-md-flex mb-3">
        <div className="mb-3"> 
          <div className="headingBar my-3 p-2">
            <h2>Reservations</h2>
          </div>
          <Reservations reservations={reservations} />
        </div> 
      </div>
    </main>
  );
}

export default Dashboard;
