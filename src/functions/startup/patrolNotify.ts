import { CustomClient } from '../../typings/Extensions.js';

export const name = 'patrolNotify';
export async function execute(client: CustomClient, _ready: boolean): Promise<void> {
  setInterval(
    async () => {
      const activePatrols = await client.models.patrol.findAll({ where: { end: null } });
      // Check if it has been 20 minutes
      const patrolsToNotify = activePatrols.filter((patrol) => {
        // Generate a last proof time
        const lastProof = patrol.proofs[patrol.proofs.length - 1] || { createdAt: patrol.start };
        return lastProof.createdAt.getTime() + 20 * 60 * 1000 < Date.now();
      });
      // Send the user a message
      for (const patrol of patrolsToNotify) {
        const user = await client.users.fetch(patrol.userId);
        user.send(
          'Hi! Your patrol requires proof to be logged very shortly. Please log your proof or your patrol will be forcefully ended'
        );
      }
    },
    // Every 5 minutes
    5 * 60 * 1000
  );
}
