import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { CustomClient } from '../typings/Extensions.js';

export const name = 'example';
export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription('This is your first command!')
  .addBooleanOption((option) => {
    return option.setName('ephemeral').setDescription('Whether to send the response as an ephemeral message');
  });
export async function run(
  client: CustomClient,
  interaction: ChatInputCommandInteraction,
  options: ChatInputCommandInteraction['options']
): Promise<void> {
  const ephemeral = options.getBoolean('ephemeral') ?? false;
  await interaction.followUp({ content: `${client.user.username} says: 'It works!'`, ephemeral });
}
