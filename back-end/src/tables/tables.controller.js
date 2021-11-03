const service = require("./tables.service");
const reservationsService = require("../reservations/reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");

// *****
// Validation functions
async function hasReservationId(req, res, next) {
  if (req.body?.data?.reservation_id) {
    return next();
  }
  next({
    status: 400,
    message: `reservation_id is missing from request`,
  });
}

async function reservationExists(req, res, next) {
  const { reservation_id } = req.body.data;
  const reservation = await reservationsService.read(reservation_id);
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  next({
    status: 404,
    message: `Reservation with id: ${reservation_id} was not found`,
  });
}

async function reservationIsBooked(req, res, next) {
  const { reservation } = res.locals;
  if (reservation.status !== "seated") {
    return next();
  }
  next({
    status: 400,
    message: `Reservation is already 'seated'`,
  });
}

async function tableExists(req, res, next) {
  const { table_id } = req.params;
  const table = await service.read(table_id);
  if (table) {
    res.locals.table = table;
    return next();
  }
  next({
    status: 404,
    message: `Table with id: ${table_id} was not found`,
  });
}

function tableIsBigEnough(req, res, next) {
  const { table, reservation } = res.locals;
  if (table.capacity >= reservation.people) {
    return next();
  }
  next({
    status: 400,
    message: `Table with id: ${table.table_id} does not have the capacity to seat this reservation: capacity must be at least ${reservation.people}`,
  });
}

function tableIsFree(req, res, next) {
  const { table } = res.locals;
  if (!table.reservation_id) {
    return next();
  }
  next({
    status: 400,
    message: `Table with id: ${table.table_id} is already occupied`,
  });
}

function occupyTable(req, res, next) {
  const { table } = res.locals;
  const { reservation_id } = req.body.data;
  table.reservation_id = reservation_id;
  res.locals.resId = reservation_id;
  res.locals.resStatus = "seated";
  if (table.reservation_id) {
    return next();
  }
  next({
    status: 400,
    message: `Table with id: ${table.table_id} could not be assigned reservation id ${table.reservation_id}  for some reason. Please contact backend engineer for assistance`,
  });
}

function tableIsOccupied(req, res, next) {
  const { table } = res.locals;
  if (table.reservation_id) {
    return next();
  }
  next({
    status: 400,
    message: `Table with id: ${table.table_id} is not occupied`,
  });
}

function deOccupyTable(req, res, next) {
  const { table } = res.locals;
  res.locals.resId = table.reservation_id;
  table.reservation_id = null;
  res.locals.resStatus = "finished";
  if (!table.reservation_id) {
    return next();
  }
  next({
    status: 400,
    message: `Table with id: ${table.table_id} could not remove reservation id ${table.reservation_id}  for some reason. Please contact backend engineer for assistance`,
  });
}

const VALID_PROPERTIES = ["table_name", "capacity", "reservation_id"];

function hasOnlyValidProperties(req, res, next) {
  const { data = {} } = req.body;
  const invalidFields = Object.keys(data).filter(
    (field) => !VALID_PROPERTIES.includes(field)
  );

  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  }
  next();
}

const hasRequiredProperties = hasProperties(...["table_name", "capacity"]);

function tableNameIsValid(tableName) {
  return tableName.length > 1;
}

function capacityIsValid(capacity) {
  return Number.isInteger(capacity) && capacity >= 1;
}

function hasValidValues(req, res, next) {
  const { table_name, capacity } = req.body.data;

  if (!capacityIsValid(capacity)) {
    return next({
      status: 400,
      message: "capacity must be a whole number greater than or equal to 1",
    });
  }
  if (!tableNameIsValid(table_name)) {
    return next({
      status: 400,
      message: "table_name must be more than one character",
    });
  }

  next();
}

// *****
// CRUDL Functions
async function list(req, res) {
  const tables = await service.list();
  res.locals.data = tables;
  const { data } = res.locals;
  res.json({ data: data });
}

// Create handler for a new table
async function create(req, res) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data });
}

// Read a table
async function read(req, res) {
  //* res.locals.table is being set from tableExists()
  const { table } = res.locals;
  res.json({ data: table });
}

// update handler for either assigning or removing a reservation from a table
//* resId and resStatus are coming from last middleware (occupy and deoccupy table) before update for BOTH adding and deleting reservation_ids from tables. They are needed for the knex transaction in tables.service.js
async function update(req, res) {
  const { table, resId, resStatus } = res.locals;
  const updatedTable = { ...table };
  const data = await service.update(updatedTable, resId, resStatus);
  res.json({ data });
}


// *****
module.exports = {
  create: [
    hasOnlyValidProperties,
    hasRequiredProperties,
    hasValidValues,
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(tableExists), asyncErrorBoundary(read)],
  assignReservationId: [
    asyncErrorBoundary(hasReservationId),
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(reservationIsBooked),
    asyncErrorBoundary(tableExists),
    tableIsBigEnough,
    tableIsFree,
    occupyTable,
    asyncErrorBoundary(update),
  ],
  deleteReservationId: [
    asyncErrorBoundary(tableExists),
    tableIsOccupied,
    deOccupyTable,
    asyncErrorBoundary(update),
  ],
  list: asyncErrorBoundary(list),
};

// const service = require("./tables.service");
// const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
// const hasProperties = require("../errors/hasProperties");
// const hasValidProperties = require("../errors/hasValidProperties");
// const reservationService = require("../reservations/reservations.service");


// // *****
// // Confirms that table exists by table_id
// async function tableExists(req, res, next) {
//     const { table_id } = req.params;
//     const data = await service.read(table_id);
//     if (data) {
//         res.locals.table = data;
//         return next();
//     } else {
//         return next({
//             status: 404,
//             message: `table_id: ${table_id} does not exist.`
//         });
//     }
// }

// // *****
// // Confirms reservation exists by reservation_id and is not already seated
// async function reservationExists(req, res, next) {
//     const { reservation_id } = req.body.data;
//     const data = await reservationService.read(reservation_id);
//     if (data && data.status !== "seated") {
//         res.locals.reservation = data;
//         return next();
//     } else if (data && data.status === "seated") {
//         return next({
//             status: 400,
//             message: `reservation_id: ${reservation_id} is already seated.`,
//         });
//     } else {
//         return next({
//             status: 404,
//             message: `reservation_id: ${reservation_id} does not exist.`,
//         });
//     }
// }

// // *****
// // Validates the properties of the table
// const VALID_PROPERTIES = ["table_name", "capacity", "reservation_id"];

// function hasOnlyValidProperties(req, res, next) {
//   const { data = {} } = req.body;
//   const invalidFields = Object.keys(data).filter(
//     (field) => !VALID_PROPERTIES.includes(field)
//   );

//   if (invalidFields.length) {
//     return next({
//       status: 400,
//       message: `Invalid field(s): ${invalidFields.join(", ")}`,
//     });
//   }
//   next();
// }

// const hasRequiredProperties = hasProperties(...["table_name", "capacity"]);

// function tableNameIsValid(tableName) {
//   return tableName.length > 1;
// }

// function capacityIsValid(capacity) {
//   return Number.isInteger(capacity) && capacity >= 1;
// }

// function hasValidValues(req, res, next) {
//   const { table_name, capacity } = req.body.data;

//   if (!capacityIsValid(capacity)) {
//     return next({
//       status: 400,
//       message: "capacity must be a whole number greater than or equal to 1",
//     });
//   }
//   if (!tableNameIsValid(table_name)) {
//     return next({
//       status: 400,
//       message: "table_name must be more than one character",
//     });
//   }
//   next();
// }
// //------------------------------
// // const VALID_POST_PROPERTIES = [
// //     "table_name",
// //     "capacity",
// // ]

// // const postProperties = hasProperties(...VALID_POST_PROPERTIES);
// // const hasValidPostProperties = hasValidProperties(...VALID_POST_PROPERTIES, "reservation_id");

// // const VALID_PUT_PROPERTIES = [
// //     "reservation_id"
// // ]

// // const putProperties = hasProperties(...VALID_PUT_PROPERTIES);
// // const hasValidPutProperties = hasValidProperties(...VALID_PUT_PROPERTIES);

// // *****
// // validation middleware: checks that table_name is at least 2 characters
// function tableNameLength(req, res, next) {
//     const { table_name } = req.body.data;
//     if (table_name.length > 1) {
//         return next();
//     } else {
//         return next({
//             status: 400,
//             message: "table_name must be at least 2 characters in length."
//         });
//     }
// }

// // validation middleware: checks that capacity is a number
// function capacityIsNumber(req, res, next) {
//     const { capacity } = req.body.data;
//     if (!isNaN(capacity)) {
//         return next();
//     } else {
//         return next({
//             status: 400, 
//             message: `capacity field formatted incorrectly: ${capacity}. Needs to be a number.`
//         });
//     }
// }



// // validation middleware: checks that table had sufficient capacity
// function tableCapacity(req, res, next) { 
//     const { capacity } = res.locals.table;
//     const { people } = res.locals.reservation;
//     if (capacity >= people) {
//         return next();
//     } else {
//         return next({
//             status: 400, 
//             message: "Table does not have sufficient capacity."
//         });
//     }
// }

// // validation middlware: checks if table status is free
// function tableStatusFree(req, res, next) {
//     const { status } = res.locals.table;
//     if (status === "Free") {
//         return next();
//     } else {
//         return next({
//             status: 400, 
//             message: "Table is currently occupied."
//         });
//     }
// }

// // validation middlware: checks if table status is free
// function tableStatusOccupied(req, res, next) {
//     const { status } = res.locals.table;
//     if (status === "Occupied") {
//         return next();
//     } else {
//         return next({
//             status: 400, 
//             message: "Table is not occupied."
//         });
//     }
// }

// // list all tables - sorted by table_name
// async function list(req, res) {
//     res.json({ data: await service.list() });
//   }

// // create a new table
// async function create(req, res) {
//     const table = await service.create(req.body.data);
//     res.status(201).json({ data: table });
// }

// // seat a reservation at a table
// async function seat(req, res) {
//     const { table } = res.locals;
//     const { reservation_id } = res.locals.reservation;
//     const { table_id } = req.params;
//     const updatedTableData = {
//         ...table,
//         table_id: table_id,
//         reservation_id: reservation_id,
//         status: "Occupied",
//     }
//     const updatedTable = await service.seat(updatedTableData);
//     // set reservation status to "seated" using reservation id
//     const updatedReservation = {
//         status: "seated", 
//         reservation_id: reservation_id,
//     }
//     await reservationService.update(updatedReservation);
//     res.json({ data: updatedTable });
// }

// // finish an occupied table
// async function finish(req, res) {
//     const { table_id } = req.params;
//     const { table } = res.locals;
//     const updatedTableData = {
//         ...table,
//         status: "Free"
//     }
//     const updatedTable = await service.finish(updatedTableData);
//     // set reservation status to "finished" using reservation id
//     const updatedReservation = {
//         status: "finished", 
//         reservation_id: table.reservation_id,
//     }
//     await reservationService.update(updatedReservation); 
//     res.json({ data: updatedTable });
// }

// module.exports = {
//     list: asyncErrorBoundary(list),
//     create: [
//         hasOnlyValidProperties,
//         hasRequiredProperties,
//         hasValidValues,
//         asyncErrorBoundary(create),
//       ],
//     seat: [
//         putProperties, 
//         hasValidPutProperties, 
//         asyncErrorBoundary(tableExists),
//         asyncErrorBoundary(reservationExists),
//         tableCapacity,
//         tableStatusFree,
//         asyncErrorBoundary(seat),
//     ],
//     finish: [
//         asyncErrorBoundary(tableExists),
//         tableStatusOccupied,
//         asyncErrorBoundary(finish),
//     ]
//   };