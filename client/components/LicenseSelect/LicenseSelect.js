import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { Icon, Popover, Menu, MenuItem } from '@blueprintjs/core';
import dateFormat from 'dateformat';

import { licenses, getLicenseBySlug } from 'shared/license';
import { apiFetch } from 'utils';
import { PageContext } from 'components/PageWrapper/PageWrapper';
import { getPubPublishedDate } from 'shared/pub/pubDates';

require('./licenseSelect.scss');

const propTypes = {
	children: PropTypes.func.isRequired,
	pubData: PropTypes.shape({
		id: PropTypes.string,
		licenseSlug: PropTypes.string,
		collectionPubs: PropTypes.object,
		activeBranch: PropTypes.object,
	}).isRequired,
	onSelect: PropTypes.func,
	updateLocalData: PropTypes.func,
	persistSelections: PropTypes.bool,
};

const defaultProps = {
	onSelect: () => {},
	updateLocalData: () => {},
	persistSelections: true,
};

const LicenseSelect = (props) => {
	const { children, onSelect, persistSelections, pubData, updateLocalData } = props;
	const [isPersisting, setIsPersisting] = useState(false);
	const { communityData } = useContext(PageContext);

	const currentLicense = getLicenseBySlug(pubData.licenseSlug);
	const primaryCollectionPub = pubData.collectionPubs.find((cp) => cp.isPrimary);
	let pubCopyrightDate = dateFormat(getPubPublishedDate(pubData, pubData.activeBranch), 'yyyy');
	if (primaryCollectionPub && primaryCollectionPub.collection.metadata.copyrightYear) {
		pubCopyrightDate = primaryCollectionPub.collection.metadata.copyrightYear;
	}
	let pubPublisher = communityData.title;
	if (communityData.id === '78810858-8c4a-4435-a669-6bb176b61d40') {
		pubPublisher = 'Massachusetts Institute of Technology';
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
											Copyright © {pubCopyrightDate} {pubPublisher}. All
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

LicenseSelect.propTypes = propTypes;
LicenseSelect.defaultProps = defaultProps;
export default LicenseSelect;
