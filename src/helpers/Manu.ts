import { MENU_ITEMS } from '@/assets/data/menu-items'
import type { MenuItemType } from '@/types/menu'

// Filter menu items based on user role
const filterMenuByRole = (menuItems: MenuItemType[], userRole: string): MenuItemType[] => {
  return menuItems
    .filter(item => {
      // If no allowedRoles specified, show to everyone
      if (!item.allowedRoles) return true
      // Check if user role is in allowed roles
      return item.allowedRoles.includes(userRole)
    })
    .map(item => {
      // If item has children, filter them recursively
      if (item.children) {
        const filteredChildren = filterMenuByRole(item.children, userRole)
        return {
          ...item,
          children: filteredChildren.length > 0 ? filteredChildren : undefined
        }
      }
      return item
    })
    .filter(item => {
      // Remove parent items that have no children after filtering
      if (item.children === undefined && item.isTitle) {
        // Check if there are any non-title items that would show after this title
        return true // Keep titles for now, we'll handle this in a second pass
      }
      return true
    })
}

export const getMenuItems = (userRole?: string): MenuItemType[] => {
  if (!userRole) return MENU_ITEMS
  return filterMenuByRole(MENU_ITEMS, userRole)
}

export const findAllParent = (menuItems: MenuItemType[], menuItem: MenuItemType): string[] => {
  let parents: string[] = []
  const parent = findMenuItem(menuItems, menuItem.parentKey)
  if (parent) {
    parents.push(parent.key)
    if (parent.parentKey) {
      parents = [...parents, ...findAllParent(menuItems, parent)]
    }
  }
  return parents
}

export const getMenuItemFromURL = (items: MenuItemType | MenuItemType[], url: string): MenuItemType | undefined => {
  if (items instanceof Array) {
    for (const item of items) {
      const foundItem = getMenuItemFromURL(item, url)
      if (foundItem) {
        return foundItem
      }
    }
  } else {
    if (items.url == url) return items
    if (items.children != null) {
      for (const item of items.children) {
        if (item.url == url) return item
      }
    }
  }
}

export const findMenuItem = (menuItems: MenuItemType[] | undefined, menuItemKey: MenuItemType['key'] | undefined): MenuItemType | null => {
  if (menuItems && menuItemKey) {
    for (const item of menuItems) {
      if (item.key === menuItemKey) {
        return item
      }
      const found = findMenuItem(item.children, menuItemKey)
      if (found) return found
    }
  }
  return null
}
