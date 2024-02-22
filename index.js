const fs = require('fs').promises;

const { exec } = require('child_process');

const noXcommands = [
  'incbin',
  'ld',
  'cp',
  'lb',
  'include',
  'add',
  'load',
  'vc_assert',
  'section',
  'charmap',
  'if',
  'elif',
  'vc_const',
  'assert',
  'def',
  'redef',
  'fail',
];

const fn = 1102; // data/text/text_1.asm (_OaksAideHereYouGoText)
// const fn = 1205; // battle/code.asm
//const fn = 1318; // main_menu
//const fn = 1800; // poke tower 6f

const readPlayerStrings = async ()=>{
  // read all files
  //  -- filter this list by files with player facing text

  const files = (await (new Promise((s,j)=>
    exec('tree -fi ../pokered | grep asm', (err, stdout, stderr) => {
      if (err) return j(err);
      else return s(stdout);
    })
  ))).split('\n');

  // console.log(files[fn]);
  // console.log(files.slice(1800, 1810), files.findIndex(n=> (n.includes('text_1'))));
  // return;
  let blocks = [];
  const blockIndex = {};

  const setBlock = (filename, label, command, lineNumber)=>{
    // console.log(filename, label, lineNumber, command);
    
    let existingBlock = blocks[
      (blockIndex[filename]||{})[label]
    ];

    if( !existingBlock ){
      blocks = [...blocks, { filename, label, commands: [] }];

      blockIndex[filename] = blockIndex[filename] || {};
      blockIndex[filename][label] = blocks.length - 1;

      existingBlock = blocks[
        blockIndex[filename][label]
      ];
    }

    // console.log(existingBlock);

    existingBlock.commands = [
      ...existingBlock.commands,
      {
        filename, label, command, lineNumber
      },
    ];
  };
  
  // read all strings from such files

  await Promise.all( files
    .filter(i=>i)
    //.slice(fn, fn+6)
    .map(async (file)=>{
      const content = await fs.readFile(file, { encoding: 'utf-8' });
      // console.log(content);

      let label, labelLOC, prevLabel, routine, routineLOC;
      
      content.split('\n').forEach(async (line, ln)=>{
        const nextLabel = line.match(/^\w+\:/);
        if(nextLabel){
          label = nextLabel[0];
          labelLOC = ln;
          routine = '';
          routineLOC = -1;
        }

        const nextRoutine = line.match(/^\.\w+$/);
        if(nextRoutine){
          routine = nextRoutine[0];
          routineLOC = ln;
        }

        const genCommand = line.match(/^\s*(\w+)/);

        if(
          genCommand && noXcommands
            .find(cmd => cmd.toLowerCase() === genCommand[1].toLowerCase())
        ) return;
        
        const text = line.match(/^\s*(?:\w+\:\s+)?(\w+)\s+[^;]*\"(.*)\".*$/);

        if(
          text ||
          (genCommand && !genCommand[1].indexOf('text'))
        ){
          // if(label !== prevLabel) console.log(label);
          prevLabel = label;        
        }
        
        if(text) {
          const [l, command, str] = text;
          
          // if(routine) console.log(routine);
          setBlock(file, label, [command, str], ln);
        } else if(genCommand && !genCommand[1].indexOf('text')){
          setBlock(file, label, [genCommand[1]], ln);
        }
      });
    })
  );
  
  // write them to a file in the JSON format to be used later
  // in the translations directory
  
  await fs.writeFile('./translation/blocks.json', JSON.stringify(
    blocks, null, 2
  ));

};

const renderGameInHebrew = ()=>{

  // (later, add support for gender selection at render)

  // make the diffs for font, other png files

  // make the diff for rtl support (remove typewriter / use from github)
  
  // read the translation files
  // loop through each of them, using child-process sed to replace strings

  // child-process make
  // copy the gbc file to the translations directory

  // put all the files back how they were (git? untranslate? tmp copies?)
};

module.exports = {
  readPlayerStrings,
};
