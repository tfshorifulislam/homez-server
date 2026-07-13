import { Request, Response, NextFunction } from 'express';
import { jwtVerify, createRemoteJWKSet } from 'jose';

export interface AuthenticatedRequest extends Request {
    user?: any;
}

let JWKS: ReturnType<typeof createRemoteJWKSet> | null = null;


const getJWKS = () => {
    if (JWKS) return JWKS;

    const clientUrl = process.env.NEXT_PUBLIC_CLIENT_URL;
    if (!clientUrl) {
        console.error('CRITICAL ERROR: NEXT_PUBLIC_CLIENT_URL environment variable is missing.');
        return null;
    }

    try {
        const jwksUrl = new URL(`${clientUrl}/api/auth/jwks`);
        JWKS = createRemoteJWKSet(jwksUrl);
        return JWKS;
    } catch (urlError) {
        console.error('CRITICAL ERROR: Invalid NEXT_PUBLIC_CLIENT_URL format.', urlError);
        return null;
    }
};

export const verifyToken = async (
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction
): Promise<Response | void> => {
    const token = req?.headers?.authorization;

    if (!token) {
        return res.status(401).send({ message: 'Unauthorized: No token provided' });
    }

    const tokenParts = token.split(' ')[1];

    if (!tokenParts) {
        return res.status(401).send({ message: 'Unauthorized: Invalid token format' });
    }

    const jwksSet = getJWKS();
    if (!jwksSet) {
        return res.status(500).send({ message: 'Internal Server Error: Auth configuration missing' });
    }

    try {
        const { payload } = await jwtVerify(tokenParts, jwksSet);
        req.user = payload;
        next();
    } catch (error) {
        console.log('Token verification failed:', error);
        return res.status(401).send({ message: 'Unauthorized: Token is invalid or expired' });
    }
};