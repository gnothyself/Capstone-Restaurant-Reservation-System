import React from "react";
import ReservationForm from "./ReservationForm";


export default function NewReservation() {
  return (
    <section>
      <div className="d-md-flex mb-3">
        <h1 className="mb-0">Make a Reservation</h1>
      </div>
      <ReservationForm />
    </section>
  );
}

