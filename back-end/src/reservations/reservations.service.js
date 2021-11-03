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
        .whereNot({ status: "finished" })
        .orderBy("reservation_time");
};

function listByDate(date) {
  return knex("reservations")
    .select("*")
    .where({ "reservations.reservation_date": date })
    .whereNot({ "reservations.status": "finished" })
    .orderBy("reservation_time", "asc");
}

// Returns all reservations with partial match to specified phone number, ordered by date
function searchByPhone(mobile_number) {
  return knex("reservations")
    .whereRaw(
      "translate(mobile_number, '() -', '') like ?",
      `%${mobile_number.replace(/\D/g, "")}%`
    )
    .orderBy("reservation_date");
}

function search(mobile_number) {
  return knex("reservations")
    .whereRaw(
      "translate(mobile_number, '() -', '') like ?",
      `%${mobile_number.replace(/\D/g, "")}%`
    )
    .orderBy("reservation_date");
}

// Returns a reservation by reservation_id
function read(reservationId) {
    return knex("reservations")
        .select("*")
        .where({ reservation_id: reservationId })
        .then((returnedRecords) => returnedRecords[0]);
};

// Updates a reservation
function update(reservation_id, updatedReservation) {
  return knex("reservations")
    .where({ reservation_id })
    .update(updatedReservation, "*")
    .then((result) => result[0]);
}

// Updates a reservation status
function updateStatus(reservation_id, status) {
  return knex("reservations").where({ reservation_id }).update({ status }, "*");
}

module.exports = {
   create,
   list,
   listByDate,
   searchByPhone,
   search,
   read,
   update,
   updateStatus,
}
