import { Message } from 'discord.js';
import { CmdFileArgs, SettingsJSON } from '../../typings/Extensions.js';
import { default as fs } from 'node:fs';

export async function execute({ interaction }: CmdFileArgs): Promise<void> {
  // Create filter
  const filter = (m: Message) => m.author.id === interaction.user.id;
  let groupId = 0;
  // Loop until we get a valid group ID
  while (groupId === 0) {
    await interaction.editReply({ content: 'What is the ID of the group you want to remove **as an enemy**?' });
    // Collect the message
    const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30_000 });
    if (!collected.size) {
      await interaction.editReply({ content: 'You took too long to respond!' });
      return;
    }
    // Get the message
    const msg = collected.first();
    if (!msg) continue;
    // Cancel logic
    if (msg.content === 'cancel') {
      await interaction.editReply({ content: 'Cancelled!' });
      return;
    }
    // Set group ID and check if NaN
    groupId = Number(msg.content);
    if (isNaN(groupId)) continue;
  }
  // Get the group
  const groupData = await fetch(`https://groups.roblox.com/v1/groups/${groupId}`).then((r) => r.json());
  if (groupData.errors) {
    interaction.editReply({
      content: 'Roblox has failed to return data for the requested group. Did you give an active group?'
    });
    return;
  }
  // Pull JSON
  const groupJson: SettingsJSON = JSON.parse(fs.readFileSync('./configs/groups.json', 'utf-8'));
  if (!groupJson.groups.enemies.includes(groupId)) {
    interaction.editReply({ content: 'That group does not exist in the enemies list!' });
    return;
  }
  // Add group to enemies
  groupJson.groups.enemies.splice(groupJson.groups.enemies.indexOf(groupId), 1);
  fs.writeFileSync('./configs/groups.json', JSON.stringify(groupJson, null, 2));
  // Send confirmation
  interaction.editReply({
    content: `Removed ${groupData.name} to the enemies list!`
  });
  return;
}
