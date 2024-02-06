import { getRowifi } from '../../functions.js';
import { CmdFileArgs } from '../../typings/Extensions.js';

export async function execute({ client, interaction, options }: CmdFileArgs): Promise<void> {
  // Get Rowifi
  const rowifi = await getRowifi(interaction.user.id, client);
  if (rowifi.success === false) {
    interaction.editReply({ content: rowifi.error });
    return;
  }
  // Patrol
  const patrol = await client.models.patrol.findOne({
    where: { userId: interaction.user.id, end: null },
    include: { model: client.models.proofs, as: 'proofs' }
  });
  if (!patrol) {
    interaction.editReply({ content: 'You do not have an active patrol!' });
    return;
  }
  // If it has been more than 23 minutes, forcefully end the patrol using last proof as end time
  const lastProof = patrol.proofs[patrol.proofs.length - 1] || { createdAt: patrol.start };
  if (lastProof.createdAt.getTime() + 23 * 60 * 1000 < Date.now()) {
    interaction.editReply({ content: 'You failed to log your proof in time. Your patrol has been forcefully ended' });
    await client.functions.get('utils_endPatrol').execute(client, patrol.userId, rowifi.roblox);
    return;
  }
  // Ask for proof
  const [valid, url] = (await client.functions.get('utils_moveProof').execute(client, options)) as [boolean, string];
  if (!valid) {
    interaction.editReply({ content: url });
    return;
  }
  // Add proof
  const p = await client.models.proofs
    .create({
      patrol: patrol.patrolId,
      url: url
    })
    .catch(() => null);
  if (!p) {
    interaction.editReply({ content: 'Database failed to accept proof. Please try again' });
    return;
  }
  // For all proofs, check if there's an attachment
  // If none or we can't find message, forcefully end
  // Otherwise add URL for logging
  const [success, message] = (await client.functions
    .get('utils_endPatrol')
    .execute(client, rowifi.roblox, interaction.user.id)) as [boolean, string];
  // Reply with success
  if (!success) {
    interaction.editReply({ content: message });
    return;
  } else {
    interaction.editReply({ content: 'Proof logged successfully and patrol ended' });
  }
}
