import React from 'react';
import classNames from 'classnames';
import { Icon as BlueprintIcon, IconName as BlueprintIconName } from '@blueprintjs/core';

import customIcons from './customIcons';

require('./icon.scss');

type CustomIconName = keyof typeof customIcons;
export type IconName = BlueprintIconName | CustomIconName;

type Props = {
	ariaHidden?: boolean;
	ariaLabel?: string;
	className?: string;
	color?: string;
	icon: IconName;
	iconSize?: number;
	useColor?: boolean;
};

const Icon = (props: Props) => {
	const {
		ariaHidden = false,
		ariaLabel = '',
		className,
		color,
		icon,
		iconSize = 16,
		useColor = false,
	} = props;
	if (customIcons[icon]) {
		const viewbox = customIcons[icon].viewboxDefault;
		return (
			<span
				className={classNames('bp3-icon', useColor && 'color', className)}
				data-icon={icon.toLowerCase().replace(/_/gi, '-')}
				aria-label={ariaLabel}
				aria-hidden={ariaHidden}
			>
				<svg
					width={`${iconSize}px`}
					height={`${iconSize}px`}
					viewBox={`0 0 ${viewbox} ${viewbox}`}
					fill={color}
				>
					{customIcons[icon].path}
				</svg>
			</span>
		);
	}

	return (
		<BlueprintIcon
			icon={icon as BlueprintIconName}
			color={color}
			iconSize={iconSize}
			className={className}
			title={ariaHidden ? null : ariaLabel}
		/>
	);
};

export default Icon;
