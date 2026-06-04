// Wrap async route handlers to catch errors and pass to next()
// Eliminates try/catch boilerplate in every async route
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

module.exports = catchAsync;