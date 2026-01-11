import { createRouter, createWebHistory } from "vue-router"

// Lazy load all pages for code splitting
const Home = () => import("../pages/Home.vue")
const Links = () => import("../pages/Links.vue")
const Timeline = () => import("../pages/Timeline.vue")
const Info = () => import("../pages/Info.vue")
const Misskey = () => import("../pages/Misskey.vue")
const Mastodon = () => import("../pages/Mastodon.vue")
const Environments = () => import("../pages/Environments.vue")
const Servers = () => import("../pages/Servers.vue")
const Pubkeys = () => import("../pages/Pubkeys.vue")
const WatchedAnimes = () => import("../pages/WatchedAnimes.vue")
const Blog = () => import("../pages/Blog.vue")
const BlogPost = () => import("../pages/BlogPost.vue")
const NotFound = () => import("../pages/NotFound.vue")

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/links",
    name: "Links",
    component: Links,
  },
  {
    path: "/timeline",
    name: "Timeline",
    component: Timeline,
  },
  {
    path: "/misskey",
    name: "Misskey",
    component: Misskey,
  },
  {
    path: "/mastodon",
    name: "Mastodon",
    component: Mastodon,
  },
  {
    path: "/info",
    name: "Info",
    component: Info,
  },
  {
    path: "/environments",
    name: "Environments",
    component: Environments,
  },
  {
    path: "/servers",
    name: "Servers",
    component: Servers,
  },
  {
    path: "/pubkeys",
    name: "Pubkeys",
    component: Pubkeys,
  },
  {
    path: "/watched-animes",
    name: "WatchedAnimes",
    component: WatchedAnimes,
  },
  {
    path: "/blog",
    name: "Blog",
    component: Blog,
  },
  {
    path: "/blog/:id",
    name: "BlogPost",
    component: BlogPost,
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
