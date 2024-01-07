import { ChatInputCommandInteraction } from 'discord.js';
import { CustomClient } from '../../../typings/Extensions.js';

export const name = 'command';
export async function execute(client: CustomClient<true>, interaction: ChatInputCommandInteraction) {
  if (!interaction.isChatInputCommand()) return;
  // Create name for command
  const name = interaction.commandName.replace('d_', '');
  // Get command
  const cmd = client.commands.get(name);
  if (!cmd) return;
  await interaction.deferReply({ ephemeral: cmd.ephemeral || false });
  // Run command
  try {
    cmd.execute({ client, interaction, options: interaction.options });
  } catch (err) {
    interaction.editReply({ content: 'Something went wrong while replying! This error has been logged' });
    client.logs.error({ msg: `E | ✘ ${name}`, err });
  }
}
