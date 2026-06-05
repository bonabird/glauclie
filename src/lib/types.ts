export type SessionUser = {
	id: string;
	tenant_id: string;
	email: string;
	role: string;
	tier: string;
};

export type TenantProfile = {
	id: string;
	slug: string;
	business_name: string;
	logo_url: string | null;
	custom_domain: string | null;
	contact_email: string | null;
	timezone: string;
	industry: string | null;
	plan_tier: string;
	slug_changed_at: string | null;
};

export type Module = {
	slug: string;
	name: string;
	min_plan_tier: string;
	locked: boolean;
	enabled: boolean;
};

export type Notification = {
	id: string;
	tenant_id: string;
	user_id: string;
	type: string;
	title: string;
	body: string;
	read_at: string | null;
	created_at: string;
};

export type NotificationPreference = {
	event_type: string;
	in_app_enabled: boolean;
};

export type CommunicationPreferences = {
	newsletter: boolean;
	product_updates: boolean;
	platform_announcements: boolean;
};

export type FieldDef = {
	name: string;
	type: string;
	label: string;
	required?: boolean;
};

export type ContentType = {
	id: string;
	tenant_id: string;
	name: string;
	schema: FieldDef[];
	created_at: string;
};

export type ContentGroup = {
	id: string;
	tenant_id: string;
	name: string;
	slug: string;
	description: string;
	entry_count?: number;
	created_at: string;
	updated_at: string;
};

export type ContentEntry = {
	id: string;
	tenant_id: string;
	group_id?: string | null;
	group_name?: string;
	content_type_id: string;
	content_type_name?: string;
	author_id: string;
	title: string;
	slug: string;
	body: string;
	fields: Record<string, unknown>;
	status: 'draft' | 'published' | 'archived';
	visible_to_tiers: string[] | null;
	view_count: number;
	published_at: string | null;
	created_at: string;
	updated_at: string;
};

export type RecipeStep = {
	order: number;
	title: string;
	subtitle: string;
	text: string;
	chefs_note: string;
	image: string | null;
};

export type Subscriber = {
	id: string;
	tenant_id: string;
	email: string;
	consent_at: string;
	consent_ip: string | null;
	unsubscribed_at: string | null;
	created_at: string;
};

export type NewsletterCampaign = {
	id: string;
	tenant_id: string;
	author_id: string;
	subject: string;
	preview_text: string;
	body: string;
	status: 'draft' | 'sending' | 'sent' | 'failed';
	sent_count: number;
	open_count: number;
	click_count: number;
	bounce_count: number;
	unsubscribe_count: number;
	sent_at: string | null;
	created_at: string;
	updated_at: string;
};

export type NewsletterAnalyticsSummary = {
	total_subscribers: number;
	active_subscribers: number;
	total_campaigns: number;
	total_sent: number;
	avg_open_rate: number;
	avg_click_rate: number;
	avg_bounce_rate: number;
	total_unsubscribes: number;
};

export type AIGenerateResult = {
	subject: string;
	preview_text: string;
	body: string;
};

export type LinkTheme = {
	background_color: string;
	text_color: string;
	accent_color: string;
	font_family: string;
};

export type LinkPage = {
	tenant_id: string;
	title: string;
	bio: string;
	avatar_url: string | null;
	theme: LinkTheme;
	published: boolean;
	view_count: number;
	updated_at: string;
};

export type LinkItem = {
	id: string;
	tenant_id: string;
	sort_order: number;
	label: string;
	url: string;
	icon: string;
	action_type: 'url' | 'email_capture' | 'gated_login' | 'community_tier';
	action_config: Record<string, unknown>;
	active: boolean;
	click_count: number;
	created_at: string;
	updated_at: string;
};

export type LinkAnalyticsSummary = {
	total_views: number;
	total_clicks: number;
	link_count: number;
};

export type SocialLink = {
	platform: string;
	url: string;
};

export type BrandColors = {
	primary: string;
	secondary: string;
	background: string;
	text: string;
};

export type BusinessCard = {
	tenant_id: string;
	first_name: string;
	surname: string;
	name: string;
	display_name: string;
	role: string;
	email: string;
	phone: string;
	website: string;
	logo_url: string | null;
	social_links: SocialLink[];
	brand_colors: BrandColors;
	published: boolean;
	created_at: string;
	updated_at: string;
};

export type CardLead = {
	id: string;
	tenant_id: string;
	scan_id: string | null;
	first_name: string;
	surname: string;
	name: string;
	email: string;
	phone: string;
	location_label: string | null;
	latitude: number | null;
	longitude: number | null;
	consented_at: string;
	added_to_subscribers: boolean;
	created_at: string;
};

export type CardScan = {
	id: string;
	tenant_id: string;
	scanned_at: string;
	location_label: string | null;
	latitude: number | null;
	longitude: number | null;
	consented: boolean;
	consented_at: string | null;
};

export type CardAnalyticsSummary = {
	total_scans: number;
	total_consents: number;
	consent_rate: number;
	total_leads: number;
};
