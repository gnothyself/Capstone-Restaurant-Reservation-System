const service = require("./reservations.service")
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasValidProperties = require("../errors/hasValidProperties")
const hasProperties = require("../errors/hasProperties");
const hasValidValues = require("../errors/hasValidValues");


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

// ***** CRUD Functions *****
async function create(req, res) {
  const reservation = await service.create(req.body.data);
  res.status(201).json({ data: reservation });
};  

async function list(req, res) {
  const { date } = req.query;
  const data = await service.list(date);
  res.json({data: data});
}

module.exports = {
  create: [
    hasOnlyValidProperties,
    hasRequiredProperties,
    validValues,
    asyncErrorBoundary(create),
  ],
  list,
};
