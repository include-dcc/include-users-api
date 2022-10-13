import { DataTypes, Model } from 'sequelize';
import sequelizeConnection from '../config';

interface IUserSetAttributes {
    id: string;
    keycloak_id: string;
    content: any;
    alias: string;
    sharedpublicly: boolean;
    creation_date: Date;
    updated_date: Date;
}

export interface IUserSetsInput extends IUserSetAttributes {}
export interface IUserSetsOutput extends IUserSetAttributes {}

class UserSetModel extends Model<IUserSetAttributes, IUserSetsInput> implements IUserSetAttributes {
    public id!: string;
    public keycloak_id!: string;
    public content!: any;
    public alias!: string;
    public sharedpublicly!: boolean;
    public creation_date!: Date;
    public updated_date!: Date;
}

UserSetModel.init(
    {
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        keycloak_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        alias: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        sharedpublicly: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        content: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {},
        },
        creation_date: {
            type: DataTypes.DATE,
            defaultValue: new Date(),
        },
        updated_date: {
            type: DataTypes.DATE,
            defaultValue: new Date(),
        },
    },
    { sequelize: sequelizeConnection, modelName: 'user_sets', timestamps: false },
);

export default UserSetModel;
