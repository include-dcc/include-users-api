import { Request, Router } from 'express';
import { completeRegistration, createUser, getUserById, updateUser, searchUsers } from '../db/dal/user';
import { StatusCodes } from 'http-status-codes';
import { Order } from 'sequelize';

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

            const result = await searchUsers({ pageSize, pageIndex, sorts, match: req.query.match, roles, dataUses });
            res.status(StatusCodes.OK).send(result);
        } catch (e) {
            next(e);
        }
    },
);

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

export default usersRouter;
