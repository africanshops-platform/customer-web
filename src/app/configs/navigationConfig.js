import i18next from 'i18next';
import ar from './navigation-i18n/ar';
import en from './navigation-i18n/en';
import tr from './navigation-i18n/tr';

i18next.addResourceBundle('en', 'navigation', en);
i18next.addResourceBundle('tr', 'navigation', tr);
i18next.addResourceBundle('ar', 'navigation', ar);
/**
 * The navigationConfig object is an array of navigation items for the Fuse application.
 */

const navigationConfig = [
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
				title: 'Dashboard',
				type: 'item',
				icon: 'heroicons-outline:clipboard-check',
				url: '/shop-dashboard'
			}
		]
	},

	/** *Products management pane */
	{
		id: 'shopproducts',
		title: 'Products',
		subtitle: 'Manage your shop products',
		type: 'group',
		icon: 'heroicons-outline:shopping-cart',
		translate: 'PRODUCTS',
		children: [
			{
				// NAVIGATION:SHOP PRODUCTS
				id: 'shopproducts.list',
				title: 'Products',
				type: 'item',
				icon: 'heroicons-outline:shopping-cart',
				url: '/shopproducts-list/products'
			},
			{
				id: 'shopproducts.inventory',
				title: 'Inventory',
				type: 'item',
				icon: 'heroicons-outline:shopping-cart',
				url: '/shopproducts-list/inventory'
			}
		]
	},

	/** *orders management pane */
	{
		id: 'shoporders',
		title: 'Orders-&-Pos',
		subtitle: 'Manage your shop orders',
		type: 'group',
		icon: 'heroicons-outline:home',
		translate: 'ORDERS-&-POS',
		children: [
			{
				id: 'shoporders.list',
				title: 'Orders',
				type: 'item',
				icon: 'heroicons-outline:shopping-cart',
				url: '/shoporders-list/orders'
			},
			// {
			// 	id: 'shoporders.pos',
			// 	title: 'Poin Of Sale (POS)',
			// 	type: 'item',
			// 	icon: 'heroicons-outline:shopping-cart',
			// 	url: '/shoporders-list/pos'
			// },

			{
				id: 'africanshops.pos',
				title: 'Poin Of Sale (POS22)',
				type: 'item',
				icon: 'heroicons-outline:shopping-cart',
				url: '/africanshops/shops/pos'
			}
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
				id: 'property.earnings',
				title: 'Wallet',
				type: 'item',
				icon: 'heroicons-outline:clipboard-check',
				url: '/africanshops/finance-v2'
			},

			{
				id: 'withdrawals.list',
				title: 'Withdrawals',
				type: 'item',
				icon: 'heroicons-outline:clipboard-check',
				url: '/africanshops/withdrawals'
			}
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
				id: 'support.earnings',
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
export default navigationConfig;
