import { SlashCommandBuilder } from 'discord.js';
import { CmdFileArgs } from '../typings/Extensions.js';
import { RobloxGroupUserData, RobloxUserData } from '../typings/RobloxTypes.js';

export const data = new SlashCommandBuilder()
  .setName('userinfo')
  .setDescription('Get information about a Roblox user')
  .addStringOption((opt) => {
    return opt.setName('user').setDescription('The user to get information about').setRequired(true);
  });
export async function execute({ client, interaction, options }: CmdFileArgs): Promise<void> {
  // Get Roblox user
  let user: number = options.getString('user', true) as unknown as number;
  // Convert from username to id
  // deepcode ignore UseNumberIsNan: Number.isNaN does not attempt to convert to number
  if (isNaN(user)) {
    user = await fetch(`https://users.roblox.com/v1/usernames/users`, {
      method: 'POST',
      body: JSON.stringify({
        usernames: [options.getString('user', true)]
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      // Parse and throw on error
      .then((res) => res.json())
      .then((r) => {
        if (r.errors) throw new Error(r.errors);
        return r.data[0].id;
      })
      .catch(() => null);
    // No user or error
    if (!user) {
      interaction.editReply({
        content: `Interpreted \`${options.getString('user', true)}\` as username but found no user`
      });
      return;
    }
  }
  const roblox: RobloxUserData = await fetch(`https://users.roblox.com/v1/users/${user}`)
    // Parse and throw on error
    .then((res) => res.json())
    .then((r) => {
      if (r.errors) throw new Error(r.errors);
      return r;
    })
    .catch(() => null);
  // No user or error
  if (!user) {
    interaction.editReply({
      content: `Interpreted \`${user}\` as ID but found no user`
    });
    return;
  }
  // Get group roles
  const groups: { data: RobloxGroupUserData[] } = await fetch(`https://groups.roblox.com/v1/users/${user}/groups/roles`)
    // Parse and throw on error
    .then((res) => res.json())
    .then((r) => {
      if (r.errors) throw new Error(r.errors);
      return r;
    })
    .catch(() => null);
  if (!groups) {
    interaction.editReply({
      content: `Roblox is temporarily down. Please try again later`
    });
    return;
  }
  // Get DB groups
  const db = await client.models.groups.findAll();
  // Create an array with the same length as groups, but empty strings
  const strGroups = groups.data.map(() => '');
  // Append groups until reaching 2048 characters
  const dbGroups = strGroups.reduce((p, _c, i) => {
    const rGrp = groups.data[i];
    const grp = db.find((g) => g.groupId === rGrp.group.id);
    const parts = p.split('~~~~');
    // Reset length
    if (parts[parts.length - 1].length > 2048) p = p + '~~~~';
    // Append group
    if (grp) {
      p += `${grp.state === 'Ally' ? '✅' : grp.state === 'Division' ? '🌐' : '⚠️'} - `;
    } else {
      p += `⬜ - `;
    }
    p += `${rGrp.group.name} (${rGrp.group.id})\n`;
    return p;
  });
  // Return found data
  const embed = {
    title: `${roblox.name} "${roblox.displayName}"`,
    fields: [
      {
        name: 'ID',
        value: String(roblox.id),
        inline: true
      },
      {
        name: 'Age',
        value: `${Math.floor((Date.now() - new Date(roblox.created).getTime()) / 1000 / 60 / 60 / 24)} days`,
        inline: true
      },
      {
        name: 'Created At',
        value: `<t:${Math.floor(new Date(roblox.created).getTime() / 1000)}:F>`,
        inline: true
      }
    ]
  };
  // Add groups if any
  for (const v of dbGroups.split('~~~~')) {
    if (v.length > 0) embed.fields.push({ name: 'Groups', value: v, inline: false });
  }
  // Respond
  interaction.editReply({ embeds: [embed] });
}
