import React, { useState } from 'react';
import { Icon, Popover, Menu, MenuItem } from '@blueprintjs/core';

import { licenses, getLicenseBySlug } from 'utils/licenses';
import { usePageContext } from 'utils/hooks';
import { getPubCopyrightYear } from 'utils/pub/pubDates';
import { apiFetch } from 'client/utils/apiFetch';
import { Pub, CollectionPub } from 'utils/types';

require('./licenseSelect.scss');

type OwnProps = {
	children: (...args: any[]) => any;
	pubData: DefinitelyHas<Pub, 'releases'> & {
		collectionPubs: DefinitelyHas<CollectionPub, 'collection'>[];
	};
	onSelect?: (...args: any[]) => any;
	updateLocalData?: (...args: any[]) => any;
	persistSelections?: boolean;
};

const defaultProps = {
	onSelect: () => {},
	updateLocalData: () => {},
	persistSelections: true,
};

type Props = OwnProps & typeof defaultProps;

const LicenseSelect = (props: Props) => {
	const { children, onSelect, persistSelections, pubData, updateLocalData } = props;
	const [isPersisting, setIsPersisting] = useState(false);
	const { communityData } = usePageContext();
	const currentLicense = getLicenseBySlug(pubData.licenseSlug)!;
	const pubCopyrightYear = getPubCopyrightYear(pubData);
	let pubPublisher = communityData.title;
	if (communityData.id === '78810858-8c4a-4435-a669-6bb176b61d40') {
		pubPublisher = 'Massachusetts Institute of Technology';
	}
	if (currentLicense.slug === 'copyright') {
		currentLicense.full = `Copyright © ${pubCopyrightYear} ${pubPublisher}. All rights reserved.`;
	}
	const selectLicense = (license) => {
		onSelect(license);
		if (persistSelections) {
			setIsPersisting(true);
			apiFetch('/api/pubs', {
				method: 'PUT',
				body: JSON.stringify({
					licenseSlug: license.slug,
					pubId: pubData.id,
					communityId: communityData.id,
				}),
			}).then(() => {
				setIsPersisting(false);
				updateLocalData('pub', { licenseSlug: license.slug });
			});
		}
	};

	const renderIcon = (license) => (
		<img width={75} alt="" src={`/static/license/${license.slug}.svg`} />
	);

	const renderMenu = () => {
		return (
			<Menu>
				{licenses
					.filter((license) => {
						return communityData.premiumLicenseFlag || !license.requiresPremium;
					})
					.map((license) => (
						<MenuItem
							key={license.slug}
							onClick={() => selectLicense(license)}
							className="license-select-component__menu-item"
							text={
								<div>
									<div className="title">
										{license.short}{' '}
										{license.link && (
											<a
												href={license.link}
												className="link"
												onClick={(e) => e.stopPropagation()}
												target="_blank"
												rel="noopener noreferrer"
											>
												Learn more
												<Icon iconSize={12} icon="share" />
											</a>
										)}
									</div>
									{license.slug === 'copyright' && (
										<div className="full">
											Copyright © {pubCopyrightYear} {pubPublisher}. All
											rights reserved.
										</div>
									)}
									{license.slug !== 'copyright' && (
										<div className="full">{license.full}</div>
									)}
								</div>
							}
							icon={renderIcon(license)}
							labelElement={
								license.slug === currentLicense.slug && <Icon icon="tick" />
							}
						/>
					))}
			</Menu>
		);
	};

	return (
		<Popover content={renderMenu()}>
			{children({
				icon: renderIcon(currentLicense),
				title: currentLicense.full,
				isPersisting: isPersisting,
			})}
		</Popover>
	);
};
LicenseSelect.defaultProps = defaultProps;
export default LicenseSelect;
