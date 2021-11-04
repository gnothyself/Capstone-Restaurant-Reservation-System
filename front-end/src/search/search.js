import React, { useState } from "react";
import Reservation from "../reservations/Reservation";
import { readByPhone } from "../utils/api";
import { mobileFormat } from "../utils/validation";

export default function Search() {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [submit, setSubmit] = useState(false);

    const handleChange = ({ target }) => {
        let numberValidation = target.value;
        numberValidation = mobileFormat(
            numberValidation,
            numberValidation.length
        );
        target.value = numberValidation;
        setPhoneNumber(numberValidation);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        readByPhone(phoneNumber)
            .then((data) => {
                setSearchResults(data);
            })
            .then(setSubmit(true));
    };

    return (
        <div>
          <h2>Search</h2>
          <form name="reservation" onSubmit={handleSubmit}>
            <input
              className="form-control col-sm-6 col-md-5 col-lg-3"
              type="text"
              name="mobile_number"
              placeholder="Enter a customer's phone number"
              onChange={handleChange}
              value={phoneNumber}
            ></input>
            <button type="submit" className="btn btn-primary mt-2">
              Find
            </button>
          </form>
          {submit ? (
            searchResults.length ? (
              <div>
                {searchResults.map((reservation) =>
                  reservation.status === " finished" ? null : (
                    <Reservation data={reservation} />
                  )
                )}
              </div>
            ) : (
              <div> No reservations found</div>
            )
          ) : null}
        </div>
      );
    }
    