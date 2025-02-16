import { useState, useEffect } from 'react';

const useDebounceSearch = (searchTerm, delay = 500) => {
	const [debouncedValue, setDebouncedValue] = useState(searchTerm);

	useEffect(() => {
		// Create a timeout to delay setting the debounced value
		const timeoutId = setTimeout(() => {
			setDebouncedValue(searchTerm);
		}, delay);

		// Cleanup function to clear the timeout if searchTerm changes before delay has elapsed
		return () => {
			clearTimeout(timeoutId);
		};
	}, [searchTerm, delay]);

	return debouncedValue;
};

export default useDebounceSearch; 