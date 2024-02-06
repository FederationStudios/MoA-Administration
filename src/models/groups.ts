import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface groupsAttributes {
  groupId: number;
  state: 'Ally' | 'Enemy' | 'Division';
}

export type groupsOptionalAttributes = null;
export type groupsCreationAttributes = Optional<groupsAttributes, groupsOptionalAttributes>;

export class groups extends Model<groupsAttributes, groupsCreationAttributes> implements groupsAttributes {
  declare groupId: number;
  declare state: 'Ally' | 'Enemy' | 'Division';
  declare createdAt: Date;
  declare updatedAt: Date;

  static initModel(sequelize: Sequelize.Sequelize): typeof groups {
    return groups.init(
      {
        groupId: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        state: {
          type: "SET('Ally','Enemy','Division')",
          allowNull: false
        }
      },
      {
        sequelize,
        tableName: 'groups',
        timestamps: true
      }
    );
  }
}
