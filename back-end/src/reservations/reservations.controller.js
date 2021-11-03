const service = require("./reservations.service")
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasValidProperties = require("../errors/hasValidProperties")
const hasProperties = require("../errors/hasProperties");
const hasValidValues = require("../errors/hasValidValues");

// *****
// Confirms if the reservation exists by reservationId
async function reservationExists(req, res, next) {
  const { reservationId } = req.params;
  const reservation = await service.read(reservationId);

  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  next({
    status: 404,
    message: `Reservation with id: ${reservationId} was not found`,
  });
}

// ***** 
// Validates the properties of the reservation
const VALID_PROPERTIES = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
  "status",
  "reservation_id",
  "created_at",
  "updated_at",
];

const hasOnlyValidProperties = hasValidProperties(...VALID_PROPERTIES);

const REQUIRED_PROPERTIES = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
];

const hasRequiredProperties = hasProperties(...REQUIRED_PROPERTIES);

const validValues = hasValidValues();

// *****
// Middleware to determine search query by date or phone number
async function byDateOrPhone(req, res, next) {
  const { date, mobile_number } = req.query;
  if (date) {
    const reservations = await service.list(date);
    if (reservations.length) {
      res.locals.data = reservations;
      return next();
    } else {
      return next({
        status: 404, 
        message: `There are currently no pending reservations for ${date}`,
      });
    }
  } 
  if (mobile_number) {
    const reservation = await service.searchByPhone(mobile_number);
    res.locals.data = reservation;
    return next();
  }
}

// *****
// Functions to verify reservations status
function statusIsBooked(req, res, next) {
  const { status } = res.locals.reservation;
  if (status !== "booked") {
    return next({
      status: 400,
      message: 'Only "booked" reservations may be edited',
    });
  }

  next();
}

function statusIsValid(req, res, next) {
  const { status } = req.body.data;
  const VALID_STATUS = ["seated", "finished", "booked", "cancelled"];

  if (!VALID_STATUS.includes(status)) {
    return next({
      status: 400,
      message: `${status} is an invalid status`,
    });
  }

  next();
}

function statusNotFinished(req, res, next) {
  const { status } = res.locals.reservation;

  if (status === "finished" || status === "cancelled") {
    return next({
      status: 400,
      message: `a ${status} reservation cannot be updated`,
    });
  }

  next();
}


// *****
// CRUD Functions
async function create(req, res) {
  const reservation = await service.create(req.body.data);
  res.status(201).json({ data: reservation });
};  

async function read(req, res) {
  const { reservation } = res.locals;
  res.json({ data: reservation });
}

async function update(req, res) {
  const { reservation_id } = res.locals.reservation;
  const newReservationDetails = req.body.data;
  const existingReservation = res.locals.reservation;
  const mergedReservation = {
    ...existingReservation,
    ...newReservationDetails,
  };
  let updatedReservation = await service.update(reservation_id, mergedReservation);
  res.status(200).json({ data: updatedReservation });
}

async function updateStatus(req, res) {
  const newStatus = req.body.data.status;
  const { reservation_id } = res.locals.reservation;
  let data = await service.updateStatus(reservation_id, newStatus);
  res.status(200).json({ data: { status: newStatus } });
}

async function list(req, res) {
  if (req.query.date) {
    const reservations = await service.listByDate(req.query.date);
    return res.json({
      data: [...reservations],
    });
  } else if (req.query.mobile_number) {
    const reservations = await service.search(req.query.mobile_number);
    return res.json({
      data: [...reservations],
    });
  }
}

// *****
module.exports = {
  create: [
    hasOnlyValidProperties,
    hasRequiredProperties,
    validValues,
    asyncErrorBoundary(create),
  ],
  read: [
    reservationExists,
    asyncErrorBoundary(read)
  ],
  update: [
    asyncErrorBoundary(reservationExists),
    hasOnlyValidProperties,
    hasRequiredProperties,
    validValues,
    statusIsBooked,
    asyncErrorBoundary(update)
  ],
  updateStatus: [
    asyncErrorBoundary(reservationExists),
    statusIsValid,
    statusNotFinished,
    asyncErrorBoundary(updateStatus),
  ],
  list: [
    asyncErrorBoundary(list)
  ],
};
