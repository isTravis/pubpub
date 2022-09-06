import React from 'react';
import classNames from 'classnames';
import { Button } from 'reakit';

import { PubHeaderBackground } from 'components';
import { CascadedFacetType, PubHeaderTheme } from 'facets';

type Props = {
	className?: string;
	communityData: any;
	label: React.ReactNode;
	onClick: (...args: any[]) => any;
	selected?: boolean;
	style?: any;
	pubHeaderTheme: CascadedFacetType<typeof PubHeaderTheme>;
};

const TextStyleChoice = React.forwardRef((props: Props, ref) => {
	const {
		label,
		className,
		onClick,
		selected = false,
		style = {},
		communityData,
		pubHeaderTheme,
	} = props;

	return (
		// @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
		<Button
			className={classNames('text-style-choice')}
			onClick={onClick}
			ref={ref}
			title={label}
		>
			<PubHeaderBackground
				communityData={communityData}
				blur={true}
				className={classNames('example', className, 'selectable', selected && 'selected')}
				style={style || {}}
				pubHeaderTheme={pubHeaderTheme}
			>
				<div className="example-text">Aa</div>
			</PubHeaderBackground>
			<div className="label">{label}</div>
		</Button>
	);
});

export default TextStyleChoice;
