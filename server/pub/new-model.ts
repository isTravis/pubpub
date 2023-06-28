import {
	Model,
	Table,
	Column,
	DataType,
	PrimaryKey,
	Default,
	AllowNull,
	IsLowercase,
	Length,
	Is,
	Unique,
	Index,
	HasMany,
	BelongsTo,
	HasOne,
} from 'sequelize-typescript';
import type { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import {
	PubAttribution,
	CollectionPub,
	Community,
	Discussion,
	Export,
	ReviewNew,
	Member,
	Release,
	PubVersion,
	PubEdge,
	Submission,
	CrossrefDepositRecord,
	ScopeSummary,
} from '../models';

@Table
export class Pub extends Model<InferAttributes<Pub>, InferCreationAttributes<Pub>> {
	@Default(DataType.UUIDV4)
	@PrimaryKey
	@Column(DataType.UUID)
	id!: CreationOptional<string>;

	@AllowNull(false)
	@IsLowercase
	@Length({ min: 1, max: 280 })
	@Is(/^[a-zA-Z0-9-]+$/)
	@Unique
	@Column(DataType.TEXT)
	slug!: string;

	@AllowNull(false)
	@Column(DataType.TEXT)
	title!: string;

	@Column(DataType.TEXT)
	htmlTitle?: string | null;

	@Length({ min: 0, max: 280 })
	@Column(DataType.TEXT)
	description?: string | null;

	@Length({ min: 0, max: 280 })
	@Column(DataType.TEXT)
	htmlDescription?: string | null;

	@Column(DataType.TEXT)
	avatar?: string | null;

	@Column(DataType.DATE)
	customPublishedAt?: Date | null;

	@Column(DataType.TEXT)
	doi?: string | null;

	@Column(DataType.JSONB)
	labels?: object | null;

	@Column(DataType.JSONB)
	downloads?: object | null;

	@Column(DataType.JSONB)
	metadata?: object | null;

	@Column(DataType.STRING)
	viewHash?: string | null;

	@Column(DataType.STRING)
	editHash?: string | null;

	@Column(DataType.STRING)
	reviewHash?: string | null;

	@Column(DataType.STRING)
	commentHash?: string | null;

	@AllowNull(false)
	@Column(DataType.UUID)
	draftId!: string;

	@Index({ using: 'BTREE' })
	@AllowNull(false)
	@Column(DataType.UUID)
	communityId!: string;

	@Column(DataType.UUID)
	crossrefDepositRecordId?: string | null;

	@Column(DataType.UUID)
	scopeSummaryId?: string | null;

	@HasMany(() => PubAttribution, { onDelete: 'CASCADE', as: 'attributions', foreignKey: 'pubId' })
	attributions?: PubAttribution[];

	@HasMany(() => CollectionPub, {
		onDelete: 'CASCADE',
		hooks: true,
		as: 'collectionPubs',
		foreignKey: 'pubId',
	})
	collectionPubs?: CollectionPub[];

	@BelongsTo(() => Community, { onDelete: 'CASCADE', as: 'community', foreignKey: 'communityId' })
	community?: Community;

	@HasMany(() => Discussion, { onDelete: 'CASCADE', as: 'discussions', foreignKey: 'pubId' })
	discussions?: Discussion[];

	@HasMany(() => Export, { as: 'exports', foreignKey: 'pubId' })
	exports?: Export[];

	@HasMany(() => ReviewNew, { onDelete: 'CASCADE', as: 'reviews', foreignKey: 'pubId' })
	reviews?: ReviewNew[];

	@HasMany(() => Member, { onDelete: 'CASCADE', as: 'members', foreignKey: 'pubId' })
	members?: Member[];

	@HasMany(() => Release, { onDelete: 'CASCADE', as: 'releases', foreignKey: 'pubId' })
	releases?: Release[];

	@HasMany(() => PubVersion, { onDelete: 'CASCADE', as: 'pubVersions', foreignKey: 'pubId' })
	pubVersions?: PubVersion[];

	@HasMany(() => PubEdge, { onDelete: 'CASCADE', as: 'outboundEdges', foreignKey: 'pubId' })
	outboundEdges?: PubEdge[];

	@HasMany(() => PubEdge, { onDelete: 'CASCADE', as: 'inboundEdges', foreignKey: 'targetPubId' })
	inboundEdges?: PubEdge[];

	@HasOne(() => Submission, { as: 'submission', foreignKey: 'pubId' })
	submission?: Submission;

	@BelongsTo(() => CrossrefDepositRecord, {
		as: 'crossrefDepositRecord',
		foreignKey: 'crossrefDepositRecordId',
	})
	crossrefDepositRecord?: CrossrefDepositRecord;

	@BelongsTo(() => ScopeSummary, { as: 'scopeSummary', foreignKey: 'scopeSummaryId' })
	scopeSummary?: ScopeSummary;
}
