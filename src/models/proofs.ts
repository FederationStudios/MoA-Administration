import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { patrol, patrolId } from './patrol.js';

export interface proofsAttributes {
  proofId: string;
  patrol: string;
  url: string;
}

export type proofsPk = 'proofId';
export type proofsId = proofs[proofsPk];
export type proofsOptionalAttributes = proofsPk;
export type proofsCreationAttributes = Optional<proofsAttributes, proofsOptionalAttributes>;

export class proofs extends Model<proofsAttributes, proofsCreationAttributes> implements proofsAttributes {
  declare proofId: string;
  declare patrol: string;
  declare url: string;
  declare createdAt: Date;
  declare updatedAt: Date;

  // proofs belongsTo patrol via patrol
  declare patrol_patrol: patrol;
  declare getPatrol_patrol: Sequelize.BelongsToGetAssociationMixin<patrol>;
  declare setPatrol_patrol: Sequelize.BelongsToSetAssociationMixin<patrol, patrolId>;
  declare createPatrol_patrol: Sequelize.BelongsToCreateAssociationMixin<patrol>;

  static initModel(sequelize: Sequelize.Sequelize): typeof proofs {
    return proofs.init(
      {
        proofId: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4
        },
        patrol: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'patrol',
            key: 'patrolId'
          }
        },
        url: {
          type: DataTypes.TEXT,
          allowNull: false
        }
      },
      {
        sequelize,
        tableName: 'proofs',
        timestamps: true,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'proofId' }]
          },
          {
            name: 'FK_proofs_patrol',
            using: 'BTREE',
            fields: [{ name: 'patrol' }]
          }
        ]
      }
    );
  }
}
