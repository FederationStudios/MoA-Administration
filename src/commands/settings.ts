import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { CmdFileArgs } from '../typings/Extensions.js';

export const data = new SlashCommandBuilder()
  .setName('settings')
  .setDescription('Changes configuration of the bot')
  .addStringOption((opt) => {
    return opt
      .setName('setting')
      .setDescription('The setting to change')
      .setChoices(
        {
          name: 'Add Enemy Group',
          value: 'addEnemy'
        },
        {
          name: 'Remove Enemy Group',
          value: 'removeEnemy'
        }
      )
      .setRequired(true);
  })
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles);
export async function execute({ client, interaction, options }: CmdFileArgs): Promise<void> {
  const cmd = client.commands.get(`settings_${options.getString('setting')}`);
  if (!cmd) {
    interaction.editReply({
      content: `The setting \`${options.getString('setting')}\` does not exist!`
    });
    return;
  }
  await cmd.execute({ client, interaction, options });
}
