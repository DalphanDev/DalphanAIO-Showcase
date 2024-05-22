import { useDispatch, useSelector } from 'react-redux';
import { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { updateSelectedProfileGroup } from '../../appSlice';
import { RootState } from '../../store';
import DashboardWelcome from '../../../../assets/images/DashboardWelcome.svg';
import AddButton from '../../../../assets/images/AddButton.png';
import SearchTaskImage from '../../../../assets/images/SearchTaskImage.svg';
import styles from './Profiles.module.scss';
import ProfileGroupItem from '../ProfileGroupItem/ProfileGroupItem';
import ProfileItem from '../ProfileItem/ProfileItem';
import ProfileAuxMenu from '../ProfileAuxMenu/ProfileAuxMenu';
import ProfileGroupMenu from '../ProfileGroupMenu/ProfileGroupMenu';
import ProfileMenu from '../ProfileMenu/ProfileMenu';
import ShowToast from '../Toast/Toast';
import {
  addProfileGroup,
  updateProfileGroup,
  removeProfileGroup,
  ProfileGroup,
  Profile,
} from './slice';

function minimizeWindow() {
  window.electron.ipcRenderer.send('window', ['minimize']);
}

function maximizeWindow() {
  window.electron.ipcRenderer.send('window', ['maximize']);
}

function closeApp() {
  window.electron.ipcRenderer.send('window', ['close']);
}

export default function Profiles() {
  const dispatch = useDispatch();
  const selectedProfileGroup = useSelector(
    (state: RootState) => state.user.selectedProfileGroup,
  );
  const profileData = useSelector((state: RootState) => state.profiles);

  const fileImportRef = useRef<HTMLInputElement>(null);

  const [editProfile, setEditProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({} as Profile);
  const [selectedGroupId, setSelectedGroupId] = useState(selectedProfileGroup);
  const [auxMenu, setAuxMenu] = useState({
    show: false,
    xCoordinate: 0,
    yCoordinate: 0,
    id: '',
  });
  const [groupMenu, setGroupMenu] = useState(false);
  const [menuData, setMenuData] = useState({
    id: '',
    name: '',
    profiles: [] as Profile[],
  });
  const [profileMenu, setProfileMenu] = useState(false);

  const createProfileGroup = () => {
    const newProfileGroup: ProfileGroup = {
      id: uuidv4(),
      name: 'New Group',
      profiles: [],
    };

    dispatch(addProfileGroup(newProfileGroup));

    // Write the data to the proxies.json file
    window.electron.ipcRenderer.send('write-profile', newProfileGroup);
  };

  const editProfileGroup = () => {
    setGroupMenu(true);
  };

  const deleteProfileGroup = (id: string) => {
    dispatch(removeProfileGroup(id));
    if (selectedGroupId === id) {
      setSelectedGroupId('');
    }
    window.electron.ipcRenderer.send('remove-profile', id);
  };

  const selectGroup = (id: string) => {
    // This function takes in the id of the group that was clicked and sets it as the selected group
    setSelectedGroupId(id);
    dispatch(updateSelectedProfileGroup(id));
  };

  const displayGroupMenu = (
    id: string,
    xCoordinate: number,
    yCoordinate: number,
  ) => {
    setAuxMenu({
      show: true,
      id,
      xCoordinate,
      yCoordinate,
    });

    const data = profileData.find((group) => group.id === id)!;

    setMenuData({
      id,
      name: data.name,
      profiles: data.profiles,
    });
  };

  const handleImportClick = () => {
    if (fileImportRef.current) {
      fileImportRef.current.click();
    }
  };

  const handleFileChange = (event: any) => {
    try {
      const file = event.target.files[0];
      // Process the file here as needed
      const reader = new FileReader();
      reader.onload = (e) => {
        const contents = e.target?.result as string;
        // You can process the file contents here as needed

        // First, we need to parse the contents of the file.
        const parsedContents = JSON.parse(contents);

        // Rewrite the profileGroup as redux requires us to do so.

        const myGroup: ProfileGroup = profileData.find(
          (group) => group.id === selectedGroupId,
        )!;

        const newProfiles = myGroup.profiles.map((item) => {
          return item;
        });

        const newGroup = { ...myGroup, profiles: newProfiles };

        // Now loop through the parsed contents and add each profile to the selected group.

        for (let i = 0; i < parsedContents.length; i += 1) {
          const shippingFirstName =
            parsedContents[i].shippingAddress.name.split(' ')[0];
          const shippingLastName =
            parsedContents[i].shippingAddress.name.split(' ')[1];
          const billingFirstName =
            parsedContents[i].billingAddress.name.split(' ')[0];
          const billingLastName =
            parsedContents[i].billingAddress.name.split(' ')[1];
          const cardExpiry = `${
            parsedContents[i].paymentDetails.cardExpMonth
          }/${parsedContents[i].paymentDetails.cardExpYear.slice(2)}`;

          const unparsedCardNumber =
            parsedContents[i].paymentDetails.cardNumber;

          let myCardType = 'visa';

          if (
            unparsedCardNumber[0] === '3' &&
            (unparsedCardNumber[1] === '7' || unparsedCardNumber[1] === '4')
          ) {
            // AMEX
            myCardType = 'amex';
          }

          let cardNumber = '';

          if (myCardType === 'amex') {
            cardNumber = `${unparsedCardNumber.slice(
              0,
              4,
            )} ${unparsedCardNumber.slice(4, 10)} ${unparsedCardNumber.slice(
              10,
            )}`;
          } else {
            cardNumber = `${unparsedCardNumber.slice(
              0,
              4,
            )} ${unparsedCardNumber.slice(4, 8)} ${unparsedCardNumber.slice(
              8,
              12,
            )} ${unparsedCardNumber.slice(12)}`;
          }

          const myProfile: Profile = {
            name: parsedContents[i].name,
            id: uuidv4(),
            sameAsShipping: parsedContents[i].sameBillingAndShippingAddress,
            shipping: {
              firstName: shippingFirstName,
              lastName: shippingLastName,
              email: parsedContents[i].shippingAddress.email,
              phone: parsedContents[i].shippingAddress.phone,
              address1: parsedContents[i].shippingAddress.line1,
              address2: parsedContents[i].shippingAddress.line2,
              country: parsedContents[i].shippingAddress.country,
              state: parsedContents[i].shippingAddress.state,
              city: parsedContents[i].shippingAddress.city,
              zip: parsedContents[i].shippingAddress.postCode,
            },
            billing: {
              firstName: billingFirstName,
              lastName: billingLastName,
              address1: parsedContents[i].billingAddress.line1,
              address2: parsedContents[i].billingAddress.line2,
              country: parsedContents[i].billingAddress.country,
              state: parsedContents[i].billingAddress.state,
              city: parsedContents[i].billingAddress.city,
              zip: parsedContents[i].billingAddress.postCode,
            },
            payment: {
              cardHolder: parsedContents[i].paymentDetails.nameOnCard,
              cardType: parsedContents[i].paymentDetails.cardType,
              cardNumber,
              cardExpiry,
              cardCvv: parsedContents[i].paymentDetails.cardCvv,
            },
          };
          newGroup.profiles.push(myProfile);
        }

        dispatch(updateProfileGroup(newGroup));

        const { profiles, id, name } = newGroup;

        window.electron.ipcRenderer.send('write-profile', {
          id,
          name,
          profiles,
        });

        ShowToast({
          type: 'success',
          title: 'Profile Success',
          message: 'Profiles successfully imported.',
        });
      };
      reader.readAsText(file);
    } catch (error) {
      ShowToast({
        type: 'error',
        title: 'Profile Error',
        message: 'Error importing profiles.',
      });
    }
  };

  const displayProfileMenu = () => {
    setEditProfile(false);
    setProfileMenu(true);
  };

  const renderAuxMenu = () => {
    if (auxMenu.show) {
      return (
        <ProfileAuxMenu
          id={auxMenu.id}
          xCoordinate={auxMenu.xCoordinate}
          yCoordinate={auxMenu.yCoordinate}
          edit={editProfileGroup}
          remove={deleteProfileGroup}
        />
      );
    }
    return <div />;
  };

  const hideGroupMenu = () => {
    setGroupMenu(false);
  };

  const hideProfileMenu = () => {
    setProfileMenu(false);
  };

  const saveGroupData = (id: string, name: string, profiles: Profile[]) => {
    dispatch(updateProfileGroup({ id, name, profiles }));
    setGroupMenu(false);

    console.log('writing profiles');

    // Write the data to the harvesters.json file
    window.electron.ipcRenderer.send('write-profile', {
      id,
      name,
      profiles,
    });
  };

  const saveProfileData = (profile: Profile) => {
    // We need to push profile to the profiles array in the selected group
    const myGroup: ProfileGroup = profileData.find(
      (group) => group.id === selectedGroupId,
    )!;

    const newProfiles = myGroup.profiles.map((item) => {
      return item;
    });

    const newGroup = { ...myGroup, profiles: newProfiles };

    // Filter out the profile with the same id as the one we are saving.
    newGroup.profiles = newGroup.profiles.filter(
      (item) => item.id !== profile.id,
    );

    newGroup.profiles.push(profile);

    dispatch(updateProfileGroup(newGroup));
    setProfileMenu(false);

    window.electron.ipcRenderer.send('write-profile', newGroup);
  };

  const editProfileItem = (id: string) => {
    // First, find the profile in reference.
    const myGroup: ProfileGroup = profileData.find(
      (group) => group.id === selectedGroupId,
    )!;

    const myProfile: Profile = myGroup.profiles.find(
      (profile) => profile.id === id,
    )!;

    setEditProfileData(myProfile);
    setEditProfile(true);
    setProfileMenu(true);
  };

  const deleteProfileItem = (id: string) => {
    // We need to remove the profile from the profiles array in the selected group
    const myGroup: ProfileGroup = profileData.find(
      (group) => group.id === selectedGroupId,
    )!;

    const newProfiles = myGroup.profiles.filter((item) => {
      return item.id !== id;
    });

    const newGroup = { ...myGroup, profiles: newProfiles };

    dispatch(updateProfileGroup(newGroup));

    window.electron.ipcRenderer.send('write-profile', newGroup);
  };

  const renderGroupMenu = () => {
    if (groupMenu) {
      return (
        <ProfileGroupMenu
          hideMenu={hideGroupMenu}
          menuData={menuData}
          saveData={saveGroupData}
        />
      );
    }
    return <div />;
  };

  const renderProfileMenu = () => {
    if (profileMenu) {
      return (
        <ProfileMenu
          hideMenu={hideProfileMenu}
          saveData={saveProfileData}
          editProfile={editProfile}
          editProfileData={editProfileData}
        />
      );
    }

    return <div />;
  };

  const renderProfileContent = () => {
    if (selectedGroupId !== '') {
      return (
        <div id={styles.content}>
          <div id={styles.taskControls}>
            <div id={styles.leftTaskControls}>
              <button
                id={styles.addProfile}
                type="button"
                onClick={displayProfileMenu}
              >
                <div id={styles.addButtonImgContainer}>
                  <img id={styles.addButtonImg} src={AddButton} alt="" />
                </div>
                <div id={styles.addProfileTextContainer}>
                  <p>Add New Profile</p>
                </div>
              </button>
              <button
                id={styles.importProfile}
                type="button"
                onClick={handleImportClick}
              >
                <div id={styles.importButtonImgContainer}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25"
                    />
                  </svg>
                  <input
                    type="file"
                    ref={fileImportRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </div>
                <div id={styles.importProfileTextContainer}>
                  <p>Import</p>
                </div>
              </button>
              <button id={styles.exportProfile} type="button">
                <div id={styles.exportButtonImgContainer}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15"
                    />
                  </svg>
                </div>
                <div id={styles.exportProfileTextContainer}>
                  <p>Export</p>
                </div>
              </button>
              <div id={styles.SearchTasks}>
                <div id={styles.SearchTasksImgContainer}>
                  <img width={17} height={17} src={SearchTaskImage} alt="?" />
                </div>
                <div id={styles.SearchTasksInputContainer}>
                  <input
                    id={styles.SearchTasksInput}
                    placeholder="Search Here"
                  />
                </div>
              </div>
            </div>
          </div>
          <div id={styles.tasksContainer}>
            <div id={styles.tasksHeader}>
              <p id={styles.name}>Profile Name</p>
              <p id={styles.email}>Email</p>
              <p id={styles.phone}>Phone</p>
              <p id={styles.last4}>Last 4</p>
              <p id={styles.actions}>Actions</p>
            </div>
            <ul id={styles.tasksList}>
              {profileData.map((profileGroup: ProfileGroup) => {
                if (profileGroup.id === selectedGroupId) {
                  return profileGroup.profiles.map((profile: Profile) => {
                    return (
                      <ProfileItem
                        key={profile.id}
                        id={profile.id}
                        name={profile.name}
                        email={profile.shipping.email}
                        phone={profile.shipping.phone}
                        last4={profile.payment.cardNumber}
                        editProfile={editProfileItem}
                        deleteProfile={deleteProfileItem}
                        // selectProfile={selectProfile}
                        // selected={selectedProfileId === profile.id}
                        // displayMenu={displayMenu}
                      />
                    );
                  });
                }
                return <div />;
              })}
            </ul>
          </div>
        </div>
      );
    }

    return (
      <div id={styles.content}>
        <div id={styles.emptyContainer}>
          <div>
            <p id={styles.emptyText}>Select a group to view profiles</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      id={styles.tasks}
      role="presentation"
      onClick={() => {
        setAuxMenu({ show: false, xCoordinate: 0, yCoordinate: 0, id: '' });
      }}
    >
      <div id={styles.taskGroups}>
        <p>Profile Groups</p>

        <button id={styles.addGroup} type="button" onClick={createProfileGroup}>
          <div id={styles.addButtonImgContainer}>
            <img id={styles.addButtonImg} src={AddButton} alt="Add New Group" />
          </div>
          <div id={styles.addGroupTextContainer}>
            <p>Add New Group</p>
          </div>
        </button>

        <div id={styles.groupContainer}>
          <ul id={styles.groupList}>
            {profileData.map((profileGroup: ProfileGroup) => {
              return (
                <ProfileGroupItem
                  key={profileGroup.id}
                  id={profileGroup.id}
                  name={profileGroup.name}
                  amount={profileGroup.profiles.length}
                  selectGroup={selectGroup}
                  selected={selectedGroupId === profileGroup.id}
                  displayMenu={displayGroupMenu}
                />
              );
            })}
          </ul>
          <div id={styles.groupListShade} />
        </div>
      </div>
      <div id={styles.main}>
        <div id={styles.title}>
          <p>Profiles</p>
          <img
            src={DashboardWelcome}
            alt="
        Welcome to Dalphan AIO"
          />
          <div id={styles.windowActions}>
            <button
              id={styles.windowButton}
              type="button"
              onClick={minimizeWindow}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25"
                />
              </svg>
            </button>
            <button
              id={styles.windowButton}
              type="button"
              onClick={minimizeWindow}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                />
              </svg>
            </button>
            <button
              id={styles.windowButton}
              type="button"
              onClick={minimizeWindow}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 12h-15"
                />
              </svg>
            </button>
            <button
              id={styles.windowButton}
              type="button"
              onClick={maximizeWindow}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z"
                />
              </svg>
            </button>
            <button id={styles.exitButton} type="button" onClick={closeApp}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        {renderProfileContent()}
      </div>
      {renderAuxMenu()}
      {renderGroupMenu()}
      {renderProfileMenu()}
    </div>
  );
}
