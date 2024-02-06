import { ActionRowBuilder, ComponentType, Interaction, Message, StringSelectMenuBuilder } from 'discord.js';
import { groupsAttributes } from '../../models/groups.js';
import { CmdFileArgs } from '../../typings/Extensions.js';

export async function execute({ client, interaction }: CmdFileArgs): Promise<void> {
  // Create filter
  const filter = (m: Message | Interaction) => (m instanceof Message ? m.author.id : m.user.id) === interaction.user.id;
  // Get paginationRow
  const options = [
    { label: 'Add Ally', value: 'add_ally' },
    { label: 'Add Enemy', value: 'add_enemy' },
    { label: 'Add Division', value: 'add_division' },
    { label: 'Remove Ally', value: 'remove_ally' },
    { label: 'Remove Enemy', value: 'remove_enemy' },
    { label: 'Remove Division', value: 'remove_division' }
  ];
  const comp: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder({
    components: [
      new StringSelectMenuBuilder({
        customId: 'manage_groups',
        placeholder: 'Select an option',
        options
      })
    ]
  });
  const opt = await interaction
    .editReply({
      content: 'Select the type of edit you want to perform',
      components: [comp]
    })
    .then((m) => m.awaitMessageComponent({ filter, componentType: ComponentType.StringSelect, time: 10_000 }))
    .catch(() => null);
  if (!opt) {
    await interaction.editReply({ content: 'You took too long to respond!', components: [] });
    return;
  }
  const [creation, state] = opt.values[0].split('_') as ['add' | 'remove', 'ally' | 'enemy' | 'division'];
  let groupId = 0;
  // Loop until we get a valid group ID
  while (groupId === 0) {
    await interaction.editReply({
      content: `What is the ID of the **${state}** group you want to ${creation}?`,
      components: []
    });
    // Collect the message
    const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30_000 });
    if (!collected.size) {
      await interaction.editReply({ content: 'You took too long to respond!' });
      return;
    }
    // Get the message
    const msg = collected.first();
    await msg.fetch(true);
    if (!msg) continue;
    // Cancel logic
    if (msg.content === 'cancel') {
      await interaction.editReply({ content: 'Cancelled!' });
      return;
    }
    // Set group ID and check if NaN
    groupId = Number(msg.content);
    if (Number.isNaN(groupId)) continue;
    if (msg.deletable) msg.delete();
  }
  // Get the group
  const groupData = await fetch(`https://groups.roblox.com/v1/groups/${groupId}`)
    .then((r) => r.json())
    .catch(() => ({ errors: [] }));
  if (groupData.errors) {
    interaction.editReply({
      content: 'Roblox has failed to return data for the requested group. Did you give an active group?'
    });
    return;
  }
  // Add or remove
  if (creation === 'add')
    client.models.groups.upsert({
      groupId,
      state: (state.charAt(0).toUpperCase() + state.slice(1)) as groupsAttributes['state']
    });
  else client.models.groups.destroy({ where: { groupId } });
  // Send confirmation
  interaction.editReply({
    content: `${creation === 'add' ? 'Added' : 'Removed'} "${groupData.name}" on the lists!`
  });
  return;
}
