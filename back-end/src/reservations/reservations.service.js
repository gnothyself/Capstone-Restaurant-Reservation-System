const knex = require("../db/connection");

// List all reservations by date, ordered by time
function list(date) {
    return knex("reservations")
        .select("*")
        .where({ reservation_date: date })
        .orderBy("reservation_time");
};


module.exports = {
    list,
}
