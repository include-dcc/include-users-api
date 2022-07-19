import { Router } from 'express';
import { completeRegistration, createUser, getUserById, updateUser, searchUsers } from '../db/dal/user';
import { StatusCodes } from 'http-status-codes';

// Handles requests made to /users
const usersRouter = Router();

usersRouter.get('/search', async (req, res, next) => {
    try {
        const pageSize = parseInt((req.query.pageSize as string) || '15');
        const pageIndex = parseInt((req.query.pageIndex as string) || '0');

        const result = await searchUsers(pageSize, pageIndex);
        res.status(StatusCodes.OK).send(result);
    } catch (e) {
        next(e);
    }
});

usersRouter.get('/:id?', async (req, res, next) => {
    try {
        const keycloak_id = req.params.id || req['kauth']?.grant?.access_token?.content?.sub;
        const result = await getUserById(keycloak_id);
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
