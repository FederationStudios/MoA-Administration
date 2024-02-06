import { SlashCommandBuilder } from 'discord.js';
import { CmdFileArgs } from '../typings/Extensions.js';

export const data = new SlashCommandBuilder()
  .setName('patrol')
  .setDescription('Start, log proof for, or end a patrol')
  .addSubcommand((sc) => sc.setName('start').setDescription('Begins a patrol'))
  .addSubcommand((sc) =>
    sc
      .setName('proof')
      .setDescription('Adds proof for a patrol')
      .addAttachmentOption((o) =>
        o.setName('proof').setDescription('Image containing the leaderboard AND time').setRequired(true)
      )
  )
  .addSubcommand((sc) =>
    sc
      .setName('end')
      .setDescription('Ends a patrol')
      .addAttachmentOption((o) =>
        o.setName('proof').setDescription('Image containing the leaderboard AND time').setRequired(true)
      )
  );
export async function execute({ client, interaction, options }: CmdFileArgs): Promise<void> {
  // Sanity check
  const cmd = client.commands.get(`patrol_${options.getSubcommand(true)}`);
  if (!cmd) {
    interaction.editReply({
      content: `The patrol option \`${options.getSubcommand(true)}\` does not exist!`
    });
    return;
  }
  // Execute the command
  await cmd.execute({ client, interaction, options });
}
