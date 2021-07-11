# Deno Scripts 🦕

## Local Development

```sh
deno run --unstable -A --watch install.ts install
```

To install it

```sh
deno install -f --unstable --allow-read --allow-env --allow-run -n script ./install.ts
script install
```

Increment version

```sh
deno run -A https://deno.land/x/version/index.ts patch
```
