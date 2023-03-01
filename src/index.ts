import { Builtins, Cli } from "clipanion";

import * as Commands from "./commands";

const [node, app, ...args] = process.argv;

const cli = new Cli({
  binaryLabel: `Bookshelf cli`,
  binaryName: `${node} ${app}`,
  binaryVersion: `0.1.0`,
});

cli.register(Builtins.DefinitionsCommand);
cli.register(Builtins.HelpCommand);
cli.register(Commands.CollectCommand);
cli.runExit(args);
