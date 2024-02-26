const express = require('express');
const app = express();
const port = 4000;

const fs = require('fs').promises;

app.use(express.json());

const blocks = require('../translation/blocks.json');
let transfers = require('../translation/transfers.json');

app.get('/files', (req, res) => {
  res.json(
    Array.from(new Set(
      blocks.map(block => block.file)
    ))
  );
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
