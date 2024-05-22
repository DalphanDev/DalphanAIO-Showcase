// import React, { useState } from 'react';
import ShowToast from '../Toast/Toast';
import EditTaskButton from '../../../../assets/images/EditTaskButton.svg';
import DeleteTaskButton from '../../../../assets/images/DeleteTaskButton.svg';
import styles from './AccountItem.module.scss';

export default function AccountItem({
  id,
  name,
  username,
  password,
  editAccount,
  deleteAccount,
}: {
  id: string;
  name: string;
  username: string;
  password: string;
  editAccount: (id: string) => void;
  deleteAccount: (id: string) => void;
}) {
  return (
    <button type="button" id={styles.container} tabIndex={-1}>
      <div id={styles.rectangle} />
      <p id={styles.name}>{name}</p>
      <p id={styles.email}>{username}</p>
      <p id={styles.phone}>{password}</p>
      <div id={styles.actions}>
        <button
          id={styles.editButton}
          type="button"
          tabIndex={-1}
          onClick={() => {
            editAccount(id);
          }}
        >
          <img height={18} width={18} src={EditTaskButton} alt="?" />
        </button>
        <button
          id={styles.deleteButton}
          type="button"
          tabIndex={-1}
          onClick={() => {
            deleteAccount(id);

            ShowToast({
              type: 'success',
              title: 'Account Success',
              message: 'Account deleted!',
            });
          }}
        >
          <img height={18} width={18} src={DeleteTaskButton} alt="?" />
        </button>
      </div>
    </button>
  );
}
