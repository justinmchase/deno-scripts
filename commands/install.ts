import { Command, fs, ink, path } from "../deps.ts";
import { getScripts } from "./util.ts";
import { IScript, Script } from "./IScript.ts";

interface IInstallOptions {
  force?: boolean;
}

export const install = new Command()
  // .arguments("<source:string> [destination:string]")
  .option("-f, --force", "force reinstall")
  .description("Installs all scripts locally.")
  .action(async (opts) => await installCommand(opts));

function parseScript(script: Script): IScript | undefined {
  if (typeof script === "string") {
    return { url: script };
  } else if (Array.isArray(script)) {
    return undefined;
  } else {
    return script;
  }
}

async function installCommand(opts: IInstallOptions) {
  const { force = false } = opts;
  ink.terminal.log(`[<magenta>install</magenta>] installing scripts...`);
  const scripts = await getScripts();
  if (!scripts) return;

  const cwd = await Deno.realPath(Deno.cwd());
  const scriptsInstallDir = path.join(cwd, ".deno");
  const scriptsBinDir = path.join(scriptsInstallDir, "bin");
  await fs.ensureDir(scriptsBinDir);

  for (const [name, script] of Object.entries(scripts)) {
    const parsed = parseScript(script);
    if (!parsed) continue;
    const { url, permissions = [], args = [] } = parsed;
    const scriptInstallFile = path.join(scriptsInstallDir, "bin", name);
    const scriptExists = await fs.exists(scriptInstallFile);
    if (!force && scriptExists) {
      ink.terminal.log(
        `[<yellow>skip</yellow>] script <cyan>${name}</cyan> already installed`,
      );
      continue;
    }

    const installProcess = Deno.run({
      cmd: [
        Deno.execPath(),
        "install",
        ...force ? ["-f"] : [],
        "--root",
        scriptsInstallDir,
        ...permissions.map((p) => `--${p}`),
        "-n",
        name,
        url,
        ...args,
      ],
      stdout: "null", // todo: pipe to a tmp file in case of error?
      stderr: "inherit",
    });
    const { success, code } = await installProcess.status();
    if (!success) {
      Deno.exit(code);
    } else {
      ink.terminal.log(
        `[<green>success</green>] script <cyan>${name}</cyan> installed successfully`,
      );
    }
  }

  // Delete scripts that no longer exist in the scripts.json file
  for await (const file of Deno.readDir(scriptsBinDir)) {
    if (file.isFile && !scripts[file.name]) {
      const removePath = path.join(scriptsBinDir, file.name)
      await Deno.remove(removePath)
      ink.terminal.log(
        `[<yellow>removed</yellow>] script <cyan>${file.name}</cyan> was uninstalled`,
      );
    }
  }
}
