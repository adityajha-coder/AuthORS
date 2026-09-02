import auditLogModel from "../models/auditLog.model.js";

export async function logSecurityEvent({
    event, 
    user = null, 
    email = null, 
    status = "SUCCESS",
    req = null, 
    ip = "", 
    userAgent = "", 
    details = {}
}) {
    try{
        const clientIp = req?.ip || req?.headers?.["x-forwarded-for"] || ip || "unknown";
        const clientUserAgent = req?.headers?.["user-agent"] || userAgent || "unknown";

        await auditLogModel.create({
            event,
            user: user?._id || user || null,
            email: email || user?.email || null,
            status,
            ip: clientIp,
            userAgent: clientUserAgent,
            details
        });
    } catch (err) {
        console.error("Audit Log Save Failed:", err.message);
        // CRITICAL: Do NOT throw here. The authentication flow must succeed even if logging fails.
    }
}