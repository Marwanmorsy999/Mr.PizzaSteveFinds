/* eslint-disable */
// @ts-nocheck

import { Route as rootRouteImport } from './routes/__root'
import { Route as ShopRouteImport } from './routes/shop'
import { Route as AboutRouteImport } from './routes/about'
import { Route as AdminRouteImport } from './routes/admin'
import { Route as IndexRouteImport } from './routes/index'

const ShopRoute = ShopRouteImport.update({
  id: '/shop',
  path: '/shop',
  getParentRoute: () => rootRouteImport,
} as any)

const AboutRoute = AboutRouteImport.update({
  id: '/about',
  path: '/about',
  getParentRoute: () => rootRouteImport,
} as any)

const AdminRoute = AdminRouteImport.update({
  id: '/admin',
  path: '/admin',
  getParentRoute: () => rootRouteImport,
} as any)

const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)

export interface FileRoutesByPath {
  '/': { id: '/'; path: '/'; fullPath: '/'; preLoaderRoute: typeof IndexRouteImport; parentRoute: typeof rootRouteImport }
  '/about': { id: '/about'; path: '/about'; fullPath: '/about'; preLoaderRoute: typeof AboutRouteImport; parentRoute: typeof rootRouteImport }
  '/shop': { id: '/shop'; path: '/shop'; fullPath: '/shop'; preLoaderRoute: typeof ShopRouteImport; parentRoute: typeof rootRouteImport }
  '/admin': { id: '/admin'; path: '/admin'; fullPath: '/admin'; preLoaderRoute: typeof AdminRouteImport; parentRoute: typeof rootRouteImport }
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AboutRoute: typeof AboutRoute
  ShopRoute: typeof ShopRoute
  AdminRoute: typeof AdminRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AboutRoute: AboutRoute,
  ShopRoute: ShopRoute,
  AdminRoute: AdminRoute,
}

export const routeTree = rootRouteImport._addFileChildren(rootRouteChildren)._addRouteTypes()