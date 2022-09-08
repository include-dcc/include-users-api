import createHttpError from 'http-errors';
import { StatusCodes } from 'http-status-codes';
import { Op, Order } from 'sequelize';
import { uuid } from 'uuidv4';
import { validateUserRegistrationPayload } from '../../utils/userValidator';
import UserModel, { IUserInput, IUserOuput } from '../models/User';

const sanitizeInputPayload = (payload: IUserInput) => {
    const { id, keycloak_id, completed_registration, creation_date, ...rest } = payload;
    return rest;
};

const otherKey = 'other';

const cleanedUserAttributes = [
    'id',
    'keycloak_id',
    'first_name',
    'last_name',
    'roles',
    'portal_usages',
    'creation_date',
    'updated_date',
    'public_email',
    'commercial_use_reason',
    'linkedin',
    'affiliation',
];

export const searchUsers = async ({
    pageSize,
    pageIndex,
    sorts,
    match,
    roles,
    dataUses,
}: {
    pageSize: number;
    pageIndex: number;
    sorts: Order;
    match: string;
    roles: string[];
    dataUses: string[];
}) => {
    let matchClauses = {};
    if (match) {
        const matchLikeClause = {
            [Op.iLike]: `%${match}%`,
        };

        matchClauses = {
            [Op.or]: [
                { first_name: matchLikeClause },
                { last_name: matchLikeClause },
                { affiliation: matchLikeClause },
            ],
        };
    }

    let andClauses = [];
    const rolesWithoutOther = roles.filter((role) => role.toLowerCase() !== otherKey);
    if (rolesWithoutOther.length) {
        andClauses.push({
            roles: {
                [Op.contains]: rolesWithoutOther.map((role) => role.toLowerCase()),
            },
        });
    }

    const dataUsesWithoutOther = dataUses.filter((use) => use.toLowerCase() !== otherKey);
    if (dataUsesWithoutOther.length) {
        andClauses.push({
            roles: {
                [Op.contains]: dataUsesWithoutOther.map((use) => use.toLowerCase()),
            },
        });
    }

    const results = await UserModel.findAndCountAll({
        attributes: cleanedUserAttributes,
        limit: pageSize,
        offset: pageIndex * pageSize,
        order: sorts,
        where: {
            [Op.and]: {
                completed_registration: true,
                deleted: false,
                ...matchClauses,
                [Op.and]: andClauses,
            },
        },
    });

    return {
        users: results.rows,
        total: results.count,
    };
};

export const getUserById = async (keycloak_id: string, isOwn: boolean): Promise<IUserOuput> => {
    let attributesClause = {};
    if (!isOwn) {
        attributesClause = {
            attributes: cleanedUserAttributes,
        };
    }

    const user = await UserModel.findOne({
        ...attributesClause,
        where: {
            keycloak_id,
            deleted: false,
        },
    });

    if (!user) {
        throw createHttpError(StatusCodes.NOT_FOUND, `User with keycloak id ${keycloak_id} does not exist.`);
    }

    return user;
};

export const isUserExists = async (
    keycloak_id: string,
): Promise<{
    exists: boolean;
}> => {
    const user = await UserModel.findOne({
        where: {
            keycloak_id,
        },
    });

    return {
        exists: !!user && (user?.completed_registration || false),
    };
};

export const createUser = async (keycloak_id: string, payload: IUserInput): Promise<IUserOuput> => {
    const newUser = await UserModel.create({
        ...payload,
        keycloak_id: keycloak_id,
        creation_date: new Date(),
        updated_date: new Date(),
    });
    return newUser;
};

export const updateUser = async (keycloak_id: string, payload: IUserInput): Promise<IUserOuput> => {
    const results = await UserModel.update(
        {
            ...sanitizeInputPayload(payload),
            updated_date: new Date(),
        },
        {
            where: {
                keycloak_id,
            },
            returning: true,
        },
    );

    return results[1][0];
};

export const deleteUser = async (keycloak_id: string): Promise<void> => {
    await UserModel.update(
        {
            keycloak_id: uuid(),
            email: uuid(),
            affiliation: uuid(),
            public_email: uuid(),
            nih_ned_id: uuid(),
            era_commons_id: uuid(),
            first_name: uuid(),
            last_name: uuid(),
            linkedin: uuid(),
            external_individual_fullname: uuid(),
            external_individual_email: uuid(),
            deleted: true,
        },
        {
            where: {
                keycloak_id,
            },
        },
    );
};

export const completeRegistration = async (keycloak_id: string, payload: IUserInput): Promise<IUserOuput> => {
    if (!validateUserRegistrationPayload(payload)) {
        throw createHttpError(
            StatusCodes.BAD_REQUEST,
            'Some required fields are missing to complete user registration',
        );
    }

    const results = await UserModel.update(
        {
            ...sanitizeInputPayload(payload),
            completed_registration: true,
            updated_date: new Date(),
        },
        {
            where: {
                keycloak_id,
            },
            returning: true,
        },
    );

    return results[1][0];
};
