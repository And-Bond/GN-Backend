import Services from '../Services/index.js'
const JWT_SECRET = process.env.JWT_SECRET
// Type imports
import type Hapi from '@hapi/hapi'
import type Joi from 'joi';

// What we are saving to jwt token
const validate = async (decoded: {[key: string]: any}, req: Hapi.Request) => {
    try {
        // Check later
        const accessToken = req.auth.credentials.token
        if (!decoded || !decoded._id || !accessToken) {
            return { isValid: false };
        }
        
        const accessTokenExists = await Services.AuthTokenService.getOne({ accessToken: accessToken });
        if (!accessTokenExists) {
            return { isValid: false };
        }

        const admin = await Services.ContactService.getById(decoded._id);
        if (!admin) {
            return { isValid: false };
        }

        return { isValid: true, credentials: admin };
    } catch (error) {
        return { isValid: false };
    }
};

const registerAuth = async (server: Hapi.Server) => {
    await server.register(await import('hapi-auth-jwt2'));

    server.auth.strategy('jwt', 'jwt', {
        key: JWT_SECRET,
        validate: validate,
        verifyOptions: { algorithms: ['HS256'] }
    });

    // server.auth.default('jwt');
};

export {
    registerAuth
}