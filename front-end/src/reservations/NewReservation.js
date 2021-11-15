import React from "react";
import ReservationForm from "./ReservationForm";

function NewReservation() {
  return (
    <section>
      <div className="d-md-flex mb-3">
        <h1 className="mb-0 text-center">New Reservation</h1>
      </div>
      <ReservationForm method={"POST"} />
    </section>
  );
}

export default NewReservation;