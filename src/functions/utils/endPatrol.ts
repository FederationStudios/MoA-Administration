import { Attachment } from 'discord.js';
import { CustomClient } from '../../typings/Extensions.js';
import { default as config } from '../../configs/discord.json' assert { 'type': 'json' };

export async function execute(client: CustomClient, roblox: number, discord: string): Promise<[boolean, string]> {
  // Find the patrol
  const patrol = await client.models.patrol.findOne({
    where: { userId: discord, roblox, end: null },
    include: { model: client.models.proofs, as: 'proofs' }
  });
  if (!patrol) return [false, 'No patrol found'];
  // If it has been more than 23 minutes, forcefully end the patrol using last proof as end time
  const lastProof = patrol.proofs[patrol.proofs.length - 1] || { createdAt: patrol.start };
  if (lastProof.createdAt.getTime() + 23 * 60 * 1000 < Date.now()) {
    await patrol.update({ end: lastProof.createdAt });
  } else {
    await patrol.update({ end: new Date() });
  }
  // Fetch all proof
  const proofs = (await client.models.proofs.findAll({ where: { patrol: patrol.patrolId } }))
    // Reduce to URLs
    .map((p) => p.url)
    // Fetch the association proof
    .map(async (p) => {
      const c = await client.channels.fetch(p.split('/')[5]);
      if (!c.isTextBased()) return;
      const message = await c.messages.fetch(p.split('/')[6]).catch(() => null);
      if (!message) return;
      return message.attachments.first();
    })
    .filter((p) => p !== undefined) as Promise<Attachment>[];
  if (proofs.length !== patrol.proofs.length) return [false, 'Not all proof could be found'];
  // Reduce to 10 attachments per message
  const proofForMessages: Attachment[][] = [];
  const list = [];
  for (const proof of proofs) {
    // Push to list
    list.push(await proof);
    // If there's 10 attachments, push to array and reset
    if (list.length % 10 == 0) {
      proofForMessages.push(list);
      list.length = 0;
    }
  }
  // The loop will in theory, never push it to the array
  // So we'll do it here
  if (list.length > 0) proofForMessages.push(list);
  // Send the proof
  const c = await client.channels.fetch(config.channels.logs);
  if (!c.isTextBased()) return [false, 'Could not find logs channel'];
  c.send({
    content: `A patrol has ended for <@${discord}>`,
    embeds: [
      {
        title: 'Patrol Log',
        description: `Patrol ID: \`${patrol.patrolId}\`\nPatrol Start: <t:${Math.floor(
          patrol.start.getTime() / 1000
        )}:R>\nPatrol End: <t:${Math.floor(patrol.end.getTime() / 1000)}:R>\nPatrol Duration: \`${Math.floor(
          (patrol.end.getTime() - patrol.start.getTime()) / 1000 / 60
        )} minutes\``
      }
    ]
  });
  for (const proof of proofForMessages) {
    c.send({ content: `Proof for \`${patrol.patrolId}\``, files: proof });
  }
  return [true, 'Patrol ended successfully'];
}
