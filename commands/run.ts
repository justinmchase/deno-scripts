import { Command, ink, path } from "../deps.ts";
import { getScripts } from "./util.ts";

interface IArgs {
  name: string;
  opts?: Record<string, unknown>;
  args?: string[];
}

export const run = new Command()
  .stopEarly()
  .option("-d, --directory <directory:string>", "The working directory to use when running the script.")
  .arguments("<script:string> [...args]")
  .description("Runs a script")
  .action(async (opts, script, args) => {
    await runCommand({ name: script, opts, args });
  });

async function runScript(name: string, opts: Record<string, unknown>, args: string[]): Promise<number> {
  const cwd = await Deno.realPath(Deno.cwd());
  const scriptsInstallDir = path.join(cwd, ".deno");
  const scriptsBinDir = path.join(scriptsInstallDir, "bin");
  const runDir = opts.directory ? opts.directory as string : cwd
  const runProcess = Deno.run({
    cwd: runDir,
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
  const { code } = await runProcess.status();
  return code;
}

async function runScripts(scripts: string[], opts: Record<string, unknown>): Promise<number> {
  for (const script of scripts) {
    const code = await runScript(script, opts, []);
    if (code !== 0) return code;
  }

  return 0;
}

async function runCommand({ name, opts = {}, args = [] }: IArgs) {
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
    ? await runScripts(script, opts)
    : await runScript(name, opts, args);

  Deno.exit(code);
}
