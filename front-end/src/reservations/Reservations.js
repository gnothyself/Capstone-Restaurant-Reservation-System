import React from "react";

export default function Reservations({ reservations }){

    const reservationList = reservations.map((reservation, index) => {
        const { first_name, last_name, reservation_time, people, mobile_number } = reservation
        return (
            <div className="card mb-3" key={index}>
                <h5 className="card-header">{`${first_name} ${last_name}`}</h5>
                <div className="card-body">
                    <p>Reservation Time: {reservation_time}<br />
                    Party Size: {people}<br />
                    Phone Number: {mobile_number}</p>
                </div>
            </div>
        );
    })

    return reservationList
}