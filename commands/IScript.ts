export type Script = IScript | string | string[];
export interface IScript {
  url: string;
  permissions?: string[];
  args?: string[];
}
