import type { Sequelize } from 'sequelize';
import { groups as _groups } from './groups.js';
import type { groupsAttributes, groupsCreationAttributes } from './groups.js';
import { patrol as _patrol } from './patrol.js';
import type { patrolAttributes, patrolCreationAttributes } from './patrol.js';
import { proofs as _proofs } from './proofs.js';
import type { proofsAttributes, proofsCreationAttributes } from './proofs.js';

export { _groups as groups, _patrol as patrol, _proofs as proofs };

export type {
  groupsAttributes,
  groupsCreationAttributes,
  patrolAttributes,
  patrolCreationAttributes,
  proofsAttributes,
  proofsCreationAttributes
};

export function initModels(sequelize: Sequelize) {
  const groups = _groups.initModel(sequelize);
  const patrol = _patrol.initModel(sequelize);
  const proofs = _proofs.initModel(sequelize);

  proofs.belongsTo(patrol, { as: 'patrol_patrol', foreignKey: 'patrol' });
  patrol.hasMany(proofs, { as: 'proofs', foreignKey: 'patrol' });

  return {
    groups: groups,
    patrol: patrol,
    proofs: proofs
  };
}
