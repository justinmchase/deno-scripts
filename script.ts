import { Command } from "./deps.ts";
import { install, run } from "./commands/mod.ts";

const cmd = new Command()
  .name("script")
  .version("0.1.0")
  .description("Command line framework for Deno")
  .command("install", install)
  .command("run", run);

async function cli(): Promise<void> {
  await cmd.parse(Deno.args);
}

if (import.meta.main) {
  await cli();
}
