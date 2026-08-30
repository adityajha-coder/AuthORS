export const validate = (schema) => 
(req, res, next) => {
    try{
        // Trim, lowercase, and validate req.body
        req.body = schema.parse(req.body);
        next();
    } catch (error) {
        return res
        .status(400)
        .json({
            message: error.errors[0]?.message || "Validation failed",
            errors: error.errors.map((err) => ({
                field: err.path.join("."),
                message: err.message,
            })),
        });
    }
};