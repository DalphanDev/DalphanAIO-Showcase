import styles from './Card.module.scss';

export default function Card({
  cardType,
  number,
  name,
  expiry,
}: {
  cardType: string;
  number: string;
  name: string;
  expiry: string;
}) {
  const map16DigitCard = (cardNumber: string) => {
    // 16 digit card is 4 digits, 4 digits, 4 digits, 4 digits
    // Character-wise its an length of 19 characters.
    let newCharString = cardNumber;

    for (let i = cardNumber.length; i < 19; i += 1) {
      if (i === 4 || i === 9 || i === 14) {
        newCharString += ' ';
      } else {
        newCharString += '•';
      }
    }

    return newCharString;
  };

  const mapAmexCard = (cardNumber: string) => {
    // Amex card is 4 digits, 6 digits, 5 digits
    // Character-wise its an length of 17 characters.

    let newCharString = cardNumber;

    for (let i = cardNumber.length; i < 17; i += 1) {
      if (i === 4 || i === 11) {
        newCharString += ' ';
      } else {
        newCharString += '•';
      }
    }

    return newCharString;
  };

  return (
    <div id={`${styles.cardBg}`}>
      <div id={`${styles[cardType]}`} />
      <div id={styles.cardChip} />
      <div id={styles.cardNumber}>
        {cardType === 'amex' ? mapAmexCard(number) : map16DigitCard(number)}
      </div>
      <div id={styles.cardExpiry}>Exp: {expiry}</div>
      <div placeholder="Enter Name" id={styles.cardName}>
        {name === '' ? 'Enter Name' : name}
      </div>
    </div>
  );
}
