import { Request, Response, NextFunction } from "express";
import { jwtVerify, createRemoteJWKSet } from "jose";

export interface AuthenticatedRequest extends Request {
    user?: any;
}

let jose: typeof import("jose") | null = null;
let JWKS: ReturnType<(typeof import("jose"))["createRemoteJWKSet"]> | null = null;

// jose lazy load
const getJose = async () => {
    if (!jose) {
        jose = await import("jose");
    }
    return jose;
};

// JWKS cache
const getJWKS = async () => {
    if (JWKS) return JWKS;

    const authUrl = process.env.BETTER_AUTH_URL;

    if (!authUrl) {
        console.error("BETTER_AUTH_URL is missing");
        return null;
    }

    try {
        const { createRemoteJWKSet } = await getJose();

        const jwksUrl = new URL(`${authUrl}/api/auth/jwks`);

        JWKS = createRemoteJWKSet(jwksUrl);

        return JWKS;
    } catch (error) {
        console.error("Failed to create JWKS", error);
        return null;
    }
};

export const verifyToken = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "Unauthorized: No token provided",
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized: Invalid token format",
        });
    }

    const jwks = await getJWKS();

    if (!jwks) {
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }

    try {
        const { jwtVerify } = await getJose();

        const { payload } = await jwtVerify(token, jwks);

        req.user = payload;

        next();
    } catch (error) {
        console.error("JWT Verify Error:", error);

        return res.status(401).json({
            message: "Unauthorized: Invalid or expired token",
        });
    }
};