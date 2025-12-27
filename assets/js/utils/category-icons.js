/**
 * Category Icons Utility
 * Provides consistent emoji icons for transaction categories
 */

const CATEGORY_ICONS = {
    'FOOD': '🍔',
    'BILLS': '💳',
    'SHOPPING': '🛍️',
    'LEISURE': '🎮',
    'TRANSPORT': '🚗',
    'HEALTH': '🏥',
    'INVEST': '📈',
    'BITCOIN': '₿',
    'INCOME': '💰',
    'EDUCATION': '🎓'
};

/**
 * Get the icon for a specific category
 * @param {string} category - Category name (e.g., 'FOOD', 'BILLS')
 * @returns {string} Emoji icon for the category
 */
export function getCategoryIcon(category) {
    return CATEGORY_ICONS[category] || '💸';
}

/**
 * Get category name with icon
 * @param {string} category - Category name
 * @returns {string} Category with icon (e.g., "🍔 FOOD")
 */
export function getCategoryWithIcon(category) {
    const icon = getCategoryIcon(category);
    return `${icon} ${category}`;
}

/**
 * Get all categories with their icons
 * @returns {Object} Map of categories to icons
 */
export function getAllCategoryIcons() {
    return { ...CATEGORY_ICONS };
}

// Expose globally for non-module scripts
window.getCategoryIcon = getCategoryIcon;
window.getCategoryWithIcon = getCategoryWithIcon;
window.getAllCategoryIcons = getAllCategoryIcons;
