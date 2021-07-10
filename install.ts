import { Command } from './deps.ts'

const cmd = new Command()
  .name("script")
  .version("0.1.0")
  .description("Command line framework for Deno")
  

async function cli(): Promise<void> {

  await cmd.parse(Deno.args);
}

if (import.meta.main) {
  await cli()
}
