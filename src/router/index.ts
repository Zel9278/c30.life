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
const Downloads = () => import("../pages/Downloads.vue")
const Blog = () => import("../pages/Blog.vue")
const BlogPost = () => import("../pages/BlogPost.vue")
const BlogEditor = () => import("../pages/BlogEditor.vue")
const NotFound = () => import("../pages/NotFound.vue")

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: { title: "c30.life" },
  },
  {
    path: "/links",
    name: "Links",
    component: Links,
    meta: { title: "Links | c30.life" },
  },
  {
    path: "/timeline",
    name: "Timeline",
    component: Timeline,
    meta: { title: "Timeline | c30.life" },
  },
  {
    path: "/misskey",
    name: "Misskey",
    component: Misskey,
    meta: { title: "Misskey | c30.life" },
  },
  {
    path: "/mastodon",
    name: "Mastodon",
    component: Mastodon,
    meta: { title: "Mastodon | c30.life" },
  },
  {
    path: "/info",
    name: "Info",
    component: Info,
    meta: { title: "Info | c30.life" },
  },
  {
    path: "/environments",
    name: "Environments",
    component: Environments,
    meta: { title: "Environments | c30.life" },
  },
  {
    path: "/servers",
    name: "Servers",
    component: Servers,
    meta: { title: "Servers | c30.life" },
  },
  {
    path: "/pubkeys",
    name: "Pubkeys",
    component: Pubkeys,
    meta: { title: "Pubkeys | c30.life" },
  },
  {
    path: "/watched-animes",
    name: "WatchedAnimes",
    component: WatchedAnimes,
    meta: { title: "Watched Animes | c30.life" },
  },
  {
    path: "/downloads/:path(.*)*",
    name: "Downloads",
    component: Downloads,
    meta: { title: "Downloads | c30.life" },
  },
  {
    path: "/blog",
    name: "Blog",
    component: Blog,
    meta: { title: "Blog | c30.life" },
  },
  {
    path: "/blog/new/edit",
    name: "BlogNew",
    component: BlogEditor,
    meta: { hideFooter: true, title: "New Post | Blog | c30.life" },
  },
  {
    path: "/blog/:id/edit",
    name: "BlogEdit",
    component: BlogEditor,
    meta: { hideFooter: true, title: "Edit Post | Blog | c30.life" },
  },
  {
    path: "/blog/:id",
    name: "BlogPost",
    component: BlogPost,
    meta: { title: "Blog | c30.life" },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
    meta: { title: "Not Found | c30.life" },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Update document title on navigation
router.afterEach((to) => {
  const title = to.meta.title as string | undefined
  if (title) {
    document.title = title
  }
})

export default router
