import { Request, Router } from 'express';
import createHttpError from 'http-errors';
import { StatusCodes } from 'http-status-codes';
import { Order } from 'sequelize';
import {
    completeRegistration,
    createUser,
    deleteProfileImage,
    deleteUser,
    getProfileImageUploadPresignedUrl,
    getUserById,
    searchUsers,
    updateUser
} from '../db/dal/user';

// Handles requests made to /users
const usersRouter = Router();

/**
 *
 * Example search query params:
 *
 * pageSize     = 15
 * pageIndex    = 0
 * sort         = last_name:asc,creation_date:desc
 * roles        = Clinician,other
 * dataUses     = Commercial use,other
 *
 */
usersRouter.get(
    '/search',
    async (
        req: Request<
            {},
            {},
            {},
            {
                pageSize?: string;
                pageIndex?: string;
                sort?: string;
                match?: string;
                roles?: string;
                dataUses?: string;
                roleOptions?: string;
                usageOptions?: string;
            }
        >,
        res,
        next,
    ) => {
        try {
            const pageSize = parseInt(req.query.pageSize || '15');
            const pageIndex = parseInt(req.query.pageIndex || '0');
            const roles = req.query.roles ? req.query.roles.split(',') : [];
            const dataUses = req.query.dataUses ? req.query.dataUses.split(',') : [];

            let sorts: Order = [];
            if (req.query.sort) {
                sorts = req.query.sort.split(',').map((sortElement) => {
                    const sortItems = sortElement.split(':');
                    return [sortItems[0], sortItems[1].toUpperCase()];
                });
            }

            const roleOptions = req.query.roleOptions ? req.query.roleOptions.split(',') : [];
            const usageOptions = req.query.usageOptions ? req.query.usageOptions.split(',') : [];

            if (!roleOptions.length || !roleOptions.length) {
                throw createHttpError(StatusCodes.BAD_REQUEST, 'roleOptions and usageOptions array must be provided.');
            }

            const result = await searchUsers({
                pageSize,
                pageIndex,
                sorts,
                match: req.query.match,
                roles,
                dataUses,
                roleOptions,
                usageOptions,
            });
            res.status(StatusCodes.OK).send(result);
        } catch (e) {
            next(e);
        }
    },
);

usersRouter.get('/image/presigned', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        const result = await getProfileImageUploadPresignedUrl(keycloak_id);
        res.status(StatusCodes.OK).send(result);
    } catch (e) {
        next(e);
    }
});

usersRouter.delete('/image', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        await deleteProfileImage(keycloak_id);
        res.status(StatusCodes.OK).send(true);
    } catch (e) {
        next(e);
    }
});

usersRouter.get('/:id?', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        const requestKeycloakId = req.params.id;

        const result = await getUserById(
            requestKeycloakId ?? keycloak_id,
            requestKeycloakId ? requestKeycloakId === keycloak_id : true,
        );
        res.status(StatusCodes.OK).send(result);
    } catch (e) {
        next(e);
    }
});

usersRouter.post('/', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        const result = await createUser(keycloak_id, req.body);
        res.status(StatusCodes.CREATED).send(result);
    } catch (e) {
        next(e);
    }
});

usersRouter.put('/', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        const result = await updateUser(keycloak_id, req.body);
        res.status(StatusCodes.OK).send(result);
    } catch (e) {
        next(e);
    }
});

usersRouter.put('/complete-registration', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        const result = await completeRegistration(keycloak_id, req.body);
        res.status(StatusCodes.OK).send(result);
    } catch (e) {
        next(e);
    }
});

usersRouter.delete('/', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        await deleteUser(keycloak_id);
        res.status(StatusCodes.OK).send({ success: true });
    } catch (e) {
        next(e);
    }
});

export default usersRouter;
