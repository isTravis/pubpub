import { AttributionWithUser, Collection, Maybe, RenderedLicense } from 'types';
import { NodeLabelMap, Note } from 'components/Editor';
import { NoteManager } from 'client/utils/notes';
import { CitationInlineStyleKind, CitationStyleKind } from 'utils/citations';
import { RenderedStructuredValue } from 'utils/notesCore';

export type PubMetadata = {
	title: string;
	slug: string;
	pubUrl: string;
	doi: null | string;
	publishedDateString: Maybe<string>;
	updatedDateString: Maybe<string>;
	communityTitle: string;
	accentColor: string;
	attributions: AttributionWithUser[];
	citationStyle: CitationStyleKind;
	citationInlineStyle: CitationInlineStyleKind;
	nodeLabels: NodeLabelMap;
	publisher?: string;
	primaryCollectionKind?: Collection['kind'];
	primaryCollectionTitle?: string;
	primaryCollectionMetadata?: Record<string, any>;
	license: RenderedLicense;
};

export type NoteWithStructuredHtml = Note & { structuredHtml?: string };

export type NotesData = {
	renderedStructuredValues: Record<string, RenderedStructuredValue>;
	noteManager: NoteManager;
	citations: NoteWithStructuredHtml[];
	footnotes: NoteWithStructuredHtml[];
};

export type PandocFlag = {
	name: string;
	enabled: boolean;
};
