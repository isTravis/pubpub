import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { InputGroup } from '@blueprintjs/core';
import dateFormat from 'dateformat';

const propTypes = {
	onSelectDate: PropTypes.func.isRequired,
	date: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
};

const isValidDate = (date) => !Number.isNaN(date.valueOf());

const getDateFromEvent = (evt) => {
	const { value } = evt.target;
	if (value) {
		const [year, month, day] = value.split('-');
		if (year && year.length === 4 && !year.startsWith('0') && month && day) {
			const date = new Date(value);
			if (isValidDate(date)) {
				return date;
			}
		}
		throw new Error();
	}
	return null;
};

const getInputValueFromDateProp = (dateProp) => {
	if (dateProp) {
		const date = new Date(dateProp);
		if (isValidDate(date)) {
			return dateFormat(date, 'UTC:yyyy-mm-dd');
		}
		throw new Error();
	}
	return dateProp;
};

const getEarlyRenderableProps = (dateProp, hasMounted) => {
	if (!hasMounted) {
		try {
			const value = getInputValueFromDateProp(dateProp);
			return { value: value };
		} catch (_) {
			return {};
		}
	}
	return {};
};

const DatePicker = (props) => {
	const { date: dateProp, onSelectDate, ...restProps } = props;
	const inputRef = useRef();
	const [hasMounted, setHasMounted] = useState(false);

	useEffect(() => setHasMounted(true), []);

	useEffect(() => {
		const { current: input } = inputRef;
		if (input) {
			try {
				const value = getInputValueFromDateProp(dateProp);
				input.value = value;
			} catch (_) {
				// Don't do anything with an invalid date
			}
		}
	}, [dateProp]);

	const handleInput = useCallback(
		(evt) => {
			try {
				const nextDate = getDateFromEvent(evt);
				onSelectDate(nextDate);
			} catch (_) {
				// Don't do anything with an invalid date
			}
		},
		[onSelectDate],
	);

	return (
		<InputGroup
			placeholder="YYYY-MM-DD"
			{...restProps}
			{...getEarlyRenderableProps(dateProp, hasMounted)}
			type="date"
			inputRef={inputRef}
			onInput={handleInput}
		/>
	);
};

DatePicker.propTypes = propTypes;
export default DatePicker;
