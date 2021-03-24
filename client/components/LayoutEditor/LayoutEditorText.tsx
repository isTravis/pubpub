import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { Node } from 'prosemirror-model';

import { GridWrapper } from 'components';
import { FormattingBar, buttons } from 'components/FormattingBar';
import Editor, { EditorChangeObject } from 'components/Editor';

import { LayoutBlockText } from 'utils/layout';
import { DocJson } from 'utils/types';

type Content = LayoutBlockText['content'];

type Props = {
	onChange: (index: number, content: Partial<Content>) => unknown;
	content: Content;
	layoutIndex: number;
};

const LayoutEditorText = (props: Props) => {
	const { onChange, content, layoutIndex } = props;

	const formattingWrapperRef = useRef<null | HTMLDivElement>(null);
	const [editorChangeObject, setEditorChangeObject] = useState<EditorChangeObject>();

	const handleEdit = useCallback(
		(doc: Node) => onChange(layoutIndex, { text: doc.toJSON() as DocJson }),
		[layoutIndex, onChange],
	);

	return (
		<div className="layout-editor-text-component">
			<div className="block-header">
				<div className="formatting-wrapper" ref={formattingWrapperRef}>
					<FormattingBar
						editorChangeObject={editorChangeObject!}
						buttons={buttons.layoutEditorButtonSet}
						containerRef={formattingWrapperRef}
					/>
				</div>
			</div>
			<div className="block-content">
				<GridWrapper>
					<Editor
						placeholder="Enter text..."
						initialContent={content.text}
						onChange={setEditorChangeObject}
						onEdit={handleEdit}
						debounceEditsMs={300}
					/>
				</GridWrapper>
			</div>
		</div>
	);
};

export default LayoutEditorText;
