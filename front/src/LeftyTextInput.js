import { useRef } from 'react';
import './LeftyTextInput.css';

const tenArray = Array(21).fill(null);

export const LeftyTextInput = ({
  value='',
  onChange,
})=>{

  const refs = tenArray.map(useRef);

  return (
    <div className='lefty-text-input'>
      {
        tenArray.map((_,i)=> (
          <input
            ref={refs[i]}
            key={i}
            disabled={i > value.length}
            value={value[value.length - i - 1] ?? ''}
            onChange={(e)=>{
              onChange(
                value.substr(0, value.length - i - 1) +
                (e.target.value[e.target.value.length-1] ?? '') +
                value.substr(value.length - i)
              );

              if( i < tenArray.length-1 ){
                setTimeout(()=> refs[i+1].current.focus(), 10);
              }
            }}
          />
        ))
      }
    </div>
  );
}
