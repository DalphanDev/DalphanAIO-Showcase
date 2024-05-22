import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import FocusTrap from 'focus-trap-react';
import ShowToast from '../Toast/Toast';
import Card from '../Card/Card';
import DeleteTasksButton from '../../../../assets/images/DeleteTasksButton.svg';
import styles from './ProfileMenu.module.scss';
import { Profile } from '../Profiles/slice';

export default function ProfileMenu({
  hideMenu,
  saveData,
  editProfile,
  editProfileData,
}: {
  hideMenu: (event: any) => void;
  saveData: (profileGroup: Profile) => void;
  editProfile: boolean;
  editProfileData: Profile;
}) {
  // Inside your component
  const hasMounted = useRef(false);

  const [selectedPage, setSelectedPage] = useState('shipping');
  const [profileName, setProfileName] = useState(
    editProfile ? editProfileData.name : '',
  );
  const [email, setEmail] = useState(
    editProfile ? editProfileData.shipping.email : '',
  );
  const [phone, setPhone] = useState(
    editProfile ? editProfileData.shipping.phone : '',
  );
  const [shippingFirstName, setShippingFirstName] = useState(
    editProfile ? editProfileData.shipping.firstName : '',
  );
  const [shippingLastName, setShippingLastName] = useState(
    editProfile ? editProfileData.shipping.lastName : '',
  );
  const [shippingAddress1, setShippingAddress1] = useState(
    editProfile ? editProfileData.shipping.address1 : '',
  );
  const [shippingAddress2, setShippingAddress2] = useState(
    editProfile ? editProfileData.shipping.address2 : '',
  );
  const [shippingCountry, setShippingCountry] = useState(
    editProfile ? editProfileData.shipping.country : '',
  );
  const [shippingState, setShippingState] = useState(
    editProfile ? editProfileData.shipping.state : '',
  );
  const [shippingCity, setShippingCity] = useState(
    editProfile ? editProfileData.shipping.city : '',
  );
  const [shippingZipCode, setShippingZipCode] = useState(
    editProfile ? editProfileData.shipping.zip : '',
  );

  const [billingFirstName, setBillingFirstName] = useState(
    editProfile ? editProfileData.billing.firstName : '',
  );
  const [billingLastName, setBillingLastName] = useState(
    editProfile ? editProfileData.billing.lastName : '',
  );
  const [billingAddress1, setBillingAddress1] = useState(
    editProfile ? editProfileData.billing.address1 : '',
  );
  const [billingAddress2, setBillingAddress2] = useState(
    editProfile ? editProfileData.billing.address2 : '',
  );
  const [billingCountry, setBillingCountry] = useState(
    editProfile ? editProfileData.billing.country : '',
  );
  const [billingState, setBillingState] = useState(
    editProfile ? editProfileData.billing.state : '',
  );
  const [billingCity, setBillingCity] = useState(
    editProfile ? editProfileData.billing.city : '',
  );
  const [billingZipCode, setBillingZipCode] = useState(
    editProfile ? editProfileData.billing.zip : '',
  );

  const [cardType, setCardType] = useState(
    editProfile ? editProfileData.payment.cardType : 'visa',
  );
  const [cardNumber, setCardNumber] = useState(
    editProfile ? editProfileData.payment.cardNumber : '',
  );
  const [cardHolder, setCardHolder] = useState(
    editProfile ? editProfileData.payment.cardHolder : '',
  );
  const [cardExpiry, setCardExpiry] = useState(
    editProfile ? editProfileData.payment.cardExpiry : '',
  );
  const [cardCvv, setCardCvv] = useState(
    editProfile ? editProfileData.payment.cardCvv : '',
  );

  const [sameBillingAndShipping, setSameBillingAndShipping] = useState(
    editProfile ? editProfileData.sameAsShipping : false,
  );
  const [show, setShow] = useState(false);
  const [mouseTargetDown, setMouseTargetDown] = useState('');

  const initialNumber = editProfile ? editProfileData.payment.cardNumber : '';

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
          // Unmount or perform any other cleanup logic here.
          hideMenu(event);
        }, 300);
      }
    }
  };

  const getContainerStyle = () => {
    if (selectedPage === 'shipping') {
      return styles.shippingContainer;
    }
    if (selectedPage === 'billing') {
      return styles.billingContainer;
    }
    if (selectedPage === 'payment') {
      return styles.paymentContainer;
    }
    return styles.nullStyle;
  };

  const getButtonStyle = (page: string) => {
    if (selectedPage === page) {
      return styles.buttonSelected;
    }
    return styles.nullStyle;
  };

  const handlePhoneChange = (value: string) => {
    const newValue = value.replace(/[^0-9]/g, '');
    setPhone(newValue);
  };

  // const expiryRegex = /^\d{0,2}\/?\d{0,2}$/;

  const isNumber = (char: string) => {
    return /^\d$/.test(char);
  };

  const parseNumber = (input: string, inputEvent: InputEvent) => {
    let shouldSetNumber = true;
    let myCardType = 'visa';

    const { inputType } = inputEvent;

    for (let i = 0; i < input.length; i += 1) {
      // Determine card type

      // Visa Check
      if (i === 0) {
        if (input[i] === '4') {
          // Visa
          myCardType = 'visa';
        }
      }

      // AMEX Check
      if (input.length > 1) {
        if (input[0] === '3' && (input[1] === '7' || input[1] === '4')) {
          // AMEX
          myCardType = 'amex';
        }
      }

      // Mastercard Check
      if (i === 0) {
        if (input[i] === '5') {
          // Mastercard
          myCardType = 'MasterCard';
        }
      }
      // Discover Check
      if (input.length > 3) {
        if (
          input[0] === '6' &&
          input[1] === '0' &&
          input[2] === '1' &&
          input[3] === '1'
        ) {
          // Discover
          myCardType = 'discover';
        }
      }
    }

    // Now run another for loop that parses the number

    if (myCardType === 'amex') {
      for (let a = 0; a < input.length; a += 1) {
        if (input.length > 17) {
          shouldSetNumber = false;
        }

        if (a === 4 || a === 11) {
          if (input[a] !== ' ') {
            shouldSetNumber = false;
          }
        }

        if (a === 0 || a === 1 || a === 2 || a === 3) {
          if (!isNumber(input[a])) {
            shouldSetNumber = false;
          }
        }

        if (a === 5 || a === 6 || a === 7 || a === 8 || a === 9 || a === 10) {
          if (!isNumber(input[a])) {
            shouldSetNumber = false;
          }
        }

        if (a === 12 || a === 13 || a === 14 || a === 15 || a === 16) {
          if (!isNumber(input[a])) {
            shouldSetNumber = false;
          }
        }
      }
    } else {
      for (let n = 0; n < input.length; n += 1) {
        if (input.length > 19) {
          shouldSetNumber = false;
        }

        if (n === 4 || n === 9 || n === 14) {
          if (input[n] !== ' ') {
            shouldSetNumber = false;
          }
        }

        if (n === 0 || n === 1 || n === 2 || n === 3) {
          if (!isNumber(input[n])) {
            shouldSetNumber = false;
          }
        }

        if (n === 5 || n === 6 || n === 7 || n === 8) {
          if (!isNumber(input[n])) {
            shouldSetNumber = false;
          }
        }

        if (n === 10 || n === 11 || n === 12 || n === 13) {
          if (!isNumber(input[n])) {
            shouldSetNumber = false;
          }
        }

        if (n === 15 || n === 16 || n === 17 || n === 18) {
          if (!isNumber(input[n])) {
            shouldSetNumber = false;
          }
        }
      }
    }

    if (shouldSetNumber) {
      if (myCardType === 'amex') {
        if (input.length === 4 || input.length === 11) {
          if (inputType === 'insertText') {
            setCardNumber(`${input} `);
          } else if (inputType === 'deleteContentBackward') {
            setCardNumber(input.slice(0, -1));
          }
        } else {
          setCardNumber(input);
        }
      } else if (
        input.length === 4 ||
        input.length === 9 ||
        input.length === 14
      ) {
        if (inputType === 'insertText') {
          setCardNumber(`${input} `);
        } else if (inputType === 'deleteContentBackward') {
          setCardNumber(input.slice(0, -1));
        }
      } else {
        setCardNumber(input);
      }
      setCardType(myCardType);
    }
  };

  const parseExpiry = (input: string, inputEvent: InputEvent) => {
    let shouldSetExpiry = true;

    const { inputType } = inputEvent;

    for (let i = 0; i < input.length; i += 1) {
      if (input.length > 5) {
        shouldSetExpiry = false;
      }

      if (i === 0 || i === 1) {
        if (!isNumber(input[i])) {
          shouldSetExpiry = false;
        }
      }

      if (i === 2) {
        if (input[i] !== '/') {
          shouldSetExpiry = false;
        }
      }

      if (i === 3 || i === 4) {
        if (!isNumber(input[i])) {
          shouldSetExpiry = false;
        }
      }
    }

    if (shouldSetExpiry) {
      if (input.length === 2) {
        if (inputType === 'insertText') {
          setCardExpiry(`${input}/`);
        } else if (inputType === 'deleteContentBackward') {
          setCardExpiry(input.slice(0, -1));
        }
      } else {
        setCardExpiry(input);
      }
    }
  };

  const parseCvv = (input: string) => {
    let shouldSetCvv = true;

    for (let i = 0; i < input.length; i += 1) {
      if (input.length > 4) {
        shouldSetCvv = false;
      }

      if (!isNumber(input[i])) {
        shouldSetCvv = false;
      }
    }

    if (shouldSetCvv) {
      setCardCvv(input);
    }
  };

  // Parse the initial value when the component mounts
  useEffect(() => {
    if (!hasMounted.current) {
      setCardNumber(initialNumber);

      hasMounted.current = true;
    }
  }, [cardType, initialNumber]);

  const saveProfile = () => {
    // Validate all shipping inputs.
    if (profileName === '') {
      ShowToast({
        type: 'warning',
        title: 'Profile Warning',
        message: 'Enter a profile name.',
      });
      return;
    }
    if (email === '') {
      ShowToast({
        type: 'warning',
        title: 'Profile Warning',
        message: 'Enter an email.',
      });
      return;
    }
    if (phone === '') {
      ShowToast({
        type: 'warning',
        title: 'Profile Warning',
        message: 'Enter a phone number.',
      });
      return;
    }
    if (shippingFirstName === '') {
      ShowToast({
        type: 'warning',
        title: 'Profile Warning',
        message: 'Enter a first name.',
      });
      return;
    }
    if (shippingLastName === '') {
      ShowToast({
        type: 'warning',
        title: 'Profile Warning',
        message: 'Enter a last name.',
      });
      return;
    }
    if (shippingAddress1 === '') {
      ShowToast({
        type: 'warning',
        title: 'Profile Warning',
        message: 'Enter an address.',
      });
      return;
    }
    if (shippingCountry === '') {
      ShowToast({
        type: 'warning',
        title: 'Profile Warning',
        message: 'Select a country.',
      });
      return;
    }
    if (shippingState === '') {
      ShowToast({
        type: 'warning',
        title: 'Profile Warning',
        message: 'Select a state.',
      });
      return;
    }
    if (shippingCity === '') {
      ShowToast({
        type: 'warning',
        title: 'Profile Warning',
        message: 'Enter a city',
      });
      return;
    }
    if (shippingZipCode === '') {
      ShowToast({
        type: 'warning',
        title: 'Profile Warning',
        message: 'Enter a zip code.',
      });
      return;
    }
    if (!sameBillingAndShipping) {
      // Validate all billing inputs.
      if (billingFirstName === '') {
        ShowToast({
          type: 'warning',
          title: 'Profile Warning',
          message: 'Enter a first name.',
        });
        return;
      }
      if (billingLastName === '') {
        ShowToast({
          type: 'warning',
          title: 'Profile Warning',
          message: 'Enter a last name.',
        });
        return;
      }
      if (billingAddress1 === '') {
        ShowToast({
          type: 'warning',
          title: 'Profile Warning',
          message: 'Enter an address.',
        });
        return;
      }
      if (billingCountry === '') {
        ShowToast({
          type: 'warning',
          title: 'Profile Warning',
          message: 'Select a country.',
        });
        return;
      }
      if (billingState === '') {
        ShowToast({
          type: 'warning',
          title: 'Profile Warning',
          message: 'Select a state.',
        });
        return;
      }
      if (billingCity === '') {
        ShowToast({
          type: 'warning',
          title: 'Profile Warning',
          message: 'Enter a city',
        });
        return;
      }
      if (billingZipCode === '') {
        ShowToast({
          type: 'warning',
          title: 'Profile Warning',
          message: 'Enter a zip code.',
        });
        return;
      }
    }

    // Validate all payment inputs.
    if (cardHolder === '') {
      ShowToast({
        type: 'warning',
        title: 'Profile Warning',
        message: 'Enter a card holder.',
      });
      return;
    }
    if (cardNumber === '') {
      ShowToast({
        type: 'warning',
        title: 'Profile Warning',
        message: 'Enter a card number.',
      });
      return;
    }
    if (cardExpiry === '') {
      ShowToast({
        type: 'warning',
        title: 'Profile Warning',
        message: 'Enter a card expiry.',
      });
      return;
    }
    if (cardCvv === '') {
      ShowToast({
        type: 'warning',
        title: 'Profile Warning',
        message: 'Enter a card cvv.',
      });
      return;
    }

    // If all inputs are valid, save the profile.

    const myProfile: Profile = {
      id: editProfile ? editProfileData.id : uuidv4(),
      name: profileName,
      sameAsShipping: sameBillingAndShipping, // TODO: Add state for checkbox.
      shipping: {
        email,
        phone,
        firstName: shippingFirstName,
        lastName: shippingLastName,
        address1: shippingAddress1,
        address2: shippingAddress2,
        country: shippingCountry,
        state: shippingState,
        city: shippingCity,
        zip: shippingZipCode,
      },
      billing: {
        firstName: sameBillingAndShipping
          ? shippingFirstName
          : billingFirstName,
        lastName: sameBillingAndShipping ? shippingLastName : billingLastName,
        address1: sameBillingAndShipping ? shippingAddress1 : billingAddress1,
        address2: sameBillingAndShipping ? shippingAddress2 : billingAddress2,
        country: sameBillingAndShipping ? shippingCountry : billingCountry,
        state: sameBillingAndShipping ? shippingState : billingState,
        city: sameBillingAndShipping ? shippingCity : billingCity,
        zip: sameBillingAndShipping ? shippingZipCode : billingZipCode,
      },
      payment: {
        cardType,
        cardHolder,
        cardNumber,
        cardExpiry,
        cardCvv,
      },
    };

    saveData(myProfile);

    if (editProfile) {
      ShowToast({
        type: 'success',
        title: 'Profile Success',
        message: 'Profile edited!',
      });
    } else {
      ShowToast({
        type: 'success',
        title: 'Profile Success',
        message: 'Profile created!',
      });
    }
  };

  const shippingPage = () => {
    if (selectedPage === 'shipping') {
      return (
        <div id={styles.content}>
          <div id={styles.inputRow}>
            <div id={styles.inputContainer}>
              <p>Profile Name</p>
              <input
                type="text"
                placeholder="Profile Name"
                spellCheck={false}
                onChange={(event) => {
                  setProfileName(event.target.value);
                }}
                value={profileName}
              />
            </div>
          </div>
          <div id={styles.inputRow}>
            <div id={styles.inputContainer}>
              <p>Email</p>
              <input
                type="text"
                placeholder="Email"
                spellCheck={false}
                onChange={(event) => {
                  setEmail(event.target.value);
                }}
                value={email}
              />
            </div>
            <div id={styles.inputContainer}>
              <p>Phone</p>
              <input
                type="text"
                placeholder="Phone"
                spellCheck={false}
                onChange={(event) => {
                  handlePhoneChange(event.target.value);
                }}
                value={phone}
              />
            </div>
          </div>
          <div id={styles.inputRow}>
            <div id={styles.inputContainer}>
              <p>First Name</p>
              <input
                type="text"
                placeholder="First Name"
                spellCheck={false}
                onChange={(event) => {
                  setShippingFirstName(event.target.value);
                }}
                value={shippingFirstName}
              />
            </div>
            <div id={styles.inputContainer}>
              <p>Last Name</p>
              <input
                type="text"
                placeholder="Last Name"
                spellCheck={false}
                onChange={(event) => {
                  setShippingLastName(event.target.value);
                }}
                value={shippingLastName}
              />
            </div>
          </div>
          <div id={styles.inputRow}>
            <div id={styles.inputContainer}>
              <p>Address 1</p>
              <input
                type="text"
                placeholder="Address 1"
                spellCheck={false}
                onChange={(event) => {
                  setShippingAddress1(event.target.value);
                }}
                value={shippingAddress1}
              />
            </div>
          </div>
          <div id={styles.inputRow}>
            <div id={styles.inputContainer}>
              <p>Address 2</p>
              <input
                type="text"
                placeholder="Address 2"
                spellCheck={false}
                onChange={(event) => {
                  setShippingAddress2(event.target.value);
                }}
                value={shippingAddress2}
              />
            </div>
          </div>
          <div id={styles.inputRow}>
            <div id={styles.inputContainer}>
              <p>Country</p>
              <CountryDropdown
                id={styles.countryDropdown}
                priorityOptions={['US', 'CA']}
                value={shippingCountry}
                onChange={(val) => setShippingCountry(val)}
              />
            </div>
            <div id={styles.inputContainer}>
              <p>State</p>
              <RegionDropdown
                id={styles.regionDropdown}
                disableWhenEmpty
                country={shippingCountry}
                value={shippingState}
                onChange={(val) => setShippingState(val)}
              />
            </div>
          </div>
          <div id={styles.inputRow}>
            <div id={styles.inputContainer}>
              <p>City</p>
              <input
                type="text"
                placeholder="City"
                spellCheck={false}
                onChange={(event) => {
                  setShippingCity(event.target.value);
                }}
                value={shippingCity}
              />
            </div>
            <div id={styles.inputContainer}>
              <p>Zip Code</p>
              <input
                type="text"
                placeholder="Zip Code"
                spellCheck={false}
                onChange={(event) => {
                  setShippingZipCode(event.target.value);
                }}
                value={shippingZipCode}
              />
            </div>
          </div>
        </div>
      );
    }
    return <div />;
  };

  const billingPage = () => {
    if (selectedPage === 'billing') {
      return (
        <div id={styles.content}>
          <div id={styles.inputRow}>
            <div id={styles.inputContainer}>
              <p>Profile Name</p>
              <input
                type="text"
                placeholder="Profile Name"
                spellCheck={false}
                onChange={(event) => {
                  setProfileName(event.target.value);
                }}
                value={profileName}
              />
            </div>
          </div>
          <div id={styles.inputRow}>
            <div id={styles.inputContainer}>
              <p>First Name</p>
              <input
                type="text"
                placeholder="First Name"
                spellCheck={false}
                disabled={sameBillingAndShipping}
                onChange={(event) => {
                  setBillingFirstName(event.target.value);
                }}
                // value={billingFirstName}
                value={
                  sameBillingAndShipping ? shippingFirstName : billingFirstName
                }
              />
            </div>
            <div id={styles.inputContainer}>
              <p>Last Name</p>
              <input
                type="text"
                placeholder="Last Name"
                spellCheck={false}
                disabled={sameBillingAndShipping}
                onChange={(event) => {
                  setBillingLastName(event.target.value);
                }}
                value={
                  sameBillingAndShipping ? shippingLastName : billingLastName
                }
              />
            </div>
          </div>
          <div id={styles.inputRow}>
            <div id={styles.inputContainer}>
              <p>Address 1</p>
              <input
                type="text"
                placeholder="Address 1"
                spellCheck={false}
                disabled={sameBillingAndShipping}
                onChange={(event) => {
                  setBillingAddress1(event.target.value);
                }}
                value={
                  sameBillingAndShipping ? shippingAddress1 : billingAddress1
                }
              />
            </div>
          </div>
          <div id={styles.inputRow}>
            <div id={styles.inputContainer}>
              <p>Address 2</p>
              <input
                type="text"
                placeholder="Address 2"
                spellCheck={false}
                disabled={sameBillingAndShipping}
                onChange={(event) => {
                  setBillingAddress2(event.target.value);
                }}
                value={
                  sameBillingAndShipping ? shippingAddress2 : billingAddress2
                }
              />
            </div>
          </div>
          <div id={styles.inputRow}>
            <div id={styles.inputContainer}>
              <p>Country</p>
              <CountryDropdown
                id={styles.countryDropdown}
                priorityOptions={['US', 'CA']}
                disabled={sameBillingAndShipping}
                value={
                  sameBillingAndShipping ? shippingCountry : billingCountry
                }
                onChange={(val) => setBillingCountry(val)}
              />
            </div>
            <div id={styles.inputContainer}>
              <p>State</p>
              <RegionDropdown
                id={styles.regionDropdown}
                disableWhenEmpty
                disabled={sameBillingAndShipping}
                country={
                  sameBillingAndShipping ? shippingCountry : billingCountry
                }
                value={sameBillingAndShipping ? shippingState : billingState}
                onChange={(val) => setBillingState(val)}
              />
            </div>
          </div>
          <div id={styles.inputRow}>
            <div id={styles.inputContainer}>
              <p>City</p>
              <input
                type="text"
                placeholder="City"
                spellCheck={false}
                disabled={sameBillingAndShipping}
                onChange={(event) => {
                  setBillingCity(event.target.value);
                }}
                value={sameBillingAndShipping ? shippingCity : billingCity}
              />
            </div>
            <div id={styles.inputContainer}>
              <p>Zip Code</p>
              <input
                type="text"
                placeholder="Zip Code"
                spellCheck={false}
                disabled={sameBillingAndShipping}
                onChange={(event) => {
                  setBillingZipCode(event.target.value);
                }}
                value={
                  sameBillingAndShipping ? shippingZipCode : billingZipCode
                }
              />
            </div>
          </div>
        </div>
      );
    }
    return <div />;
  };

  const paymentPage = () => {
    if (selectedPage === 'payment') {
      return (
        <div id={styles.content}>
          <div id={styles.cardRow}>
            <Card
              cardType={cardType}
              number={cardNumber}
              name={cardHolder}
              expiry={cardExpiry}
            />
          </div>
          <div id={styles.inputRow}>
            <div id={styles.inputContainer}>
              <p>Card Holder</p>
              <input
                type="text"
                placeholder="Card Holder"
                spellCheck={false}
                onChange={(event) => {
                  setCardHolder(event.target.value);
                }}
                value={cardHolder}
              />
            </div>
          </div>
          <div id={styles.inputRow}>
            <div id={styles.inputContainer}>
              <p>Card Number</p>
              <input
                type="text"
                placeholder="Card Number"
                spellCheck={false}
                onChange={(event) => {
                  const target = event.target as HTMLInputElement;
                  const inputType = event.nativeEvent as InputEvent;
                  parseNumber(target.value, inputType);
                }}
                value={cardNumber}
              />
            </div>
          </div>
          <div id={styles.inputRow}>
            <div id={styles.inputContainer}>
              <p>Expiration Date</p>
              <input
                type="text"
                placeholder="MM/YY"
                spellCheck={false}
                onChange={(event) => {
                  const target = event.target as HTMLInputElement;
                  const inputType = event.nativeEvent as InputEvent;
                  parseExpiry(target.value, inputType);
                }}
                value={cardExpiry}
              />
            </div>
            <div id={styles.inputContainer}>
              <p>CVV</p>
              <input
                type="text"
                placeholder="CVV"
                spellCheck={false}
                onChange={(event) => {
                  const target = event.target as HTMLInputElement;
                  parseCvv(target.value);
                }}
                value={cardCvv}
              />
            </div>
          </div>
        </div>
      );
    }
    return <div />;
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
        <div id={getContainerStyle()} className={styles.transition}>
          <div id={styles.header}>
            <p>{editProfile ? 'Edit Profile' : 'Create Profile'}</p>
            <div id={styles.buttons}>
              <div id={styles.buttonContainer}>
                <button
                  type="button"
                  id={getButtonStyle('shipping')}
                  onClick={() => {
                    setSelectedPage('shipping');
                  }}
                  tabIndex={-1}
                >
                  Shipping
                </button>
                <button
                  type="button"
                  id={getButtonStyle('billing')}
                  onClick={() => {
                    setSelectedPage('billing');
                  }}
                  tabIndex={-1}
                >
                  Billing
                </button>
                <button
                  type="button"
                  id={getButtonStyle('payment')}
                  onClick={() => {
                    setSelectedPage('payment');
                  }}
                  tabIndex={-1}
                >
                  Payment
                </button>
              </div>
              <button
                type="button"
                className="canClose"
                id={styles.DeleteTasksButtonContainer}
                tabIndex={-1}
              >
                <img height={8} width={8} src={DeleteTasksButton} alt="?" />
              </button>
            </div>
          </div>
          {shippingPage()}
          {billingPage()}
          {paymentPage()}
          <div id={styles.content2}>
            <div id={styles.buttons}>
              <label id={styles.checkboxLabel} htmlFor={styles.checkbox}>
                Same shipping and billing
                <input
                  id={styles.checkbox}
                  type="checkbox"
                  onChange={(e) => {
                    setSameBillingAndShipping(e.target.checked);
                  }}
                  defaultChecked={sameBillingAndShipping}
                  value={sameBillingAndShipping ? 'on' : 'off'}
                  tabIndex={-1}
                />
              </label>
              <button
                id={styles.save}
                type="button"
                onClick={saveProfile}
                tabIndex={-1}
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
