/* eslint-disable @typescript-eslint/no-unused-vars */
import { Attributes, Model } from 'sequelize';
import type * as Types from '../../types';
import type * as Models from '../../server/models';

// type Pub1 = Types.Pub;
// type Pub2 = Attributes<Models.Pub>;

// type Collection1 = Types.Collection;
// type Collection2 = Attributes<Models.Collection>;

// type CollectionPub1 = Types.CollectionPub;
// type CollectionPub2 = Attributes<Models.CollectionPub>;

// type Community1 = Types.Community;
// type Community2 = Attributes<Models.Community>;

// // type Page = Types.Page;
// // type Page2 = Attributes<Models.Page>;

// // type Doc = Types.Doc;
// // type Doc2 = Attributes<Models.Doc>;

// type User1 = Types.User;
// type User2 = Attributes<Models.User>;

// type UserSubscription1 = Types.UserSubscription;
// type UserSubscription2 = Attributes<Models.UserSubscription>;

// type UserNotification1 = Types.UserNotification;
// type UserNotification2 = Attributes<Models.UserNotification>;

type ActivityItem1 = Types.ActivityItem;
type ActivityItem2 = Attributes<Models.ActivityItem>;
type Collection1 = Types.Collection;
type Collection2 = Attributes<Models.Collection>;

type CollectionAttribution1 = Types.CollectionAttribution;
type CollectionAttribution2 = Attributes<Models.CollectionAttribution>;
type CollectionPub1 = Types.CollectionPub;
type CollectionPub2 = Attributes<Models.CollectionPub>;
type Commenter1 = Types.Commenter;
type Commenter2 = Attributes<Models.Commenter>;
type Community1 = Types.Community;
type Community2 = Attributes<Models.Community>;
// type CommunityAdmin1 = Types.CommunityAdmin;
// type CommunityAdmin2 = Attributes<Models.CommunityAdmin>;
type CrossrefDepositRecord1 = Types.DepositRecord;
type CrossrefDepositRecord2 = Attributes<Models.CrossrefDepositRecord>;
// type CustomScript1 = Types.CustomScript;
// type CustomScript2 = Attributes<Models.CustomScript>;
type DepositTarget1 = Types.DepositTarget;
type DepositTarget2 = Attributes<Models.DepositTarget>;
type Discussion1 = Types.Discussion;
type Discussion2 = Attributes<Models.Discussion>;
type DiscussionAnchor1 = Types.DiscussionAnchor;
type DiscussionAnchor2 = Attributes<Models.DiscussionAnchor>;
type Doc1 = Types.Doc;
type Doc2 = Attributes<Models.Doc>;
type Draft1 = Types.Draft;
type Draft2 = Attributes<Models.Draft>;
type Export1 = Types.Export;
type Export2 = Attributes<Models.Export>;
type ExternalPublication1 = Types.ExternalPublication;
type ExternalPublication2 = Attributes<Models.ExternalPublication>;
type FeatureFlag1 = Types.FeatureFlag;
type FeatureFlag2 = Attributes<Models.FeatureFlag>;
type FeatureFlagUser1 = Types.FeatureFlagUser;
type FeatureFlagUser2 = Attributes<Models.FeatureFlagUser>;
type FeatureFlagCommunity1 = Types.FeatureFlagCommunity;
type FeatureFlagCommunity2 = Attributes<Models.FeatureFlagCommunity>;
type ZoteroIntegration1 = Types.ZoteroIntegration;
type ZoteroIntegration2 = Attributes<Models.ZoteroIntegration>;
type IntegrationDataOAuth11 = Types.IntegrationDataOAuth1;
type IntegrationDataOAuth12 = Attributes<Models.IntegrationDataOAuth1>;
type LandingPageFeature1 = Types.LandingPageFeature;
type LandingPageFeature2 = Attributes<Models.LandingPageFeature>;
type Member1 = Types.Member;
type Member2 = Attributes<Models.Member>;
// type Merge1 = Types.Merge;
// type Merge2 = Attributes<Models.Merge>;
// type Organization1 = Types.Organization;
// type Organization2 = Attributes<Models.Organization>;
type Page1 = Types.Page;
type Page2 = Attributes<Models.Page>;
type Pub1 = Types.Pub;
type Pub2 = Attributes<Models.Pub>;
type PubAttribution1 = Types.PubAttribution;
type PubAttribution2 = Attributes<Models.PubAttribution>;
type PubEdge1 = Types.PubEdge;
type PubEdge2 = Attributes<Models.PubEdge>;
// type PubManager1 = Types.PubManager;
// type PubManager2 = Attributes<Models.PubManager>;
type PubVersion1 = Types.PubVersion;
type PubVersion2 = Attributes<Models.PubVersion>;
// type PublicPermissions1 = Types.PublicPermissions;
// type PublicPermissions2 = Attributes<Models.PublicPermissions>;
type Release1 = Types.Release;
type Release2 = Attributes<Models.Release>;
// type ReviewEvent1 = Types.ReviewEvent;
// type ReviewEvent2 = Attributes<Models.ReviewEvent>;
type ScopeSummary1 = Types.ScopeSummary;
type ScopeSummary2 = Attributes<Models.ScopeSummary>;
type Submission1 = Types.Submission;
type Submission2 = Attributes<Models.Submission>;
// type Signup1 = Types.Signup;
// type Signup2 = Attributes<Models.Signup>;
type SpamTag1 = Types.SpamTag;
type SpamTag2 = Attributes<Models.SpamTag>;
type SubmissionWorkflow1 = Types.SubmissionWorkflow;
type SubmissionWorkflow2 = Attributes<Models.SubmissionWorkflow>;
// type ReviewNew1 = Types.ReviewNew;
// type ReviewNew2 = Attributes<Models.ReviewNew>;
type Reviewer1 = Types.Reviewer;
type Reviewer2 = Attributes<Models.Reviewer>;
type Thread1 = Types.Thread;
type Thread2 = Attributes<Models.Thread>;
type ThreadComment1 = Types.ThreadComment;
type ThreadComment2 = Attributes<Models.ThreadComment>;
type ThreadEvent1 = Types.ThreadEvent;
type ThreadEvent2 = Attributes<Models.ThreadEvent>;
type User1 = Types.UserWithPrivateFieldsAndHashedPassword;
type User2 = Attributes<Models.User>;
// type UserDismissable1 = Types.UserDismissable;
// type UserDismissable2 = Attributes<Models.UserDismissable>;
type UserNotification1 = Types.UserNotification;
type UserNotification2 = Attributes<Models.UserNotification>;
type UserNotificationPreferences1 = Types.UserNotificationPreferences;
type UserNotificationPreferences2 = Attributes<Models.UserNotificationPreferences>;
type UserScopeVisit1 = Types.UserScopeVisit;
type UserScopeVisit2 = Attributes<Models.UserScopeVisit>;
type UserSubscription1 = Types.UserSubscription;
type UserSubscription2 = Attributes<Models.UserSubscription>;
type Visibility1 = Types.Visibility;
type Visibility2 = Attributes<Models.Visibility>;
// type FacetBinding1 = Types.FacetBinding;
// type FacetBinding2 = Attributes<Models.FacetBinding>;
type VisibilityUser1 = Types.VisibilityUser;
type VisibilityUser2 = Attributes<Models.VisibilityUser>;
// type WorkerTask1 = Types.WorkerTask;
// type WorkerTask2 = Attributes<Models.WorkerTask>;

// type AllTypes = [
// 	Attributes<Models.ActivityItem>,
// 	Types.ActivityItem,
// 	Attributes<Models.Collection>,
// 	Types.Attribution,
// 	Attributes<Models.CollectionPub>,
// 	Types.CollectionPub,
// 	Attributes<Models.CollectionAttribution>,
// 	Types.CollectionAttribution,
// 	Attributes<Models.Commenter>,
// 	Types.Commenter,
// 	Attributes<Models.Community>,
// 	Types.Community,
// 	// Attributes<Models.CommunityAdmin>,
// 	// Types.CommunityAdmin,
// 	Attributes<Models.CrossrefDepositRecord>,
// 	Types.DepositRecord,
// 	// Attributes<Models.CustomScript>,
// 	// Types.CustomScript,
// 	Attributes<Models.DepositTarget>,
// 	Types.DepositTarget,
// 	Attributes<Models.Discussion>,
// 	Types.Discussion,
// 	Attributes<Models.DiscussionAnchor>,
// 	Types.DiscussionAnchor,
// 	Attributes<Models.Doc>,
// 	Types.Doc,
// 	Attributes<Models.Draft>,
// 	Types.Draft,

//     Attributes<Models.Export>,
//     Types.Export,
//     Attributes<Models.ExternalPublication>,
//     Types.ExternalPublication,

//         Attributes<Models.FeatureFlag>,
//         Types.FeatureFlag,
//         Attributes<Models.FeatureFlagUser>,
//         Types.FeatureFlagUser,
//         Attributes<Models.FeatureFlagCommunity>,
//         Types.FeatureFlagCommunity,
//         Attributes<Models.IntegrationDataOAuth1>
//         ,Types.IntegrationDataOAuth1,
//         Attributes<Models.LandingPageFeature>,
//         Types.LandingPageFeature,
//         Attributes<Models.Member>
//         ,Types.Member,
//         // Attributes<Models.Merge>,
//         // Types.Merge,
//         // Attributes<Models.Organization>,
//         // Types.Organization,
//         Attributes<Models.Page>,
//         Types.Page,

//         Attributes<Models.Pub>,
//         Types.Pub,
//         Attributes<Models.PubAttribution>,
//         Types.PubAttribution,
//         Attributes<Models.PubEdge>,
//         Types.PubEdge,
//         // Attributes<Models.PubManager>
//         // ,Types.PubManager,
//         Attributes<Models.PubVersion>
//         ,
//         Types.PubVersion,
//         // Attributes<Models.PublicPermissions>,
//         // Types.PublicPermissions,
//         Attributes<Models.Release>,
//         Types.Release,
//         Attributes<Models.ReviewEvent>,
//         Types.ReviewEvent,
//         Attributes<Models.ReviewNew>,
//         Types.ReviewNew,
//         Attributes<Models.Reviewer>,
//         Types.Reviewer,
//         Attributes<Models.ScopeSummary>,
//         Types.ScopeSummary,
//         Attributes<Models.Signup>,
//         Types.Signup,
//         Attributes<Models.SpamTag>,
//         Types.SpamTag,
//         Attributes<Models.Submission>,
//         Types.Submission,
//         Attributes<Models.SubmissionWorkflow>,
//         Types.SubmissionWorkflow,
//         Attributes<Models.Thread>,
//         Types.Thread,
//         Attributes<Models.ThreadComment>,
//         Types.ThreadComment,
//         Attributes<Models.ThreadEvent>,
//         Types.ThreadEvent,
//         Attributes<Models.User>,
//         Types.User,
//         Attributes<Models.UserDismissable>,
//         Types.UserDismissable,
//         Attributes<Models.UserNotification>,
//         Types.UserNotification,
//         Attributes<Models.UserNotificationPreferences>,
//         Types.UserNotificationPreferences,
//         Attributes<Models.UserScopeVisit>,
//         Types.UserScopeVisit,
//         Attributes<Models.UserSubscription>,
//         Types.UserSubscription,
//         Attributes<Models.
