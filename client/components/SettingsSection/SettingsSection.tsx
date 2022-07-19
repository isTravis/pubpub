import React, { useEffect, useState } from 'react';
import classNames from 'classnames';

import { slugifyString } from 'utils/strings';

require('./settingsSection.scss');

type Props = {
	className?: string;
	title: React.ReactNode;
	id?: string;
	children: React.ReactNode;
	compact?: boolean;
	gradient?: boolean;
};

const SettingsSection = (props: Props) => {
	const { className, title, id, children, gradient = false, compact = false } = props;
	const [emphasized, setEmphasized] = useState(false);

	useEffect(() => {
		if (window && id && id === window.location.hash.slice(1)) {
			setEmphasized(true);
		}
	}, [id]);

	return (
		<div
			id={id || slugifyString(title)}
			role="none"
			onClick={() => setEmphasized(false)}
			className={classNames(
				'settings-section-component',
				compact && 'compact',
				emphasized && 'emphasized',
				className,
			)}
		>
			<div className="left-title">{title}</div>
			<div className="content-area">
				{gradient && <div className="gradient" />}
				<div className="title-area">
					<div className="title">{title}</div>
				</div>
				<div className="content">{children}</div>
			</div>
		</div>
	);
};

export default SettingsSection;
