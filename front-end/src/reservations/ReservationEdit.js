import React from "react";
import ReservationForm from "./ReservationForm";

function ReservationEdit() {
  return (
    <section>
      <div className="d-md-flex mb-3 text-center">
        <h1 className="mb-0">Edit Reservation</h1>
      </div>
      <ReservationForm method={"PUT"} />
    </section>
  );
}

export default ReservationEdit;