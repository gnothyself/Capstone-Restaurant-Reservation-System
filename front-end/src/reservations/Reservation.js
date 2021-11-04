import React from "react";
import { listReservations, updateStatus } from "../utils/api";


export default function Reservation({ data, setReservations, date, index }) {

    function cancelHandler() {
        if (
          window.confirm(
            "Do you want to cancel this reservation? This cannot be undone."
          )
        ) {
          const abortController = new AbortController();
          updateStatus(data.reservation_id, "cancelled")
            .then((result) => {
              listReservations({ date }, abortController.signal).then(
                setReservations
              );
            })
            .catch((err) => {});
        }
      }
     
    return (
        <div className="card">
        <div className="card-body">
            <h5 className="card-title">
            Reservation for: {`${data.first_name} ${data.last_name}`}{" "}
            </h5>
            <p className="card-text">Phone Number: {data.mobile_number}</p>
            <p className="card-text">Time: {data.reservation_time}</p>
            <p className="card-text">Party Size: {data.people}</p>
            <p data-reservation-id-status={data.reservation_id}>
            Status:{" "}
            <span
                className={
                data.status === "booked"
                    ? "card-text text-primary"
                    : "card-text text-success"
                }
            >
                {data.status}
            </span>
            </p>
            {data.status === "booked" ? (
            <div>
                <a
                href={`/reservations/${data.reservation_id}/seat`}
                className="btn btn-primary mr-1"
                >
                Seat
                </a>
                <a
                href={`/reservations/${data.reservation_id}/edit`}
                className="btn btn-secondary mr-1"
                >
                {" "}
                Edit
                </a>
                <button
                onClick={cancelHandler}
                className="btn btn-danger "
                data-reservation-id-cancel={data.reservation_id}
                >
                Cancel
                </button>
            </div>
            ) : null}
        </div>
        </div>
    );
}