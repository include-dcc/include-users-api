import { DataTypes, Model } from 'sequelize';
import sequelizeConnection from '../config';

interface IUserAttributes {
    id: number;
    keycloak_id: string;
    first_name?: string;
    last_name?: string;
    era_commons_id?: string;
    nih_ned_id?: string;
    email?: string;
    linkedin?: string;
    external_individual_fullname?: string;
    external_individual_email?: string;
    roles?: string[];
    affiliation?: string;
    portal_usages?: string[];
    research_area?: string;
    creation_date: Date;
    updated_date: Date;
    consent_date?: Date;
    accepted_terms: boolean;
    understand_disclaimer: boolean;
    commercial_use_reason?: string;
    completed_registration: boolean;
    config?: any;
}

export interface IUserInput extends IUserAttributes {}
export interface IUserOuput extends IUserAttributes {}

class UserModel extends Model<IUserAttributes, IUserInput> implements IUserAttributes {
    public id!: number;
    public keycloak_id!: string;
    public commercial_use_reason!: string;
    public accepted_terms!: boolean;
    public understand_disclaimer!: boolean;
    public completed_registration!: boolean;
    public creation_date!: Date;
    public updated_date!: Date;
}

UserModel.init(
    {
        id: {
            type: DataTypes.NUMBER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        keycloak_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        first_name: DataTypes.STRING,
        last_name: DataTypes.STRING,
        era_commons_id: DataTypes.STRING,
        nih_ned_id: DataTypes.STRING,
        commercial_use_reason: DataTypes.STRING,
        email: DataTypes.STRING,
        external_individual_fullname: DataTypes.TEXT,
        external_individual_email: DataTypes.TEXT,
        roles: DataTypes.ARRAY(DataTypes.TEXT),
        affiliation: DataTypes.TEXT,
        portal_usages: DataTypes.ARRAY(DataTypes.TEXT),
        research_area: DataTypes.TEXT,
        creation_date: {
            type: DataTypes.DATE,
            defaultValue: new Date(),
        },
        updated_date: {
            type: DataTypes.DATE,
            defaultValue: new Date(),
        },
        consent_date: DataTypes.DATE,
        accepted_terms: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        understand_disclaimer: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        completed_registration: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        config: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {},
        },
    },
    { sequelize: sequelizeConnection, modelName: 'users', timestamps: false },
);

export default UserModel;
