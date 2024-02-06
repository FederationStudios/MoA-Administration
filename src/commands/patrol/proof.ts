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
  // Check if it has been 19 minutes since last proof logged
  const lastProof = patrol.proofs[patrol.proofs.length - 1] || { createdAt: patrol.start };
  // if (lastProof.createdAt.getTime() + 19 * 60 * 1000 > Date.now()) {
  //   interaction.editReply({
  //     content: 'You have already logged proof in the last 20 minutes! Come back later or end the patrol'
  //   });
  //   return;
  // }
  // If it has been more than 23 minutes, forcefully end the patrol using last proof as end time
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
  // Reply with the patrol ID
  interaction.editReply({
    content: `Proof added to patrol \`${patrol.patrolId}\`. Come back in 20 minutes to log proof!`
  });
}
