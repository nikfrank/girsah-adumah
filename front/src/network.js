export const fetchFiles = ()=>
  fetch('/files')
    .then(res=> res.json());

export const fetchProgressFraction = ()=>
  fetch('/progressFraction')
    .then(res=> res.json())
    .then(resJSON=> resJSON.progressFraction);

export const fetchBlocks = ({ file })=>
  fetch('/blocks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file }),
  })
    .then(res=> res.json());


export const fetchTransfers = ()=>
  fetch('/transfers')
    .then(res=> res.json());

export const putTransfer = ({
  file, label,
  src, to,
})=>
    fetch('/transfers', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file, label,
        src, to,
      }),
    })
      .then(res=> res.json())
