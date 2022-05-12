import React, { useState } from 'react';

import { usePageContext } from 'utils/hooks';
import { apiFetch } from 'client/utils/apiFetch';

import GlobalControlsButton from './GlobalControlsButton';

const CreatePubButton = () => {
	const [isLoading, setIsLoading] = useState(false);
	const { communityData } = usePageContext();

	const handleCreatePub = () => {
		setIsLoading(true);
		return apiFetch
			.post('/api/pubs', { communityId: communityData.id })
			.then((newPub) => {
				window.location.href = `/pub/${newPub.slug}`;
			})
			.catch((err) => {
				console.error(err);
				setIsLoading(false);
			});
	};

	return (
		<GlobalControlsButton
			loading={isLoading}
			onClick={handleCreatePub}
			desktop={{ text: 'Create Pub' }}
			mobile={{ icon: 'add-to-artifact' }}
		/>
	);
};

export default CreatePubButton;
