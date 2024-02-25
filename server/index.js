const express = require('express');
const app = express();
const port = 4000;

app.use(express.json());

const blocks = require('../translation/blocks.json');
const transfers = require('../translation/transfers.json');

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
