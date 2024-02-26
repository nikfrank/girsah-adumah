const { debugAllCommands, debugAllCommandLengths, debugLongestText } = require('./');

debugAllCommands().then(cmds =>
  console.log('all cmds', cmds)
);

debugAllCommandLengths().then(lens =>
  console.log('cmd lens', lens)
);

debugLongestText().then(l=> console.log('longest', l));
