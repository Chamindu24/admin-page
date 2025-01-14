// app/page.tsx
'use client'

import { useState } from 'react';
import { QRCode } from 'qrcode.react'; // Named import

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>QR Code Generator</h1>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder="Enter text"
        style={{ padding: '10px', marginBottom: '20px', width: '300px' }}
      />
      
      {inputValue && (
        <div style={{ marginTop: '20px' }}>
          <QRCode value={inputValue} />
        </div>
      )}
    </div>
  );
}
