const knex = require("../db/connection");

// Posts new reservations
function create(reservation) {
    return knex("reservations")
      .insert(reservation)
      .returning("*")
      .then((result) => result[0]);
};

// List all reservations by date, ordered by time
function list(date) {
    return knex("reservations")
        .select("*")
        .where({ reservation_date: date })
        .orderBy("reservation_time");
};

// Returns all reservations with partial match to specified phone number, ordered by date
function searchByPhone(mobile_number) {
    return knex("reservations")
      .whereRaw(
        "translate(mobile_number, '() -', '') like ?",
        `%${mobile_number.replace(/\D/g, "")}%`
      )
      .orderBy("reservation_date");
};

// Returns a reservation by reservation_id
function read(reservationId) {
    return knex("reservations")
        .select("*")
        .where({ reservation_id: reservationId })
        .then((returnedRecords) => returnedRecords[0]);
};

// Updates a reservation status
function update(updatedReservation) {
    return knex("reservations")
        .select("*")
        .where({ reservation_id: updatedReservation.reservation_id })
        .update(updatedReservation, "*")
        .then((updatedReservations) => updatedReservations[0]);
};

module.exports = {
   create,
   list,
   searchByPhone,
   read,
   update,
}
