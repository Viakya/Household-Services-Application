// import Navbar from "../components/Navbar.js";
import Home from "../pages/Home.js";
import Login from "../pages/Login.js";
import Signup from "../pages/Signup.js";
import Logout from "../pages/Logout.js";
import DashboardAdmin from "../pages/DashboardAdmin.js";
import DashboardCust from "../pages/DashboardCust.js";
import DashboardProf from "../pages/DashboardProf.js";
import CustProfile from "../pages/CustProfile.js";
import CustSearch from "../pages/CustSearch.js";
import ProfProfile from "../pages/ProfProfile.js";
import Database from "../pages/Database.js"
import AddService from "../pages/AddService.js"
import VerifyProf from "../pages/VerifyProf.js"
import CustReports from "../pages/CustReports.js"
import ProfReports from "../pages/ProfReports.js"
import AdminReports from "../pages/AdminReports.js"

import store from "./store.js";

const routes = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/signup", component: Signup },
  { path: "/logout", component: Logout },
  {
    path: "/dashboard-admin",
    component: DashboardAdmin,
    meta: { requiresLogin: true, role: "admin" },
  },
  {
    path: "/dashboard-prof",
    component: DashboardProf,
    meta: { requiresLogin: true, role: "professional" },
  },
  {
    path: "/dashboard-cust",
    component: DashboardCust,
    meta: { requiresLogin: true, role: "customer" },
  },
  {
    path: "/cust-profile",
    component: CustProfile,
    meta: { requiresLogin: true, role: "customer" },
  },
  {
    path: "/cust-search",
    component: CustSearch,
    meta: { requiresLogin: true, role: "customer" },
  },
  { path: "/prof-profile",
    component: ProfProfile,
    meta: { requiresLogin: true, role: "professional"},
  },
  {
    path: "/admin-database",
    component: Database,
    meta: { requiresLogin: true, role: "admin"}
  },
  { path: "/admin-verify-prof",
    component: VerifyProf,
    meta: { requiresLogin: true, role: "admin"}
  },
  { path: "/admin-add-service",
    component: AddService,
    meta: { requiresLogin: true, role: "admin"}
  },
  { path: "/cust-reports",
    component: CustReports,
    meta: { requiresLogin: true, role: "customer"}
  },
  { path: "/prof-reports",
    component: ProfReports,
    meta: { requiresLogin: true, role: "professional"}
  },
  { path: "/admin-reports",
    component: AdminReports,
    meta: { requiresLogin: true, role: "admin"}
  }
];

const router = new VueRouter({
  routes,
});

// frontend router protection
router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresLogin)) {
    if (!store.state.loggedIn) {
      next({ path: "/login" });
    } else if (to.meta.role && to.meta.role !== store.state.role) {
      next({ path: "/" });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
