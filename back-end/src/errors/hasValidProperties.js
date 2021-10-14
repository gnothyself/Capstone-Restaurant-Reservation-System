 
 function hasValidProperties(...properties) {
    return function (req, res, next) {
        const { data = {} } = req.body;
        const invalidStatuses = Object.keys(data).filter(
        (field) => !properties.includes(field)
        );
        if (invalidStatuses.length) {
        return next({
            status: 400,
            message: `Invalid field(s): ${invalidStatuses.join(", ")}`,
        });
        }
        next();
    }
}

module.exports = hasValidProperties;