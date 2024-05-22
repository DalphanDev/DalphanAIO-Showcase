// import React, { useState } from 'react';
import ShowToast from '../Toast/Toast';
import EditTaskButton from '../../../../assets/images/EditTaskButton.svg';
import DeleteTaskButton from '../../../../assets/images/DeleteTaskButton.svg';
import styles from './ProfileItem.module.scss';

export default function ProfileItem({
  id,
  name,
  email,
  phone,
  last4,
  editProfile,
  deleteProfile,
}: {
  id: string;
  name: string;
  email: string;
  phone: string;
  last4: string;
  editProfile: (id: string) => void;
  deleteProfile: (id: string) => void;
}) {
  return (
    <button type="button" id={styles.container} tabIndex={-1}>
      <div id={styles.rectangle} />
      <p id={styles.name}>{name}</p>
      <p id={styles.email}>{email}</p>
      <p id={styles.phone}>{phone}</p>
      <p id={styles.last4}>{last4.slice(-4)}</p>
      <div id={styles.actions}>
        <button
          id={styles.editButton}
          type="button"
          tabIndex={-1}
          onClick={() => {
            editProfile(id);
          }}
        >
          <img height={18} width={18} src={EditTaskButton} alt="?" />
        </button>
        <button
          id={styles.deleteButton}
          type="button"
          tabIndex={-1}
          onClick={() => {
            deleteProfile(id);

            ShowToast({
              type: 'success',
              title: 'Profile Success',
              message: 'Profile deleted!',
            });
          }}
        >
          <img height={18} width={18} src={DeleteTaskButton} alt="?" />
        </button>
      </div>
    </button>
  );
}
