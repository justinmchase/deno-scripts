import { Command, path } from "../deps.ts";

interface IArgs {
  script: string;
  args?: string[];
}

export const run = new Command()
  .stopEarly()
  .arguments("<script:string> [...args]")
  .description("Runs a script")
  .action(async (_opts, script, args) => {
    await runCommand({ script, args });
  });

async function runCommand({ script, args = [] }: IArgs) {
  const cwd = await Deno.realPath(Deno.cwd());
  const scriptsInstallDir = path.join(cwd, ".deno", "bin");
  const installProcess = Deno.run({
    env: {
      ...Deno.env.toObject(),
      PATH: [scriptsInstallDir, Deno.env.get("PATH")].join(
        Deno.build.os === "windows" ? ";" : ":",
      ),
    },
    cmd: [
      script,
      ...args,
    ],
    stdout: "inherit",
    stderr: "inherit",
  });
  const { code } = await installProcess.status();
  Deno.exit(code);
}
