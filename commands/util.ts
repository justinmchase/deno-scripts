import { ink } from "../deps.ts";
import { Script } from "./IScript.ts";

export async function getScripts(): Promise<
  Record<string, Script> | undefined
> {
  try {
    const decoder = new TextDecoder("utf-8");
    const scriptsContent = await Deno.readFile("scripts.json");
    const scriptsJson = decoder.decode(scriptsContent);
    const { scripts } = JSON.parse(scriptsJson.toString());
    return scripts;
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      ink.terminal.log(
        `[<yellow>warn</yellow>] scripts.json was not found`,
      );
      return undefined;
    } else {
      ink.terminal.log(
        `[<red>error</red>] ${err.message}`,
      );
      return undefined;
    }
  }
}
