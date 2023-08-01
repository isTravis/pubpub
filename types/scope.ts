import {
	ScopeSummary as ScopeSummaryModel,
	UserScopeVisit as UserScopeVisitModel,
} from 'server/models';
import { SerializedModel } from './recursiveAttributes';

export type ScopeId = { communityId: string } & ({ pubId: string } | { collectionId: string } | {});

export type SingleScopeId = { communityId: string } | { pubId: string } | { collectionId: string };

export type ScopeSummary = SerializedModel<ScopeSummaryModel>;
export type UserScopeVisit = SerializedModel<UserScopeVisitModel>;
