import React, { useState, useEffect } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import { today, formatAsTime } from "../utils/date-time";
import { postReservation, updateReservation, getReservation, } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";


function ReservationForm() {
  const history = useHistory();
  const { params, url } = useRouteMatch();
  const [method, setMethod] = useState("POST");
  const [existingData, setExistingData] = useState({});
  const [error, setError] = useState(null);
  const initialFormState = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: today(),
    reservation_time: formatAsTime(new Date().toString()),
    people: 1,
  };
  const [formData, setFormData] = useState({...initialFormState});

  useEffect(() => {
    Object.keys(params).length ? setMethod("PUT") : setMethod("POST");
  }, [history, params, url]);

  useEffect(() => {
    if (method === "PUT") {
      const abortController = new AbortController();
      getReservation(params.reservation_id, abortController.signal)
        .then(setExistingData)
        .catch(setError);
    } else {
      setExistingData({
        first_name: "",
        last_name: "",
        mobile_number: "",
        reservation_date: "",
        reservation_time: "",
        people: 1,
      });
    }
  }, [method, params.reservation_id]);

  useEffect(() => {
    if (Object.keys(existingData).length) {
      setFormData({
        first_name: existingData.first_name,
        last_name: existingData.last_name,
        mobile_number: existingData.mobile_number,
        reservation_date: existingData.reservation_date,
        reservation_time: existingData.reservation_time,
        people: existingData.people,
      });
    }
  }, [existingData]);

  const handleChange = ({ target }) => {

    let name = target.name;
    let value = target.value;
                    
    if (name === "reservation_date") {
        const date = new Date(`${value} PDT`);
        const reservation = date.getTime();
        const now = Date.now();

        if (date.getUTCDay() === 2 && reservation < now) {
            setError(new Error(
                "The restaurant is closed on Tuesday.", 
                "Reservation must be in the future."
            ));
        } else if (date.getUTCDay() === 2) {
            setError(new Error("The restaurant is closed on Tuesday."));
        } else if (reservation < now) {
            setError(new Error("Reservation must be in the future."));
        } else {
            setError([]);
        }
    }

    if (name === "reservation_time") {
        const open = 1030;
        const close = 2130;
        const reservation = value.substring(0, 2) + value.substring(3);
        if (reservation > open && reservation < close) {
            setError([]);
        } else {
            setError(new Error("Reservations are only allowed between 10:30am and 9:30pm."))
        }
    }

    setFormData({
        ...formData,
        [target.name]: target.value,
    });
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    method === "POST" ? submitNew() : submitEdit();
  };

  const submitNew = () => {
    const abortController = new AbortController();
    setError(null);

    postReservation(formData, abortController.signal)
      .then(() => history.push(`/dashboard?date=${formData.reservation_date}`))
      .catch(setError);

    return () => abortController.abort();
  };

  const submitEdit = () => {
    const abortController = new AbortController();
    setError(null);

    const trimmedFormData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      people: formData.people,
      mobile_number: formData.mobile_number,
      reservation_date: formData.reservation_date,
      reservation_time: formData.reservation_time,
    };

    updateReservation(params.reservation_id, trimmedFormData, abortController.signal)
      .then(() => history.push(`/dashboard?date=${formData.reservation_date}`))
      .catch(setError);

    return () => abortController.abort();
  };

  const handleCancel = (event) => {
    event.preventDefault();
    history.goBack();
  };

  return (
    <div>
      {method === "PUT" ? <h2>Edit Reservation </h2> : <h2>New Reservation </h2>}
      <form name="reservation" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="first_name">
            First Name</label>
              <input
                id="first_name"
                type="text"
                name="first_name"
                onChange={handleChange}
                value={formData.first_name}
                className="form-control"
                required={true}
              ></input>
          <label htmlFor="last_name">
            Last Name:</label>
              <input
                id="last_name"
                type="text"
                name="last_name"
                onChange={handleChange}
                value={formData.last_name}
                className="form-control"
                required={true}
              ></input>
          <label htmlFor="mobile_number">
            Mobile Number:</label>
              <input
                id="mobile_number"
                type="text"
                name="mobile_number"
                onChange={handleChange}
                value={formData.mobile_number}
                className="form-control"
                required={true}
              ></input>
          <label htmlFor="reservation_date">
            Reservation Date:</label>
            <input
              id="reservation_date"
              type="date"
              name="reservation_date"
              onChange={handleChange}
              value={formData.reservation_date}
              className="form-control"
              required={true}
            ></input>
          <label htmlFor="reservation_time">
            Reservation Time:</label>
            <input
              id="reservation_time"
              type="time"
              name="reservation_time"
              onChange={handleChange}
              value={formData.reservation_time}
              className="form-control"
              required={true}
            ></input>
          <label htmlFor="people">
            Party Size:</label>
            <input
              id="people"
              type="number"
              name="people"
              onChange={handleChange}
              required={true}
              min="1"
              value={formData.people}
              className="form-control"
            ></input>
        </div>
        <button type="submit">Submit</button>
        <button type="button" value="Cancel" onClick={handleCancel}>
          Cancel
        </button>
      </form>
      {error ? <ErrorAlert error={error} /> : null}
    </div>
  );
}

export default ReservationForm;