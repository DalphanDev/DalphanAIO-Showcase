import React, { useState, useRef, useEffect } from 'react';
import styles from './Select.module.scss';

interface Option {
  value: string;
  label: string;
}

export default function Select({
  isMulti = false,
  options,
  value,
  setValue,
  placeholder,
}: {
  // eslint-disable-next-line react/require-default-props
  isMulti?: boolean;
  options: Option[];
  value: Option | Option[]; // Depending on isMulti
  setValue: React.Dispatch<React.SetStateAction<Option | Option[]>>; // Depending on isMulti
  placeholder: string;
}) {
  const [displayOptions, setDisplayOptions] = useState(false);
  const [query, setQuery] = useState('');
  const [noOptions, setNoOptions] = useState(true);
  const liClickedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Type guard to check if value is an array of SingleValue
  const isValueArray = (myValue: Option | Option[]): myValue is Option[] => {
    return Array.isArray(myValue);
  };

  const handleBlur = () => {
    // if li was clicked, don't hide options

    if (liClickedRef.current) {
      liClickedRef.current = false;
      return;
    }

    setDisplayOptions(false);
    setQuery('');
  };

  const handleLiClick = (option: Option, e: any) => {
    liClickedRef.current = false;
    if (inputRef.current === null) {
      return;
    }

    if (isValueArray(value)) {
      let newValueArray = [...value];
      if (e.shiftKey && value.length > 0) {
        const targetIndex = options.findIndex(
          (opy) => option.value === opy.value,
        );

        // Find the least index among selected options
        const leastIndex = value.reduce((least, val) => {
          const index = options.findIndex((opy) => opy.value === val.value);
          return index < least ? index : least;
        }, Infinity);

        if (newValueArray.some((val) => val.value === option.value)) {
          // Mass unselecting the options.
          newValueArray = newValueArray.filter((val) => {
            const optionIndex = options.findIndex(
              (opy) => opy.value === val.value,
            );
            return optionIndex < targetIndex;
          });
        } else {
          // Mass selecting the options.

          // Determine whether to add the options forward or backward.

          // eslint-disable-next-line no-lonely-if
          if (targetIndex < leastIndex) {
            // Add the options backward
            const toAdd = options.slice(targetIndex, leastIndex + 1);
            newValueArray = [...newValueArray, ...toAdd];
          } else {
            // Add the options forward
            const toAdd = options
              .slice(leastIndex, targetIndex + 1)
              .filter((option2) => {
                return !newValueArray.some(
                  (val) => val.value === option2.value,
                );
              });
            newValueArray = [...newValueArray, ...toAdd];
          }
        }
        setValue(newValueArray);
        setQuery('');
        // Sadly since we are using a span trick, we need to edit the DOM.
        inputRef.current.textContent = '';
        inputRef.current.focus();
        return;
      }

      // Single selection logic
      if (newValueArray.some((val) => val.value === option.value)) {
        newValueArray = newValueArray.filter(
          (val) => val.value !== option.value,
        );
      } else {
        newValueArray.push(option);
      }
      setValue(newValueArray);
      setQuery('');
      // Sadly since we are using a span trick, we need to edit the DOM.
      inputRef.current.textContent = '';
      inputRef.current.focus();
      return;
    }

    // Single-value logic
    setValue(option); // This will update the label
    setQuery(''); // This will reset the query.
    inputRef.current.blur(); // Then unfocus the input.
    setDisplayOptions(false); // Close the dropdown
  };

  const handleMouseDown = () => {
    liClickedRef.current = true;
  };

  // Function to handle the div click
  const handleDivClick = (e: any) => {
    // Check to see if an li was clicked, if so, don't hide the options.
    // Otherwise, hide the options.

    if (
      e.target.localName === 'li' ||
      e.target.localName === 'ul' ||
      e.target.localName === 'svg'
    ) {
      return;
    }

    // Now, focus the input, and invert the displayOptions.
    if (inputRef.current !== null) {
      e.preventDefault();
      inputRef.current.focus();

      // Invert the displayOptions

      setDisplayOptions(!displayOptions);
    }
  };

  const singlePlaceholder = () => {
    if (query === '') {
      if (
        (value as Option).label === '' ||
        (value as Option).label === undefined
      ) {
        return placeholder;
      }
      return (value as Option).label;
    }
    return '';
  };

  const multiLabeler = () => {
    const labels = (value as Option[]).map((v) => v.label).join(', ');
    if (labels === '') {
      if (query === '') {
        return placeholder;
      }
      return '';
    }
    return labels;
  };

  const renderSelections = () => {
    if (isMulti) {
      if (isValueArray(value)) {
        let labels = value.map((v) => v.label).join(', ');
        let placeholderClass = '';
        if (labels === '') {
          if (query === '') {
            labels = placeholder;
            placeholderClass = styles.placeholder;
          }
        }
        return (
          <div id={styles.selectionFlex}>
            <p
              className={`${styles.label} ${placeholderClass}`}
              spellCheck="false"
            >
              {/* {labels} */}
              {multiLabeler()}
            </p>
            <span
              role="presentation"
              contentEditable
              className={styles.query}
              ref={inputRef}
              spellCheck="false"
              onInput={(e: any) => {
                setQuery(e.target.textContent);
              }}
              onKeyDown={(e) => {
                if (inputRef.current === null) {
                  return;
                }

                const currentQuery = inputRef.current.textContent;

                if (e.code === 'Backspace' && currentQuery === '') {
                  e.preventDefault();
                  setValue(value.slice(0, value.length - 1));
                }
              }}
              onBlur={handleBlur}
            />
          </div>
        );
      }
      return null;
    }
    let placeholderClass = '';
    if (
      query === '' &&
      ((value as Option).label === '' || (value as Option).label === undefined)
    ) {
      placeholderClass = styles.placeholder;
    }

    return (
      <div id={styles.selectionFlexSingle}>
        <p className={`${styles.label} ${placeholderClass}`} spellCheck="false">
          {singlePlaceholder()}
        </p>
        <input
          className={styles.query}
          ref={inputRef}
          spellCheck="false"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          onBlur={handleBlur}
        />
      </div>
    );
  };

  const renderClearButton = () => {
    if (isMulti) {
      if (isValueArray(value)) {
        if (value.length !== 0) {
          return (
            <button
              type="button"
              id={styles.clearButton}
              tabIndex={-1}
              onClick={() => {
                setValue([]);

                if (inputRef.current !== null) {
                  inputRef.current.focus();
                }
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          );
        }
      }
      return null;
    }
    return null;
  };

  useEffect(() => {
    const anyOptions = options.some((option) =>
      option.label.toLowerCase().includes(query.toLowerCase()),
    );
    setNoOptions(!anyOptions);
  }, [options, query]); // Update noOptions whenever options or query changes

  return (
    <div
      role="presentation"
      id={styles.container}
      className="selectDiv"
      onMouseDown={handleDivClick}
    >
      {renderSelections()}
      {renderClearButton()}
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
          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
        />
      </svg>
      {displayOptions && (
        <ul id={styles.optionsContainer}>
          {options.map((option) => {
            // Now filter according to the query
            if (query !== '') {
              if (!option.label.toLowerCase().includes(query.toLowerCase())) {
                return null;
              }
            }

            // Check if isMulti is true
            if (isMulti) {
              return (
                <li
                  key={option.value}
                  className={styles.option}
                  role="presentation"
                  onMouseDown={handleMouseDown}
                  onClick={(e) => handleLiClick(option, e)}
                >
                  <div className={styles.checkbox}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className={`w-5 h-5 ${styles.fader} ${
                        (value as Option[]).some(
                          (val: Option) => val.value === option.value,
                        )
                          ? styles.visible
                          : ''
                      }`}
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>

                  <p>{option.label}</p>
                </li>
              );
            }

            return (
              <li
                className={styles.option}
                role="presentation"
                onMouseDown={handleMouseDown}
                onClick={(e) => handleLiClick(option, e)}
              >
                <p>{option.label}</p>
              </li>
            );
          })}
          {noOptions && <li id={styles.noOption}>No options</li>}
        </ul>
      )}
    </div>
  );
}
