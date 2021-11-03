const dateFormat = /^\d\d\d\d-\d\d-\d\d$/;
const timeFormat = /^\d\d:\d\d$/;

function timeIsValid(timeString) {
  return timeString.match(timeFormat)?.[0];
}

function dateFormatIsValid(dateString) {
  return dateString.match(dateFormat)?.[0];
}

function dateNotInPast(dateString, timeString) {
  const now = new Date();
  const reservationDate = new Date(dateString + "T" + timeString);
  return reservationDate >= now;
}

function timeDuringBizHours(timeString) {
  const open = "10:30";
  const close = "21:30";
  return timeString <= close && timeString >= open;
}

function dateNotTuesday(dateString) {
  const date = new Date(dateString);
  return date.getUTCDay() !== 2;
}

function statusIsBookedOrNull(status) {
  if (!status || status === "booked") {
    return true;
  } else {
    return false;
  }
}

function hasValidValues() {
   return function (req, res, next) {
        const { reservation_date, reservation_time, people } = req.body.data;

        if (people < 1) {
            return next({
            status: 400,
            message: "# of people must be a whole number and >= 1",
            });
        }
        if (!timeIsValid(reservation_time)) {
            return next({
            status: 400,
            message: "reservation_time must be in HH:MM:SS (or HH:MM) format",
            });
        }
        if (!dateFormatIsValid(reservation_date)) {
            return next({
            status: 400,
            message: "reservation_date must be in YYYY-MM-DD (ISO-8601) format",
            });
        }
        if (!dateNotInPast(reservation_date, reservation_time)) {
            return next({
            status: 400,
            message: `You are attempting to submit a reservation in the past. Only future reservations are allowed`,
            });
        }
        if (!timeDuringBizHours(reservation_time)) {
            return next({
            status: 400,
            message: "The reservation time must be between 10:30 AM and 9:30 PM",
            });
        }
        if (!dateNotTuesday(reservation_date)) {
            return next({
            status: 400,
            message:
                "The reservation date is a Tuesday- but the restaurant is closed on Tuesdays",
            });
        }
        if (!statusIsBookedOrNull(req.body.data?.status)) {
            return next({
            status: 400,
            message: '"seated" and "finished" are not valid statuses upon creation',
            });
        }
        next();
    }
}

module.exports = hasValidValues;