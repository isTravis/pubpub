export const intersperse = (arr, val) => {
	const res = [];
	arr.forEach((el, index) => {
		res.push(el);
		if (index !== arr.length - 1) {
			const resolvedVal = typeof val === 'function' ? val(index) : val;
			res.push(resolvedVal);
		}
	});
	return res;
};

export const pruneFalsyValues = (arr) => arr.filter(Boolean);
