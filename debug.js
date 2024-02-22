const { debugAllCommands, debugAllCommandLengths } = require('./');

debugAllCommands().then(cmds =>
  console.log(cmds)
);

debugAllCommandLengths().then(lens =>
  console.log(lens)
);
