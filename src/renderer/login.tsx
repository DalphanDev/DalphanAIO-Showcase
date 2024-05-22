import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import icon from '../../assets/images/DalphanAIOTitle.svg';
import './login.css';

function Login() {
  const [key, setKey] = useState('');
  const [invalidKey, setInvalidKey] = useState(false);

  const handleKeySubmit = async () => {
    const keyResponse: 'success' | 'failure' =
      await window.electron.ipcRenderer.invoke('handle-login', key);
    if (keyResponse === 'success') {
      console.log('Valid key');
      setInvalidKey(false);
    } else {
      console.log('Invalid key');
      setInvalidKey(true);
    }
  };

  return (
    <div className="login">
      <img className="logo" src={icon} alt="" />
      <h1 className="medium">License Key</h1>
      <div className="keyInput">
        <input
          className={invalidKey ? 'inputError' : ''}
          onChange={(v) => {
            setKey(v.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleKeySubmit();
            }
          }}
          onAnimationEnd={() => {
            setInvalidKey(false);
          }}
        />
        <button type="button" aria-label="submit" onClick={handleKeySubmit}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<Login />);
