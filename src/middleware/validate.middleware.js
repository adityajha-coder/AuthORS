export const validate = (schema) => (req, res, next) => {
    try {
        // Trim, lowercase, and validate req.body
        req.body = schema.parse(req.body);
        next();
    } catch (error) {
        const issues = error.issues || error.errors || [];
        return res.status(400).json({
            message: issues[0]?.message || error.message || "Validation failed",
            errors: issues.map((err) => ({
                field: err.path.join("."),
                message: err.message,
            })),
        });
    }
};