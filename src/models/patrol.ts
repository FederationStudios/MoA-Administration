import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { proofs, proofsId } from './proofs.js';

export interface patrolAttributes {
  patrolId: string;
  userId: string;
  roblox: number;
  start: Date;
  end?: Date;
}

export type patrolPk = 'patrolId';
export type patrolId = patrol[patrolPk];
export type patrolOptionalAttributes = patrolPk | 'start' | 'end';
export type patrolCreationAttributes = Optional<patrolAttributes, patrolOptionalAttributes>;

export class patrol extends Model<patrolAttributes, patrolCreationAttributes> implements patrolAttributes {
  declare patrolId: string;
  declare userId: string;
  declare roblox: number;
  declare start: Date;
  declare end?: Date;
  declare createdAt: Date;
  declare updatedAt: Date;

  // patrol hasMany proofs via patrol
  declare proofs: proofs[];
  declare getProofs: Sequelize.HasManyGetAssociationsMixin<proofs>;
  declare setProofs: Sequelize.HasManySetAssociationsMixin<proofs, proofsId>;
  declare addProof: Sequelize.HasManyAddAssociationMixin<proofs, proofsId>;
  declare addProofs: Sequelize.HasManyAddAssociationsMixin<proofs, proofsId>;
  declare createProof: Sequelize.HasManyCreateAssociationMixin<proofs>;
  declare removeProof: Sequelize.HasManyRemoveAssociationMixin<proofs, proofsId>;
  declare removeProofs: Sequelize.HasManyRemoveAssociationsMixin<proofs, proofsId>;
  declare hasProof: Sequelize.HasManyHasAssociationMixin<proofs, proofsId>;
  declare hasProofs: Sequelize.HasManyHasAssociationsMixin<proofs, proofsId>;
  declare countProofs: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof patrol {
    return patrol.init(
      {
        patrolId: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4
        },
        userId: {
          type: DataTypes.CHAR(25),
          allowNull: false
        },
        roblox: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        start: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.Sequelize.fn('now')
        },
        end: {
          type: DataTypes.DATE,
          allowNull: true
        }
      },
      {
        sequelize,
        tableName: 'patrol',
        timestamps: true,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'patrolId' }]
          }
        ]
      }
    );
  }
}
