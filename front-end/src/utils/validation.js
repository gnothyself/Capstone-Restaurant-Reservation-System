function mobileFormat(phoneNumber, currentLength) {
	if (phoneNumber[phoneNumber.length - 1] === "-") {
		phoneNumber = phoneNumber.slice(0, phoneNumber.length - 1);
	}
	if (phoneNumber.length === 3) {
		if (currentLength < phoneNumber.length) {
			phoneNumber += "-";
		}
	}

	if (phoneNumber.length >= 9) {
		if (!phoneNumber.includes("-")) {
			const temp1 = phoneNumber.substr(0, 3);
			const temp2 = phoneNumber.substr(3, 3);
			const temp3 = phoneNumber.substr(6, 4);
			phoneNumber = `${temp1}-${temp2}-${temp3}`;
		} else if (phoneNumber[7] !== "-") {
			const temp1 = phoneNumber.substr(0, 3);
			const temp2 = phoneNumber.substr(4, 3);
			const temp3 = phoneNumber.substr(7, 4);
			phoneNumber = `${temp1}-${temp2}-${temp3}`;
		}
	}
	if (phoneNumber.length > 12) {
		phoneNumber = phoneNumber.slice(0, 12);
	}
	return phoneNumber;
}

module.exports = {
	mobileFormat,
};