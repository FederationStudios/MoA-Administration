import { Sequelize } from 'sequelize';
import { default as db } from '../../configs/db.json' assert { type: 'json' };
import { CustomClient } from '../../typings/Extensions.js';

export const name = 'database';
export async function execute(client: CustomClient, _ready: boolean): Promise<void> {
  // Login to Sequelize
  const sequelize = new Sequelize(db.database, db.user, db.password, {
    host: db.host,
    dialect: 'mysql',
    logging: process.env.environment === 'development' ? client.logs.debug : false,
    port: db.port
  });
  // Load models
  const loader = await import('../../models/init-models.js');
  try {
    await sequelize.authenticate();
    if (loader.initModels) loader.initModels(sequelize);
    await sequelize.sync();
    console.info(`F | ✓ Database connection established`);
  } catch (err) {
    client.logs.warn({ err }, `F | ✘ Failed to create database connection`);
  }
  // Add Sequelize
  client.models = sequelize.models;
  client.sequelize = sequelize;
  return;
}
