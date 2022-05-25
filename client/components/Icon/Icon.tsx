import React from 'react';
import classNames from 'classnames';
import {
	Icon as BlueprintIcon,
	IconName as BlueprintIconName,
	Intent as BlueprintIntent,
} from '@blueprintjs/core';

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
	intent?: BlueprintIntent;
};

const Icon = (props: Props) => {
	const {
		ariaHidden = true,
		ariaLabel = '',
		className,
		color,
		icon,
		iconSize = 16,
		useColor = false,
		intent,
	} = props;
	if (customIcons[icon]) {
		const { squareViewboxDimension, path, viewbox: providedViewbox } = customIcons[icon];
		const viewbox =
			providedViewbox || `0 0 ${squareViewboxDimension} ${squareViewboxDimension}`;
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
					viewBox={viewbox}
					fill={color}
				>
					{path}
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
			intent={intent}
		/>
	);
};

export default Icon;
