import React from 'react';
import StartTaskButton from '../../../../assets/images/StartTaskButton.svg';
import StopTaskButton from '../../../../assets/images/StopTaskButton.svg';
import EditTaskButton from '../../../../assets/images/EditTaskButton.svg';
import DeleteTaskButton from '../../../../assets/images/DeleteTaskButton.svg';
import styles from './TaskItem.module.scss';

export default function TaskItem({
  id,
  site,
  input,
  size,
  mode,
  profile,
  proxy,
  status,
  statusType,
  isRunning,
  isSelected,
  startTask,
  stopTask,
  editTask,
  deleteTask,
  updateSelected,
}: {
  id: string;
  site: string;
  input: string;
  size: string;
  mode: string;
  profile: string;
  proxy: string;
  status: string;
  statusType: string;
  isRunning: boolean;
  isSelected: boolean;
  startTask: (id: string) => void;
  stopTask: (id: string) => void;
  editTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateSelected: (id: string, clickType: 'single' | 'shift' | 'ctrl') => void;
}) {
  const renderStartStopButton = () => {
    if (isRunning) {
      return (
        <button
          id={styles.stopButton}
          type="button"
          tabIndex={-1}
          onClick={() => {
            stopTask(id);
          }}
        >
          <img height={18} width={18} src={StopTaskButton} alt="?" />
        </button>
      );
    }

    return (
      <button
        id={styles.startButton}
        type="button"
        tabIndex={-1}
        onClick={() => {
          startTask(id);
        }}
      >
        <img height={18} width={18} src={StartTaskButton} alt="?" />
      </button>
    );
  };

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    if (event.shiftKey) {
      updateSelected(id, 'shift');
    } else if (event.ctrlKey || event.metaKey) {
      updateSelected(id, 'ctrl');
    } else {
      updateSelected(id, 'single');
    }
  };

  return (
    <button
      type="button"
      id={isSelected ? styles.container2 : styles.container}
      tabIndex={-1}
      onClick={(e) => {
        handleClick(e);
      }}
    >
      <div id={styles.rectangle} />
      <p id={styles.site}>{site}</p>
      <p id={styles.mode}>{mode}</p>
      <p id={styles.input}>{input}</p>
      <p id={styles.size}>{size}</p>
      <p id={styles.profile}>{profile}</p>
      <p id={styles.proxy}>{proxy}</p>
      <p id={styles.status} className={`${styles[statusType]}`}>
        {status}
      </p>
      <div id={styles.actions}>
        {renderStartStopButton()}
        <button
          id={styles.editButton}
          type="button"
          tabIndex={-1}
          onClick={() => {
            editTask(id);
          }}
        >
          <img height={18} width={18} src={EditTaskButton} alt="?" />
        </button>
        <button
          id={styles.deleteButton}
          type="button"
          tabIndex={-1}
          onClick={() => {
            deleteTask(id);
          }}
        >
          <img height={18} width={18} src={DeleteTaskButton} alt="?" />
        </button>
      </div>
    </button>
  );
}
