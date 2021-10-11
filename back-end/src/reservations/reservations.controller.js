const service = require("./reservations.service")
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

/**
 * List handler for reservation resources
 */
 

async function list(req, res) {
  const { date } = req.query;
  const data = await service.list(date);
  res.json({data: data});
}

module.exports = {
  list,
};
