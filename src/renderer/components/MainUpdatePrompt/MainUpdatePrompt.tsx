import { useState, useEffect } from 'react';
import DeleteTasksButton from '../../../../assets/images/DeleteTasksButton.svg';
import UpdatePrompt from '../../../../assets/images/UpdatePrompt.svg';
import Waterdrop from '../../../../assets/sounds/waterdrop.wav';
import styles from './MainUpdatePrompt.module.scss';

export default function ProfileGroupMenu({
  version,
  hideMenu,
}: {
  version: string;
  hideMenu: (event: any) => void;
}) {
  const [show, setShow] = useState(false);
  const [mouseTargetDown, setMouseTargetDown] = useState('');

  const restartAndInstall = () => {
    window.electron.ipcRenderer.send('restart-and-install');
  };

  useEffect(() => {
    async function loadAudio() {
      setShow(true);

      const audio = new Audio(Waterdrop);

      const handleCanPlay = () => {
        audio.play().catch((error) => {
          console.error('Error playing audio:', error);
        });
      };

      const handleError = (error: any) => {
        console.log('An error occurred:', error);
      };

      audio.addEventListener('canplaythrough', handleCanPlay);
      audio.addEventListener('error', handleError);

      return () => {
        audio.removeEventListener('canplaythrough', handleCanPlay);
        audio.removeEventListener('error', handleError);
      };
    }

    loadAudio();
  }, []);

  const handleMouseDown = (event: any) => {
    setMouseTargetDown(event.target);
  };

  const handleMouseUp = (event: any) => {
    if (event.target === mouseTargetDown) {
      if (event.target.className.includes('canClose')) {
        setShow(false);

        setTimeout(() => {
          hideMenu(event);
        }, 300);
      }
    }
  };

  return (
    <div
      role="presentation"
      id={styles.background}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className={`canClose ${styles.fade} ${show ? styles.active : ''}`}
    >
      <div id={styles.container}>
        <div id={styles.header}>
          <p>Update Downloaded!</p>
          <button
            type="button"
            className="canClose"
            id={styles.DeleteTasksButtonContainer}
            onClick={hideMenu}
          >
            <img height={8} width={8} src={DeleteTasksButton} alt="?" />
          </button>
        </div>
        <div id={styles.content2}>
          <p>Version v{version}</p>
          <img src={UpdatePrompt} height={128} width={128} alt="" />
          <button type="button" onClick={restartAndInstall}>
            Restart & Install
          </button>
        </div>
      </div>
    </div>
  );
}
