import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { today, formatAsTime } from "../utils/date-time";
import { postReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";


function ReservationForm() {
  const [reservationsError, setReservationsError] = useState(null);
  const history = useHistory();

  const initialFormState = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: today(),
    reservation_time: formatAsTime(new Date().toString()),
    people: 1,
  };

  const [formData, setFormData] = useState({ ...initialFormState });

  const handleChange = ({ target }) => {
    let value = target.value;

    // Fixes issue of *people* changing into a string
    if (target.name === "people" && typeof value === "string") {
      value = +value;
    }

    setFormData({
      ...formData,
      [target.name]: value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const abortController = new AbortController();
    setReservationsError(null);

    postReservation(formData, abortController.signal)
      .then(() => history.push(`/dashboard?date=${formData.reservation_date}`))
      .catch(setReservationsError);
    return () => abortController.abort();
  };

  const handleCancel = (event) => {
    event.preventDefault();
    history.goBack();
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label htmlFor="first_name">
          First Name:
          <input
            id="first_name"
            type="text"
            name="first_name"
            onChange={handleChange}
            value={formData.first_name}
            required={true}
          />
        </label>
        <br />
        <label htmlFor="last_name">
          Last Name:
          <input
            id="last_name"
            type="text"
            name="last_name"
            onChange={handleChange}
            value={formData.last_name}
            required={true}
          />
        </label>
        <br />
        <label htmlFor="mobile_number">
          Mobile Number:
          <input
            id="mobile_number"
            type="text"
            name="mobile_number"
            onChange={handleChange}
            value={formData.mobile_number}
            required={true}
          />
        </label>
        <br />
        <label htmlFor="reservation_date">
          Reservation Date:
          <input
            id="reservation_date"
            type="date"
            name="reservation_date"
            onChange={handleChange}
            value={formData.reservation_date}
            required={true}
          />
        </label>
        <br />
        <label htmlFor="reservation_time">
          Reservation Time:
          <input
            id="reservation_time"
            type="time"
            name="reservation_time"
            onChange={handleChange}
            value={formData.reservation_time}
            required={true}
          />
        </label>
        <br />
        <label htmlFor="people">
          Party Size:
          <input
            id="people"
            type="number"
            name="people"
            onChange={handleChange}
            required={true}
            min="1"
            value={formData.people}
          />
        </label>
        <br />
        <button type="submit">Submit</button>
        <button type="button" value="Cancel" onClick={handleCancel}>
          Cancel
        </button>
      </form>
      <ErrorAlert error={reservationsError} />
    </>
  );
}

export default ReservationForm;