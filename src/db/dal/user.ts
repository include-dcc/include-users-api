import AWS from 'aws-sdk';
import createHttpError from 'http-errors';
import { StatusCodes } from 'http-status-codes';
import { Op, Order } from 'sequelize';
import { uuid } from 'uuidv4';
import { profileImageBucket } from '../../env';
import { validateUserRegistrationPayload } from '../../utils/userValidator';
import UserModel, { IUserInput, IUserOuput } from '../models/User';

const S3Client = new AWS.S3();

const sanitizeInputPayload = (payload: IUserInput) => {
    const { id, keycloak_id, completed_registration, creation_date, ...rest } = payload;
    return rest;
};

const otherKey = 'other';
const profileImageExtension = 'jpeg';

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
    'profile_image_key',
];

export const searchUsers = async ({
    pageSize,
    pageIndex,
    sorts,
    match,
    roles,
    dataUses,
    roleOptions,
    usageOptions,
}: {
    pageSize: number;
    pageIndex: number;
    sorts: Order;
    match: string;
    roles: string[];
    dataUses: string[];
    roleOptions: string[];
    usageOptions: string[];
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
            portal_usages: {
                [Op.contains]: dataUsesWithoutOther.map((use) => use.toLowerCase()),
            },
        });
    }

    if (dataUses.includes(otherKey)) {
        andClauses.push({
            [Op.not]: {
                portal_usages: {
                    [Op.contained]: usageOptions,
                },
            },
        });
    }

    if (roles.includes(otherKey)) {
        andClauses.push({
            [Op.not]: {
                roles: {
                    [Op.contained]: roleOptions,
                },
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

export const getProfileImageUploadPresignedUrl = async (keycloak_id: string) => {
    const s3Key = `${keycloak_id}.${profileImageExtension}`;
    const presignUrl = S3Client.getSignedUrl('putObject', {
        Bucket: profileImageBucket,
        Key: s3Key,
        Expires: 60 * 5,
        ContentType: 'image/jpeg',
        ACL: 'public-read',
    });

    return {
        s3Key,
        presignUrl,
    };
};

export const deleteProfileImage = async (keycloak_id: string): Promise<IUserOuput> => {
    const request = S3Client.deleteObject({
        Bucket: profileImageBucket,
        Key: `${keycloak_id}.${profileImageExtension}`,
    });

    const s3Result = await request.promise();

    if (s3Result.$response.error) {
        throw createHttpError(StatusCodes.BAD_REQUEST, 'Unable to delete profile image.');
    }

    const results = await UserModel.update(
        {
            profile_image_key: null,
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
