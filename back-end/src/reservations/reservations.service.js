const knex = require("../db/connection");

// List all reservations by date, ordered by time
function list() {
    return knex("reservations")
        .select("*")
        .orderBy("reservation_time");
};


module.exports = {
    list,
}
