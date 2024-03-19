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
  'println',
  'text_far',
];

const fn = 1446; //../pokered/home/text.asm
//const fn = 397; // ../pokered/constants/item_constants.asm
// const fn = 1203; // ../pokered/engine/battle/battle_transitions.asm
// const fn = 1102; // data/text/text_1.asm (_OaksAideHereYouGoText)
// const fn = 1205; // battle/code.asm
//const fn = 1318; // main_menu
//const fn = 1800; // poke tower 6f

const readPlayerStrings = async ()=>{

  // assert git status clean
  const gitStatus = (await (new Promise((s,j)=>
    exec('cd ../pokered && git status', (err, stdout, stderr) => {
      if (err) return j(err);
      else return s(stdout);
    })
  ))).split('\n');

  if( gitStatus[1] !== 'nothing to commit, working tree clean' ) return;

  // save prev branch name

  const prevBranch = gitStatus[0].split(' ')[2];
  
  // checkout master

  (await (new Promise((s,j)=>
    exec('cd ../pokered && git checkout master', (err, stdout, stderr) => {
      if (err) return j(err);
      else return s(stdout);
    })
  )));

  // (at the end, checkout the prev branch)
  
  // read all files
  //  -- filter this list by files with player facing text

  const files = (await (new Promise((s,j)=>
    exec('tree -fi ../pokered | grep asm', (err, stdout, stderr) => {
      if (err) return j(err);
      else return s(stdout);
    })
  ))).split('\n');

  // console.log(files[fn]);
  //console.log(files.slice(1800, 1810), files.findIndex(n=> (n.includes('../pokered/home/text.asm'))));
  //return;
  let blocks = [];
  const blockIndex = {};

  const setBlock = (file, label, command, lineNumber)=>{
    // console.log(file, label, lineNumber, command);
    
    let existingBlock = blocks[
      (blockIndex[file]||{})[label]
    ];

    if( !existingBlock ){
      blocks = [...blocks, { file, label, cmds: [] }];

      blockIndex[file] = blockIndex[file] || {};
      blockIndex[file][label] = blocks.length - 1;

      existingBlock = blocks[
        blockIndex[file][label]
      ];
    }

    // console.log(existingBlock);

    existingBlock.cmds = [
      ...existingBlock.cmds,
      {
        cmd: command, ln: lineNumber
      },
    ];
  };
  
  // read all strings from such files

  await Promise.all( files
    .filter(i=>i)
    //.slice(fn, fn+1)
    .map(async (file)=>{
      const content = await fs.readFile(file, { encoding: 'utf-8' });
      // console.log(content);

      let label, labelLOC, prevLabel, routine, routineLOC, postLabel;
      
      content.split('\n').forEach(async (line, ln)=>{
        postLabel = line;
        
        const nextLabel = line.match(/^\.?\w+\:/);
        if(nextLabel){
          label = nextLabel[0].slice(0,-1);
          labelLOC = ln;
          routine = '';
          routineLOC = -1;

          postLabel = line.substr(label.length+1);
        }

        postLabel = postLabel.split(';')[0];

        const nextRoutine = postLabel.match(/^\.\w+$/);
        if(nextRoutine){
          routine = nextRoutine[0];
          routineLOC = ln;
        }

        const genCommand = postLabel.match(/(?:\w+:)?\s*(\w+)/);

        if(
          genCommand && (
            ~noXcommands.indexOf(genCommand[1].toLowerCase())
          )
        ) return;
        
        const text = line.match(/^\s*(?:\w+\::?\s+)?(\w+)\s+[^;]*\"(.*)\".*$/);

        if(
          text ||
          (genCommand && !genCommand[1].indexOf('text_'))
        ){
          // if(label !== prevLabel) console.log(label);
          prevLabel = label;        
        }
        
        if(text) {
          const [l, command, str] = text;
          
          // if(routine) console.log(routine);
          if(str !== '@') setBlock(file, label, [command, str], ln+1);
        } else if(genCommand && !genCommand[1].indexOf('text_')){
          setBlock(file, label, [genCommand[1]], ln+1);
        }
      });
    })
  );
  
  // write them to a file in the JSON format to be used later
  // in the translations directory
  
  await fs.writeFile('./translation/blocks.json', JSON.stringify(
    blocks
      .filter(block => block.cmds.find(({cmd})=> cmd[1])),
    null, 2
  ));

  console.log( blocks.length );

  (await (new Promise((s,j)=>
    exec('cd ../pokered && git checkout '+prevBranch, (err, stdout, stderr) => {
      if (err) return j(err);
      else return s(stdout);
    })
  )));
  
};

const renderGameInHebrew = async ()=>{

  // (later, add support for gender selection at render)

  // diffs for font, other png files in ./hebrew-support.patch

  // assert git status clean
  let gitStatus = (await (new Promise((s,j)=>
    exec('cd ../pokered && git status', (err, stdout, stderr) => {
      if (err) return j(err);
      else return s(stdout);
    })
  ))).split('\n');

  if( gitStatus[0].split(' ')[2] !== 'master' ){
    console.log('not on branch master - changing to branch master');
    const gitChangeBranch = (await (new Promise((s,j)=>
    exec(
      [
        'cd ../pokered',
        'git stash',
        'git checkout master',
      ].join(' && '),
      (err, stdout, stderr) => {
        if (err) return j(err);
        else return s(stdout);
      }
    )
    ))).split('\n');
    
    gitStatus = (await (new Promise((s,j)=>
      exec('cd ../pokered && git status', (err, stdout, stderr) => {
        if (err) return j(err);
        else return s(stdout);
      })
    ))).split('\n');
  }

  if( !gitStatus.find(t=> t=== 'nothing to commit, working tree clean' ))
    return console.log('working tree not clean - fatal');

  const buildTime = (new Date)-0;
  
  const gitApply = (await (new Promise((s,j)=>
    exec(
      [
        'cd ../pokered',
        'git checkout -b build/'+buildTime,
        'git apply --reject --whitespace=fix ../girsah-adumah/hebrew-support2.patch',
      ].join(' && '),
      (err, stdout, stderr) => {
        if (err) return j(err);
        else return s(stdout);
      }
    )
  ))).split('\n');

  
  // (( make the diff for rtl support (remove typewriter / use from github) ))
  
  // read the translation blocks
  // loop through each of them, using child-process sed to replace strings

  const blocks = JSON.parse(
    (await fs.readFile('./translation/blocks.json', { encoding: 'utf-8' }))
  );

  const transfers = JSON.parse(
    (await fs.readFile('./translation/transfers.json', { encoding: 'utf-8' }))
  );

  const allSeds = blocks.map((block)=>
    transfers.map(({ src, to, file, label, ln })=>{
      if(
        block.file === file &&
        block.label === label &&
        block.cmds.reduce((all, cmd, i) => (
          all && (cmd.cmd[1] === src[i])
        ), true) &&
        src.length
      ){
        // replace src with to in file
        // sed -i 's/original/new/g' file.txt

        // for each cmd in block.cmds
        // replace with to[i]

        const seds = src.map(
          (cmd, i)=> `sed -i 's/"${src[i].replace(/'/g, '\\x27')}"/"${to[i].replace(/'/g, '\\x27')}"/g' ${file}`
        ).filter((sed, i) => to[i] !== '');
        return seds;
      };
    }).filter(i=>i).flat()
  ).flat();

  let chain = Promise.resolve();
  for(let i=0; i < allSeds.length / 128; i++){
    chain = chain.then(()=> new Promise((s,j)=>
      setTimeout(()=>
        exec(allSeds.slice(i*128, (i+1)*128).join(' && '), (err, stdout, stderr) => {
          if (err) return console.log('ERR', err)||j(err);
          else return s(stdout);
        }), 200)
    ));
  }

  await chain;
  
  // child-process make

  console.log('completed translation, running make');
  
  const makeCmd = (await (new Promise((s,j)=>
    exec(
      [
        'cd ../pokered',
        'make',
      ].join(' && '),
      (err, stdout, stderr) => {
        if (err) return j(err);
        else return s(stdout);
      }
    )
  ))).split('\n');
  
  // copy the gbc file to the translations directory

  const cpCmd = (await (new Promise((s,j)=>
    exec(
      'cp ../pokered/pokered.gbc ./build/pokered-'+buildTime+'.gbc',
      (err, stdout, stderr) => {
        if (err) return j(err);
        else return s(stdout);
      }
    )
  ))).split('\n');
  
  // put all the files back how they were using git

  const gitMaster = (await (new Promise((s,j)=>
    exec(
      [
        'cd ../pokered',
        `git commit -am "built at epoch time: ${buildTime}"`,
        'git checkout master',
      ].join(' && '),
      (err, stdout, stderr) => {
        if (err) return j(err);
        else return s(stdout);
      }
    )
  ))).split('\n');
};

const debugAllCommands = async ()=>{
  const blocks = JSON.parse(
    (await fs.readFile('./translation/blocks.json', { encoding: 'utf-8' }))
  );

  return blocks.reduce((cmds, block)=>(
    Array.from(new Set([...cmds, ...block.cmds.map(c=> c.cmd[0])]))
  ), [])
};

const debugAllCommandLengths = async ()=>{
  const blocks = JSON.parse(
    (await fs.readFile('./translation/blocks.json', { encoding: 'utf-8' }))
  );

  return blocks.reduce((cmds, block)=>(
    Array.from(new Set([...cmds, ...block.cmds.map(c=> c.cmd.length)]))
  ), [])
};

const debugLongestText = async ()=>{
  const blocks = JSON.parse(
    (await fs.readFile('./translation/blocks.json', { encoding: 'utf-8' }))
  );

  return blocks.reduce((longest, block)=>(
    Math.max(longest, Math.max(...block.cmds.map(cmd=> (cmd.cmd[1]||'').length)) )
  ), 0)
};

module.exports = {
  readPlayerStrings,
  renderGameInHebrew,
  debugAllCommands,
  debugAllCommandLengths,
  debugLongestText,
};
