import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import FocusTrap from 'focus-trap-react';
import ShowToast from '../Toast/Toast';
import DeleteTasksButton from '../../../../assets/images/DeleteTasksButton.svg';
import { updateCustomShopify } from '../Misc/slice';
import MySelect from '../Select/Select';
import styles from './CustomShopifyMenu.module.scss';

interface Option {
  value: string;
  label: string;
}

export default function HarvesterMenu({
  hideMenu,
  menuData,
}: {
  hideMenu: (event: any) => void;
  menuData: Option[];
}) {
  const dispatch = useDispatch();

  const [show, setShow] = useState(false);
  const [mouseTargetDown, setMouseTargetDown] = useState('');
  const [selectedSite, setSelectedSite] = useState<Option | Option[]>(
    {} as Option,
  );

  const [siteLabel, setSiteLabel] = useState('');
  const [siteValue, setSiteValue] = useState('');

  const deleteSite = () => {
    // Destructure the selectedSite as Option for readability
    const { label, value } = selectedSite as Option;

    // Verify that a site is selected.
    if (label !== undefined) {
      // Create a new array excluding the matching site
      const updatedData = menuData.filter(
        (item) => !(item.label === label && item.value === value),
      );

      // Now we are going to save the updated data
      dispatch(updateCustomShopify(updatedData));

      ShowToast({
        type: 'error',
        title: 'Custom Shopify',
        message: 'Deleted site!',
      });

      // Now reset the selected site, label, and value
      setSelectedSite({} as Option);
      setSiteLabel('');
      setSiteValue('');
    } else {
      ShowToast({
        type: 'warning',
        title: 'Custom Shopify',
        message: 'Please select a site.',
      });
    }
  };

  const saveSite = () => {
    // Destructure the selectedSite as Option for readability
    const { label, value } = selectedSite as Option;

    // If we have a selected site, we are going to update it.
    if (label !== undefined) {
      // Create a new array with modifications
      const updatedData = menuData.map((item) =>
        item.label === label && item.value === value
          ? { ...item, label: siteLabel, value: siteValue }
          : item,
      );

      ShowToast({
        type: 'success',
        title: 'Custom Shopify',
        message: 'Saved site!',
      });

      dispatch(updateCustomShopify(updatedData));
    } else {
      // Make sure that we have a label and value

      if (siteLabel === '') {
        ShowToast({
          type: 'warning',
          title: 'Custom Shopify',
          message: 'Please enter a name.',
        });
        return;
      }

      if (siteValue === '') {
        ShowToast({
          type: 'warning',
          title: 'Custom Shopify',
          message: 'Please enter a URL.',
        });
        return;
      }

      // We are adding a new site. Simply append it to the end of the array.
      const newData = [...menuData, { label: siteLabel, value: siteValue }];

      ShowToast({
        type: 'success',
        title: 'Custom Shopify',
        message: 'Saved site!',
      });

      dispatch(updateCustomShopify(newData));
    }
  };

  // const reduxData = useSelector((state: RootState) => {
  //   for (let i = 0; i < state.harvesters.length; i += 1) {
  //     if (state.harvesters[i].id === menuData.id) {
  //       return state.harvesters[i];
  //     }
  //   }
  //   return menuData;
  // }); // use the useSelector hook to get the state

  useEffect(() => {
    // When the component mounts, set the state to trigger the fade-in effect.

    setShow(true);
  }, []);

  const handleMouseDown = (event: any) => {
    setMouseTargetDown(event.target);
  };

  const handleMouseUp = (event: any) => {
    if (event.target === mouseTargetDown) {
      if (event.target.className.includes !== undefined) {
        if (event.target.className.includes('canClose')) {
          setShow(false);

          setTimeout(() => {
            // Unmount or perform any other cleanup logic here.
            hideMenu(event);
          }, 300);
        }
      }
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
            <p>Custom Shopify</p>
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
                  defaultValue={(selectedSite as Option).label}
                  placeholder="Name"
                  spellCheck={false}
                  onChange={(e) => setSiteLabel(e.target.value)}
                />
              </div>
              <div
                id={styles.inputContainer}
                className={styles.hardWidthContainer}
              >
                <p>Site to Edit (Optional)</p>
                <MySelect
                  options={menuData}
                  value={selectedSite}
                  setValue={setSelectedSite}
                  placeholder="Site to Edit"
                />
              </div>
            </div>
            <div id={styles.inputRow}>
              <div id={styles.inputContainer}>
                <p>Site URL</p>
                <input
                  type="text"
                  defaultValue={(selectedSite as Option).value}
                  placeholder="Site URL"
                  spellCheck={false}
                  onChange={(e) => setSiteValue(e.target.value)}
                />
              </div>
            </div>
            <div id={styles.inputRow}>
              <div id={styles.buttons}>
                <button
                  id={styles.delete}
                  className={styles.buttonStyling}
                  type="button"
                  onClick={deleteSite}
                >
                  Delete
                </button>
                <button
                  id={styles.save}
                  className={styles.buttonStyling}
                  type="button"
                  onClick={saveSite}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FocusTrap>
  );
}
