export type Id = string;

export type Role = "ADMIN" | "EDITOR" | "USER";

export type EntryStatus = "DRAFT" | "PUBLISHED";

export type FieldType = "TEXT" | "RICHTEXT" | "NUMBER" | "BOOLEAN" | "DATE" | "MEDIA";

export type ApiListResponse<T> = {
	data: T[];
	total?: number;
};

export type User = {
	id: Id;
	email: string;
	username: string;
	role: Role;
	isActive: boolean;
	createdAt: string;
};

export type MediaItem = {
	id: Id;
	filename: string;
	mimeType: string;
	size: number;
	url: string;
	createdAt: string;
};

export type ContentField = {
	id: Id;
	name: string;
	slug: string;
	type: FieldType;
	required: boolean;
	order: number;
};

export type ContentType = {
	id: Id;
	name: string;
	slug: string;
	description?: string | null;
	fields: ContentField[];
	createdAt: string;
	updatedAt: string;
};

export type EntryValue = {
	fieldId: Id;
	value?: unknown;
	mediaId?: Id | null;
};

export type Entry = {
	id: Id;
	slug?: string | null;
	status: EntryStatus;
	contentTypeId: Id;
	authorId?: Id | null;
	publishedAt?: string | null;
	values: EntryValue[];
	createdAt: string;
	updatedAt: string;
};
