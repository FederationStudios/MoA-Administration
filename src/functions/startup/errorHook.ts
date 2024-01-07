import { CustomClient } from '../../typings/Extensions.js';
import { toConsole } from '../../functions.js';
import { default as fs } from 'node:fs';

export const name = 'errorHook';
export async function execute(client: CustomClient, ready: boolean): Promise<void> {
  const recentErrors: { promise: Promise<unknown>; reason: string; time: Date }[] = [];
  process.on('uncaughtException', (err, origin) => {
    toConsole(`Uncaught exception: ${err}\n` + `Exception origin: ${origin}`, new Error().stack, client);
  });
  process.on('unhandledRejection', async (reason, promise) => {
    if (!ready) {
      console.warn('Exiting due to a [unhandledRejection] during start up');
      console.error(reason, promise);
      return process.exit(15);
    }
    // Anti-spam System
    if (recentErrors.length > 2) {
      recentErrors.push({ promise, reason: String(reason), time: new Date() });
      recentErrors.shift();
    } else {
      recentErrors.push({ promise, reason: String(reason), time: new Date() });
    }
    // If all three errors are the same, exit
    if (
      recentErrors.length === 3 &&
      recentErrors[0].reason === recentErrors[1].reason &&
      recentErrors[1].reason === recentErrors[2].reason
    ) {
      // Write the error to a file
      fs.writeFileSync(
        './latest-error.log',
        JSON.stringify(
          {
            code: 15,
            info: {
              source: 'Anti spam triggered! Three errors with the same content have occurred recently',
              r: String(promise) + ' <------------> ' + reason
            },
            time: new Date().toString()
          },
          null,
          2
        )
      );
      return process.exit(17);
    }

    toConsole('An [unhandledRejection] has occurred.\n\n> ' + reason, new Error().stack!, client);
  });
  process.on('warning', async (warning) => {
    if (!ready) {
      console.warn('[warning] has occurred during start up');
      console.warn(warning);
    }
    toConsole(`A [warning] has occurred.\n\n> ${warning}`, new Error().stack!, client);
  });
  process.on('exit', (code) => {
    console.error('[EXIT] The process is exiting!');
    console.error(`[EXIT] Code: ${code}`);
  });
  return;
}
