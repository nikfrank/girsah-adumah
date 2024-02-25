export const fetchFiles = ()=>
  fetch('/files')
    .then(res=> res.json());

export const fetchBlocks = ({ file })=>
  fetch('/blocks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file }),
  })
    .then(res=> res.json());


export const fetchTransfers = ({ file, label, src })=>
  fetch('/transfers')
    .then(res=> res.json());

export const saveTransfer = ({
  file, label,
  src, to,
})=>{
  
};
