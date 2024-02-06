import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  Interaction,
  InteractionEditReplyOptions,
  InteractionType
} from 'discord.js';
import { default as config } from './configs/discord.json' assert { type: 'json' };
import { CustomClient } from './typings/Extensions.js';
const { bot } = config;

//#region Enums
enum ResultMessage {
  DatabaseError = 'An error has occurred while communicating with the database',
  Cooldown = 'You are on cooldown!',
  UserPermission = 'You do not have the proper permissions to execute this command',
  BotPermission = 'This bot does not have proper permissions to execute this command',
  BadArgument = 'You have not supplied the correct parameters. Please check again',
  Unknown = 'An unknwon error occurred. Please report this to a developer',
  NotFound = "The requested information wasn't found",
  NoDM = "This command isn't available in Direct Messages. Please run this in a server",
  NonexistentCommand = 'The requested slash command was not found. Please refresh your Discord client and try again',
  Development = 'This command is in development. This should not be expected to work'
}
enum ResultType {
  Success,
  Warning,
  Error,
  Information
}
//#endregion
//#region Types
//#endregion
//#region Functions
/**
 * @async
 * @description Sends a message to the console
 * @example toConsole(`Hello, World!`, new Error().stack, client);
 */
export async function toConsole(message: string, source: string, client: CustomClient): Promise<void> {
  const channel = await client.channels.fetch(config.channels.logs).catch(() => null);
  if (source.split('\n').length < 2)
    return console.error('[ERR] toConsole called but Error.stack was not used\n> Source: ' + source);
  source = /(?:[A-Za-z0-9._]+:[0-9]+:[0-9]+)/.exec(source)![0];
  if (!channel || !channel.isTextBased())
    return console.warn('[WARN] toConsole called but bot cannot find logging channel\n', message, '\n', source);

  await channel.send(`Incoming message from \`${source}\` at <t:${Math.floor(Date.now() / 1000)}:F>`);
  const check = await channel
    .send({
      embeds: [
        new EmbedBuilder({
          title: 'Message to Console',
          color: 0xde2821,
          description: `${message}`,
          timestamp: new Date()
        })
      ]
    })
    .then(() => false)
    .catch(() => true); // Supress errors
  if (check) return console.error(`[ERR] At ${new Date().toString()}, toConsole called but message failed to send`);

  return;
}

/**
 * @async
 * @description Replies with a Embed to the Interaction
 * @example interactionEmbed(1, "", `Removed ${removed} roles`, interaction)
 * @example interactionEmbed(3, `[ERR-UPRM]`, `Missing: \`Manage Messages\``, interaction)
 * @returns {Promise<void>}
 */
export async function interactionEmbed(
  type: ResultType,
  content: ResultMessage | string,
  interaction: Exclude<Interaction, { type: InteractionType.ApplicationCommandAutocomplete }>
): Promise<void> {
  if (!interaction.deferred) await interaction.deferReply();
  const embed = new EmbedBuilder()
    .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL({ size: 4096 })! })
    .setDescription(content)
    .setTimestamp();

  switch (type) {
    case ResultType.Success:
      embed.setTitle('Success').setColor(0x7289da);

      break;
    case ResultType.Warning:
      embed.setTitle('Warning').setColor(0xffa500);

      break;
    case ResultType.Error:
      embed.setTitle('Error').setColor(0xff0000);

      break;
    case ResultType.Information:
      embed.setTitle('Information').setColor(0x7289da);

      break;
  }
  // Utilise invisible character to remove message content
  await interaction.editReply({ content: '​', embeds: [embed] });
  return;
}

export function getEnumKey(enumObj: object, value: number): string | undefined {
  for (const key in enumObj) {
    if (Object.prototype.hasOwnProperty.call(enumObj, key) && enumObj[key] === (value as number)) {
      return key;
    }
  }
  return undefined;
}

/**
 * @async
 */
export async function getRowifi(
  user: string,
  client: CustomClient
): Promise<{ success: false; error: string } | { success: true; roblox: number; username: string }> {
  const discord = await client.users.fetch(user).catch(() => false);
  if (typeof discord === 'boolean') return { success: false, error: 'Invalid Discord user ID' };
  // Fetch their Roblox ID from Rowifi
  const userData = await fetch(`https://api.rowifi.xyz/v2/guilds/${bot.mainServer}/members/${user}`, {
    headers: { Authorization: `Bot ${bot.rowifiApi}` }
  }).then((r: Response) => {
    // If response is not OK, return the error
    if (!r.ok) return { success: false, error: `Rowifi returned status code \`${r.status}\`` };
    // Return the JSON
    return r.json();
  });
  // If success is present, return an error
  if (userData.success !== undefined)
    return {
      success: false,
      error: 'Rowifi failed to return any data! Please check you are signed in with Rowifi'
    };

  // Fetch their Roblox username from the Roblox API
  const roblox = await fetch(`https://users.roblox.com/v1/users/${userData.roblox_id}`).then((r: Response) => r.json());

  // If the Roblox API returns an error, return the error
  if (roblox.errors) return { success: false, error: `\`${roblox.errors[0].message}\`` };
  // Return their roblox ID and username
  return { success: true, roblox: userData.roblox_id, username: roblox.name };
}

export async function paginationRow(
  interaction: Exclude<Interaction, { type: InteractionType.ApplicationCommandAutocomplete }>,
  buttonRows: ButtonBuilder[][],
  args: InteractionEditReplyOptions,
  embeds?: EmbedBuilder[]
): Promise<ButtonInteraction> {
  // Create the row
  const paginationRow: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder({
    components: [
      new ButtonBuilder({ customId: 'prev', style: ButtonStyle.Primary, emoji: '⬅️' }),
      new ButtonBuilder({ customId: 'cancel', style: ButtonStyle.Danger, emoji: '🟥' }),
      new ButtonBuilder({ customId: 'next', style: ButtonStyle.Primary, emoji: '➡️' })
    ]
  });
  // Pair the embed with the buttons
  const rows: [ActionRowBuilder<ButtonBuilder>, EmbedBuilder?][] = buttonRows.map((r, i) => {
    // Create the row
    const row: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder({ components: r });
    // If no embeds exist, just return the row
    if (!embeds) return [row];
    // Else, return the row and the embed
    else return [row, embeds[i]];
  });
  // Configure message
  if (rows.length === 0 || (embeds && embeds.length !== rows.length)) return Promise.reject('No rows were provided');
  let index = 0,
    returnedInteraction;
  if (embeds && embeds.length > 0) args.embeds = [rows[index][1]];
  while (typeof returnedInteraction === 'undefined') {
    // Create message
    const coll = await interaction
      // Edit the reply
      .editReply({
        content: args.content || 'Please select an option below',
        embeds: args.embeds || undefined,
        components: [rows[index][0], paginationRow]
      })
      // Add listener
      .then((m) =>
        m.awaitMessageComponent({
          time: 15_000,
          filter: (i) => i.user.id === interaction.user.id,
          componentType: ComponentType.Button
        })
      )
      // Handle no response
      .catch((e) => e);
    // Check the custom id
    if (coll instanceof Error && coll.name === 'Error [InteractionCollectorError]') {
      returnedInteraction = null; // Timeout
      break;
    } else if (coll instanceof Error) {
      throw coll; // Not an error we can handle
    }
    // Drop the update
    await coll.update({});
    // If it's anything other than
    // next or prev, return it
    if (!/next|prev/.test(coll.customId)) {
      // Return the interaction
      returnedInteraction = coll;
      break;
    }
    // Configure index
    if (coll.customId === 'next') {
      if (index === rows.length - 1) index = 0;
      else index++;
    } else {
      if (index === 0) index = rows.length - 1;
      else index--;
    }
    // Configure message
    if (embeds && embeds.length > 0) args.embeds = [rows[index][1]];
    else args.embeds = [];
    args.components = [rows[index][0], paginationRow];
    // And the loop continues...
  }
  // Remove embeds and components
  await interaction.editReply({ content: args.content || 'Please select an option below', embeds: [], components: [] });
  return Promise.resolve(returnedInteraction);
}
//#endregion
