import i18next from 'i18next';
import ar from './navigation-i18n/ar';
import en from './navigation-i18n/en';
import tr from './navigation-i18n/tr';

i18next.addResourceBundle('en', 'navigation', en);
i18next.addResourceBundle('tr', 'navigation', tr);
i18next.addResourceBundle('ar', 'navigation', ar);
/**
 * The bookingsNavigationConfig object is an array of navigation items for the Fuse application.
 */

const bookingsNavigationConfig = [
	/** *Dashboard pane */
	{
		id: 'dashboards',
		title: 'Dashboards',
		subtitle: 'Navigation helpers',
		type: 'group',
		icon: 'heroicons-outline:home',
		translate: 'DASHBOARDS',
		children: [
			{
				id: 'shop.dashboards',
				title: 'Bookings Dashboard',
				type: 'item',
				icon: 'heroicons-outline:clipboard-check',
				url: '/shop-dashboard'
			}
		]
	},

	{
		id: 'booklistings',
		title: 'Manage Bookings properties',
		subtitle: 'Bookings Properties management helpers',
		type: 'group',
		icon: 'heroicons-outline:home',
		translate: 'BOOKINGSPROPERTIES',
		children: [
			// {
			// 	id: 'properties.list',
			// 	title: 'Properties',
			// 	type: 'item',
			// 	icon: 'heroicons-outline:clipboard-check',
			// 	url: '/properties/listings'
			// },

			{
				id: 'properties.managedbooklist',
				title: 'Managed Booking Listings',
				type: 'item',
				icon: 'heroicons-outline:clipboard-check',
				url: '/bookings/managed-listings'
			}
			// {
			// 	id: 'properties.manageduserlist',
			// 	title: 'Managed USER Properties',
			// 	type: 'item',
			// 	icon: 'heroicons-outline:clipboard-check',
			// 	url: '/userlistings'
			// },
		]
	},

	/** *Finance management pane */
	{
		id: 'FInance',
		title: 'Manage Finance',
		subtitle: 'Earnings from businesses you run',
		type: 'group',
		icon: 'heroicons-outline:home',
		translate: 'FINANCE',
		children: [
			{
				id: 'estates.earnings',
				title: 'Wallet',
				type: 'item',
				icon: 'heroicons-outline:clipboard-check',
				url: '/africanshops/finance-v2'
			}

			// {
			// 	id: 'withdrawals.list',
			// 	title: 'Property Withdrawals',
			// 	type: 'item',
			// 	icon: 'heroicons-outline:clipboard-check',
			// 	url: '/finance/withdrawals'
			// },
		]
	},

	/** *Support management pane */
	{
		id: 'Support.Helpcenter',
		title: 'Get Support',
		subtitle: 'Get Clarity And Support From Admin',
		type: 'group',
		icon: 'heroicons-outline:home',
		translate: 'SUPPORT',
		children: [
			{
				id: 'support.users',
				title: 'Suppport',
				type: 'item',
				icon: 'heroicons-outline:support',
				url: '/support'
			}
		]
	},

	/** *Messanger pane */
	{
		id: 'Africanshops.Messanger',
		title: 'Messanger',
		subtitle: 'Chat with potential customres and admin',
		type: 'group',
		icon: 'heroicons-outline:chat-alt',
		translate: 'MESSANGER',
		children: [
			{
				id: 'apps.messenger',
				title: 'Messenger',
				type: 'item',
				icon: 'heroicons-outline:chat-alt',
				url: '/africanshops/messenger',
				translate: 'MESSENGER'
			}
		]
	}

	// {
	// 	id: 'users',
	// 	title: 'Manage users',
	// 	subtitle: 'Users management helpers',
	// 	type: 'group',
	// 	icon: 'heroicons-outline:home',
	// 	translate: 'SHOP-STAFF-USERS',
	// 	children: [
	// 		// {
	// 		// 	id: 'users.admin',
	// 		// 	title: 'Admin staff',
	// 		// 	type: 'item',
	// 		// 	icon: 'heroicons-outline:user-group',
	// 		// 	url: '/users/admin'
	// 		// },
	// 		// {
	// 		// 	id: 'users.user',
	// 		// 	title: 'Uers',
	// 		// 	type: 'item',
	// 		// 	icon: 'heroicons-outline:user-group',
	// 		// 	url: '/users/user'
	// 		// },
	// 		{
	// 			id: 'users.shopstaff',
	// 			title: 'Shop Staff',
	// 			type: 'item',
	// 			icon: 'heroicons-outline:user-group',
	// 			url: '/users/shopstaff'
	// 		},

	// 	]
	// },
];
export default bookingsNavigationConfig;
