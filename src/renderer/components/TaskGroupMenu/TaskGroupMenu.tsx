import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import FocusTrap from 'focus-trap-react';
import { RootState } from '../../store';
import DeleteTasksButton from '../../../../assets/images/DeleteTasksButton.svg';
import styles from './TaskGroupMenu.module.scss';
import { Task } from '../Tasks/slice';
import ShowToast from '../Toast/Toast';

export default function TaskGroupMenu({
  hideMenu,
  saveData,
  menuData,
}: {
  hideMenu: (event: any) => void;
  saveData: (id: string, name: string, tasks: Task[]) => void;
  menuData: {
    id: string;
    name: string;
    tasks: Task[];
  };
}) {
  const [newName, setNewName] = useState(menuData.name);

  const [show, setShow] = useState(false);
  const [mouseTargetDown, setMouseTargetDown] = useState('');

  const reduxData = useSelector((state: RootState) => {
    for (let i = 0; i < state.tasks.length; i += 1) {
      if (state.tasks[i].id === menuData.id) {
        return state.tasks[i];
      }
    }
    return menuData;
  }); // use the useSelector hook to get the state

  useEffect(() => {
    // When the component mounts, set the state to trigger the fade-in effect.
    setShow(true);
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

  // Function to handle key press events
  const handleKeyPress = (event: any) => {
    if (event.key === 'Enter') {
      if (newName === '') {
        ShowToast({
          type: 'warning',
          title: 'Task Group',
          message: 'Enter a name for the group!',
        });
        return;
      }

      saveData(menuData.id, newName, reduxData.tasks);

      ShowToast({
        type: 'success',
        title: 'Task Group',
        message: 'Renamed task group!',
      });
    }
  };

  return (
    <FocusTrap>
      <div
        role="presentation"
        id={styles.background}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className={`canClose ${styles.fade} ${show ? styles.active : ''}`}
      >
        <div id={styles.container}>
          <div id={styles.header}>
            <p>Edit Group Name</p>
            <button
              type="button"
              className="canClose"
              tabIndex={-1}
              id={styles.DeleteTasksButtonContainer}
            >
              <img height={8} width={8} src={DeleteTasksButton} alt="?" />
            </button>
          </div>
          <div id={styles.content}>
            <div id={styles.inputRow}>
              <div id={styles.inputContainer}>
                <p>Name</p>
                <input
                  type="text"
                  defaultValue={menuData.name}
                  placeholder="Name"
                  spellCheck={false}
                  onKeyDown={handleKeyPress}
                  onChange={(event) => {
                    setNewName(event.target.value);
                  }}
                />
              </div>
            </div>
          </div>
          <div id={styles.content2}>
            <div id={styles.buttons}>
              <button
                id={styles.save}
                type="button"
                onClick={() => {
                  if (newName === '') {
                    ShowToast({
                      type: 'warning',
                      title: 'Task Group',
                      message: 'Enter a name for the group!',
                    });
                    return;
                  }

                  saveData(menuData.id, newName, reduxData.tasks);

                  ShowToast({
                    type: 'success',
                    title: 'Task Group',
                    message: 'Renamed task group!',
                  });
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </FocusTrap>
  );
}
