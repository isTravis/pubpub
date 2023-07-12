/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	BuildOptions,
	Logging,
	Silent,
	Transactionable,
	TruncateOptions,
	Paranoid,
	Hookable,
} from 'sequelize';

declare module 'sequelize' {
	export interface CreateOptions<TAttributes = any>
		extends BuildOptions,
			Logging,
			Silent,
			Transactionable,
			Hookable {
		actorId?: string | null;
	}

	export interface DestroyOptions<TAttributes = any> extends TruncateOptions<TAttributes> {
		actorId?: string | null;
	}

	export interface InstanceDestroyOptions extends Logging, Transactionable, Hookable {
		actorId?: string | null;
	}

	export interface UpdateOptions<TAttributes = any>
		extends Logging,
			Transactionable,
			Paranoid,
			Hookable {
		actorId?: string | null;
	}
}
