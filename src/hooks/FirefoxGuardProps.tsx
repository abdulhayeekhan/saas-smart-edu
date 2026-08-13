import React, { useEffect, useState, ReactNode } from 'react';

interface FirefoxGuardProps {
  children: ReactNode;
}

const FirefoxGuard: React.FC<FirefoxGuardProps> = ({ children }) => {
  // Initialize as true to avoid a "flash" of the restricted screen 
  // while the useEffect runs on mount
  const [isFirefox, setIsFirefox] = useState<boolean>(true);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isBrowserFirefox = userAgent.includes('firefox');
    
    setIsFirefox(isBrowserFirefox);
  }, []);

  if (!isFirefox) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
        <h1>Access Restricted</h1>
        <p>This application only supports <strong>Mozilla Firefox</strong>.</p>
        <a 
          href="https://www.mozilla.org/firefox/new/" 
          target="_blank" 
          rel="noreferrer"
        >
          Download Firefox here
        </a>
      </div>
    );
  }

  return <>{children}</>;
};

export default FirefoxGuard;