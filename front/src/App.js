import './App.css';
import { useState, useMemo, useEffect } from 'react';

import {
  fetchFiles,
  fetchBlocks,
  fetchTransfers,
  putTransfer,
} from './network';

import { LeftyTextInput } from './LeftyTextInput';

function App() {
  const [files, setFiles] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loadedFiles, setLoadedFiles] = useState([]);

  const [currentBlock, setCurrentBlock] = useState();
  
  const [currentFile, setCurrentFile] = useState();
  const currentBlocks = useMemo(()=> (
    blocks.filter(block=> block.file === currentFile)
  ), [currentFile]);

  const [currentTransfer, setCurrentTransfer] = useState(null);

  useEffect(()=> {
    void (
      setCurrentTransfer(
        !currentBlock ? null :
        transfers.find(({ file, label })=> (
          file === currentBlock.file
          &&
          label === currentBlock.label
        )) ?? ({
          file: currentBlock.file,
          label: currentBlock.label,
          src: currentBlock.cmds.map(cmd=> (cmd.cmd[1] || '')),
          to: currentBlock.cmds.map(cmd=> ''),
        })
      )
    )
  }, [currentBlock]);
  
  const loadFiles = useMemo(()=> ()=> {
    fetchFiles().then(setFiles);
  }, []);

  const loadTransfers = useMemo(()=> ()=> {
    fetchTransfers().then(setTransfers);
  }, []);

  const saveTransfer = useMemo(()=> ()=> {
    putTransfer(currentTransfer)
      .then(res => {
        setTransfers(old => [...old, {...currentTransfer}]);
      });
  }, [currentTransfer]);

  useEffect(()=> void loadFiles(), []);
  useEffect(()=> void loadTransfers(), []);

  const selectFile = useMemo(()=> (file)=> {
    setCurrentBlock(null);
    
    if(loadedFiles.includes(file)){
      setCurrentFile(file);
    } else {
      fetchBlocks({ file }).then(nuBlocks => {
        setBlocks(oldBlocks => [
          ...oldBlocks.filter(block => block.file !== file),
          ...nuBlocks,
        ]);

        setCurrentFile(file);
        setLoadedFiles(old=> [
          ...old.filter(f=> f !== file),
          file,
        ]);
      });
    }
  }, [loadedFiles]);

  // search by text content (api query)
  
  return (
    <div className="App">
      <div className='top-nav'>
        <h1>תירגום לגירסה אדומה</h1>
      </div>
      <div className='main'>
        <h2>Files</h2>
        <ul>
          {
            files.map((file)=>(
              <li
                key={file}
                className={file === currentFile ? 'active' : ''}
                onClick={()=> selectFile(file)}>
                {file.substr(11)}
              </li>
            ))
          }
        </ul>
        
        <ul>
          {
            currentBlocks.map(block=> (
              <li
                key={block.label}
                className={block.label === currentBlock?.label ? 'active' : ''}
                onClick={()=> setCurrentBlock(block)}>
                {block.label}
              </li>
            ))
          }
        </ul>

        <ul>
          {
            !currentBlock ? null : (
              currentBlock.cmds.map((cmd, i)=> (
                <li key={i}>
                  <span>
                    {cmd.cmd[1]}
                  </span>

                  {
                    !currentTransfer ? <div/> : (
                      <LeftyTextInput
                        value={currentTransfer.to[i]}
                        onChange={nu=> setCurrentTransfer(ct => ({
                          ...ct,
                          to: [
                            ...ct.to.slice(0,i),
                            nu,
                            ...ct.to.slice(i+1),
                          ],
                        }))}
                      />
                    )}

                </li>
              ))
            )
          }
          <hr/>
          {
            !currentTransfer? null : (
              <li key='save'>
                <button onClick={saveTransfer}>Save</button>
              </li>
            )
          }

        </ul>

      </div>
    </div>
  );
}

export default App;
