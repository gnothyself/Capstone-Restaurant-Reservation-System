const knex = require("../db/connection");

// Returns all tables
function list() {
  return knex("tables")
    .select("*")
    .orderBy("table_name");
}

// Posts new table
function create(table) {
  return knex("tables")
    .insert(table)
    .returning("*")
    .then((newTables) => newTables[0]);
}

// Returns a reservation for the specified id
function read(id) {
  return knex("tables")
    .select("*")
    .where({ table_id: id })
    .then((result) => result[0]);
}

// Updates table
async function update(updatedTable, resId, updatedResStatus) {
  try {
    await knex.transaction(async (trx) => {
      const returnedUpdatedTable = await trx("tables")
        .where({ table_id: updatedTable.table_id })
        .update(updatedTable, "*")
        .then((updatedTables) => updatedTables[0]);

      const returnedUpdatedReservation = await trx("reservations")
        .where({ reservation_id: resId })
        .update({ status: updatedResStatus }, "*")
        .then((updatedReservations) => updatedReservations[0]);
    });
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  create,
  read,
  update,
  list,
};