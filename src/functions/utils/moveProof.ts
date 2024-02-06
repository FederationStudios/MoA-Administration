import { CommandInteractionOptionResolver } from 'discord.js';
import { CustomClient } from '../../typings/Extensions.js';
import { default as config } from '../../configs/discord.json' assert { type: 'json' };
const { channels } = config;

export async function execute(
  client: CustomClient,
  options: CommandInteractionOptionResolver
): Promise<[boolean, string]> {
  const attachment = options.getAttachment('proof', true);
  if (!attachment) {
    return [false, 'No proof'];
  }
  if (!attachment.contentType.includes('image')) {
    return [false, 'Invalid proof format'];
  }
  // Upload the proof to another channel
  const c = await client.channels.fetch(channels.image);
  if (!c.isTextBased()) {
    return [false, 'Invalid channel'];
  }
  const message = await c
    .send({ content: `Proof for patrol`, files: [attachment] })
    .catch(() => 'Discord returned an error. Check if your file is large!');
  // Return the URL or the error
  return [typeof message !== 'string', typeof message === 'string' ? message : message.url];
}
