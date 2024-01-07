# Tavi's Bot Template
This project has been designed as a template. It is not meant to be used as a standalone project. If you want to contribute a new default module, create a new branch and pull request. Command pull requests will be ignored, unless they are fixing a bug. When creating a copy, it is recommended that you replace the contents of this README with something else. However, credit is greatly appreciated.

# Table of Contents
1. [Modules](#modules)
   1. [Functions](#functions)
   2. [Events](#events)
   3. [Commands](#commands)
2. [Installation](#installation)
3. [Contributing](#contributing)
   1. [Features](#features)
   2. [Security](#security)
4. [Credits](#credits)
   1. [Contributors](#contributors)

# Modules
This project is designed to be modular. This means that you can add and remove modules as you see fit. The following modules are included by default:
| Module | Description | Path | Authors |
| --- | --- | --- | --- |
| Core Loader | Loads all other modules | `functions/load.ts` | [totallytavi](https://github.com/totallytavi) |
| Sequelize Database | Connects to a MySQL database | `functions/init/database.ts` | [totallytavi](https://github.com/totallytavi) |
| Error Hook | Attaches to common error events and logs them | `functions/init/errorHook.ts` | [totallytavi](https://github.com/totallytavi) |
| Pino Logs | Logs to a JSON file instead of the console | `functions/init/pino.ts` | [totallytavi](https://github.com/totallytavi) |
| Command Loader | Searches in commands folder for commands | `functions/ready/commands.ts` | [totallytavi](https://github.com/totallytavi) |
| Instatus Latency Metric | Posts latency to Instatus | `functions/ready/latency.ts` | [totallytavi](https://github.com/totallytavi) |

Disabling is as simple as renaming the file extension since the core loader scans for `.js` files
> [!TIP]
> Executing a module's content can be done by finding it with `client.TYPE.FOLDER_NAME.get('PATH')` where TYPE is the kind of file it is (Command, function, or event). If a file is in a subdirectory of FOLDER_NAME, it can be found with `FOLDER/FILE`. Do not use extensions

## Functions
The structure for a function module is as follows:

> [!IMPORTANT]
> For events, a different structure is used. See the Events section for more information.

```ts
import { CustomClient } from '../../typings/Extensions.ts';

export const name = 'name';
export async function execute(client: CustomClient, ready: boolean): Promise<void> {
  // Code here
}
```
Ready is a variable that is used to determine whether the bot has finished all loading and is ready to process events. It is usually set to `true` in the command loader. By default it is false so if the command loader is disabled, you must set it to true somewhere else

## Events
Events are not automatically imported. This is to allow you to pick which events you wish to receive. To import an event, create a new file in the `events` folder. The structure for an event is as follows:
> [!TIP]
> If you want to dynamically import events, you can use `client.eventNames()` to get all events the client can emit.
```ts
import { CustomClient } from '../../../typings/Extensions.js';
// You are responsible for importing event typings
import { GuildMember } from 'discord.js';

export const name = 'example';
/**
 * For the sake of an example, let's say that
 * this handler is for guildMemberAdd
 */
export async function execute(
  client: CustomClient, member: GuildMember
): Promise<void> {
  // Logic goes here
}
```
When an event handler is executed, it will be passed all the parameters that the event emits in a spread operator. For example, if the event emits `oldMember, newMember` (like `guildMemberUpdate`), the handler will be passed `client, oldMember, newMember` (Since client is always passed first)

## Commands
All command files must be placed in the `commands` folder. The structure for a command is as follows:
```ts
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { CustomClient } from '../typings/Extensions.js';

export const name = 'commandName';
export const ephemeral = false;
export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription('Description');
export async function run(
  client: CustomClient,
  interaction: ChatInputCommandInteraction,
  options: ChatInputCommandInteraction['options']
): Promise<void> {
  // Code goes here
}
```
The `ephemeral` property is optional and defaults to `false`. If set to `true`, the command will only be visible to the user who ran it.

# Installation
To use this project, you must perform the following steps in order.
1. Clone from GitHub
```bash
git clone https://github.com/totallytavi/BotTemplate.git
```
2. Install dependencies
```bash
npm install
```
3. Duplicate all `prod.json` files in `config`, but remove the `-prod`
4. Fill in all values. You may need to specify the schema to receive proper IntelliSense.
> [!NOTE]
> Failure to provide proper credentials may result in a non-functional bot. Make sure to replace `FILENAME` with the proper file name.
```json
{
  "$schema": "https://raw.githubusercontent.com/totallytavi/BotTemplate/main/src/configs/FILENAME-prod.json"
}
```
5. Compile the files
```bash
npm run build
```
6. Run the bot
```bash
# Node may emit ExperimentalWarning
node index.js --no-warnings
```

# Contributing
## Features
If you wish to contribute, any help is greatly appreciated. Please make sure you're not creating a very specific feature that could only apply to your bot. If you want to add a feature that you think could be useful to others, create a new branch and pull request. For features specific to your bot, consider using the project as a template.

## Security 
If any vulnerabilities are found, please open a private issue. All fixes should be placed in the thread that GitHub opens to keep vulnerabilities private. We will always credit you. Thank you for helping keep this project secure.

# Credits
## Contributors
All contributors are welcome to add themselves as pet to the `.vscode/pets.json` file and list themselves here.
| Name | --- | Profile |
| --- | --- | --- |
| Tavi | --- | [totallytavi](https://github.com/totallytavi) |
