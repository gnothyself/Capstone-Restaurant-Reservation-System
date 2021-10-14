const knex = require("../db/connection");

// List all reservations by date, ordered by time
function list(date) {
    return knex("reservations")
        .select("*")
        .where({ reservation_date: date })
        .orderBy("reservation_time");
};

// Posts new reservations
function create(reservation) {
    return knex("reservations")
      .insert(reservation)
      .returning("*")
      .then((result) => result[0]);
  }


module.exports = {
    list,
    create,
}
