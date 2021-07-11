import { Command, fs, ink, path } from "../deps.ts";

export const init = new Command()
  .description(
    "Creates and empty scripts.json file if one doesn't exist already",
  )
  .action(async () => await initCommand());

async function initCommand() {
  if (await fs.exists("scripts.json")) {
    ink.terminal.log(
      `[<yellow>skipped</yellow>] scripts file already initialized`,
    );
    return;
  }

  const json = JSON.stringify({ scripts: {} }, null, 2);
  await Deno.writeTextFile("scripts.json", `${json}\n`);

  const cwd = await Deno.realPath(Deno.cwd());
  const scriptsInstallDir = path.join(cwd, ".deno");
  const scriptsBinDir = path.join(scriptsInstallDir, "bin");
  await fs.ensureDir(scriptsBinDir);

  ink.terminal.log(
    `[<green>success</green>] scripts file initialized`,
  );
}
