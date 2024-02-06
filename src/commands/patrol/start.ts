import { default as config } from '../../configs/discord.json' assert { type: 'json' };
import { getRowifi } from '../../functions.js';
import { CmdFileArgs } from '../../typings/Extensions.js';
import { RobloxGroupUserData } from '../../typings/RobloxTypes.js';
const { roblox } = config;

export async function execute({ client, interaction }: CmdFileArgs): Promise<void> {
  // Get Rowifi
  const rowifi = await getRowifi(interaction.user.id, client);
  if (rowifi.success === false) {
    interaction.editReply({ content: rowifi.error });
    return;
  }
  // Patrol
  const patrol = await client.models.patrol.findAll({ where: { userId: interaction.user.id, end: null } });
  if (patrol.length > 0) {
    interaction.editReply({ content: 'You already have an active patrol! End it before starting a new one' });
    return;
  }
  // Test for group rank
  const gData: { data: RobloxGroupUserData[] } = await fetch(
    `https://groups.roblox.com/v1/users/${rowifi.roblox}/groups/roles`
  )
    .then((r) => r.json())
    .then((b) => {
      if (b.errors) throw b.errors;
      return b;
    })
    .catch(() => null);
  if (!gData) {
    interaction.editReply({ content: 'Roblox API failure. Please retry later' });
    return;
  }
  // Test all binds
  if (!roblox.binds.some((bind) => gData.data.some((d) => d.group.id === bind[0] && d.role.rank >= bind[1]))) {
    interaction.editReply({ content: 'You are not in any groups that allow patrols' });
    return;
  }
  // Create a patrol
  const p = await client.models.patrol.create({
    userId: interaction.user.id,
    roblox: rowifi.roblox,
    start: new Date()
  });
  if (!p) {
    interaction.editReply({ content: 'Database error. Please retry later' });
    return;
  }
  // Reply with the patrol ID
  interaction.editReply({
    content: `Patrol started with ID \`${p.patrolId}\`. Come back in 20 minutes to log proof!`
  });
}
