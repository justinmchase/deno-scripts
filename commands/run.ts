import { Command, ink, path } from "../deps.ts";
import { getScripts } from "./util.ts";

interface IArgs {
  name: string;
  args?: string[];
}

export const run = new Command()
  .stopEarly()
  .arguments("<script:string> [...args]")
  .description("Runs a script")
  .action(async (_opts, script, args) => {
    await runCommand({ name: script, args });
  });

async function runScript(name: string, args: string[]): Promise<number> {
  const cwd = await Deno.realPath(Deno.cwd());
  const scriptsInstallDir = path.join(cwd, ".deno");
  const scriptsBinDir = path.join(scriptsInstallDir, "bin");
  const installProcess = Deno.run({
    env: {
      ...Deno.env.toObject(),
      PATH: [scriptsBinDir, Deno.env.get("PATH")].join(
        Deno.build.os === "windows" ? ";" : ":",
      ),
    },
    cmd: [
      name,
      ...args,
    ],
    stdout: "inherit",
    stderr: "inherit",
  });
  const { code } = await installProcess.status();
  return code;
}

async function runScripts(scripts: string[]): Promise<number> {
  for (const script of scripts) {
    const code = await runScript(script, []);
    if (code !== 0) return code;
  }

  return 0;
}

async function runCommand({ name, args = [] }: IArgs) {
  const scripts = await getScripts();
  if (!scripts) return;

  const script = scripts[name];
  if (!script) {
    ink.terminal.error(
      `[<red>error</red> The script named ${name} was not found in scripts.json`,
    );
    return;
  }

  const code = Array.isArray(script)
    ? await runScripts(script)
    : await runScript(name, args);

  Deno.exit(code);
}
