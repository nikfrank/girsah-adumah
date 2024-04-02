const express = require('express');
const app = express();
const port = 4000;

const fs = require('fs').promises;

app.use(express.json());

let transfers = require('../translation/transfers.json');

const blocks = require('../translation/blocks.json').map(block => {
  const cmds = block.cmds.map(c=> c.cmd[1]).join();
  return {
    ...block,
    hasTranslation: transfers.find(t=> (
      (t.file === block.file) &&
      (t.label === block.label) &&
      cmds === t.src.join()
    )),
  };
});

const files = Array.from(new Set(
  blocks.map(block => block.file)
)).map(filename=> ({
  filename,
  progress: blocks
    .filter(block => block.file === filename)
    .reduce((totals, block)=> ({
      blocks: totals.blocks + 1,
      completed: totals.completed + (block.hasTranslation ? 1 : 0)
    }), { blocks: 0, completed: 0 })
}));

const progressFraction = blocks.filter(block=> block.hasTranslation).length / blocks.length;

app.get('/progressFraction', (req, res)=>{
  res.json({ progressFraction });
});

app.get('/files', (req, res) => {
  res.json(files);
});

// paginate?
app.post('/blocks', (req, res) => {
  res.json(
    blocks
      .filter(block => !req.body.file || (block.file === req.body.file))
      .filter(block => !req.body.label || (block.label === req.body.label))
  );
});


app.get('/transfers', (req, res) => {
  res.json(transfers);
});

app.put('/transfers', async (req, res)=>{

  let statusCode = 200;

  // find existing transfer
  const currentTransfer = transfers
    .find(({ file, label })=> (
      file === req.body.file
      &&
      label === req.body.label
    ));

  // if yesh, update it
  // if ain, append a new one
  if( currentTransfer ){
    currentTransfer.to = req.body.to
  } else {
    transfers.push({
      file: req.body.file,
      label: req.body.label,
      src: req.body.src,
      to: req.body.to,
    });

    statusCode = 201;
  }

  // write the file back to src

  await fs.writeFile('../translation/transfers.json', JSON.stringify(
    transfers, null, 2
  ));  
  
  transfers = require('../translation/transfers.json');

  return res.status(statusCode).json({ status: 'success' });
});

app.post('/search', (req, res)=> {
  const searchResultBlocks = blocks.reduce((results, block)=> {
    const cmdJoined = block.cmds.map(cmd=> cmd.cmd[1]).join(' ')
          .toLowerCase()
          .replace(/  +/g, ' ');
    
    return !cmdJoined.includes(req.body.searchString.toLowerCase()) ? results : [...results, block];
  }, []);

  res.json(searchResultBlocks);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
