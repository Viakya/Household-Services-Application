import router from "../utils/router.js";

const Navbar = {
  template: `
<nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
  <div class="container-fluid">
    <!-- Logo and Home Link -->
    <router-link class="navbar-brand fw-bold" to="/">
      <i class="bi bi-house-door me-2"></i>Home
    </router-link>

    <!-- Toggler for mobile view -->
    <button 
      class="navbar-toggler" 
      type="button" 
      data-bs-toggle="collapse" 
      data-bs-target="#navbarNav" 
      aria-controls="navbarNav" 
      aria-expanded="false" 
      aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <!-- Collapsible Navbar -->
    <div class="collapse navbar-collapse" id="navbarNav">
      <!-- Left-aligned links -->
      <ul class="navbar-nav me-auto">
        <!-- Admin Links -->
        <li v-if="state.loggedIn && state.role === 'admin'" class="nav-item">
          <router-link class="nav-link" to="/dashboard-admin">Admin Dashboard</router-link>
        </li>
        <li v-if="state.loggedIn && state.role === 'admin'" class="nav-item">
          <router-link class="nav-link" to="/admin-verify-prof">Verify Professionals</router-link>
        </li>
        <li v-if="state.loggedIn && state.role === 'admin'" class="nav-item">
          <router-link class="nav-link" to="/admin-add-service">Add Service</router-link>
        </li>
        <li v-if="state.loggedIn && state.role === 'admin'" class="nav-item">
          <router-link class="nav-link" to="/admin-reports">Reports</router-link>
        </li>
        <li v-if="state.loggedIn && state.role === 'admin'" class="nav-item">
          <router-link class="nav-link" to="/admin-database">Database</router-link>
        </li>

        <!-- Professional Links -->
        <li v-if="state.loggedIn && state.role === 'professional'" class="nav-item">
          <router-link class="nav-link" to="/dashboard-prof">Professional Dashboard</router-link>
        </li>
        <li v-if="state.loggedIn && state.role === 'professional'" class="nav-item">
          <router-link class="nav-link" to="/prof-profile">Profile</router-link>
        </li>
        <li v-if="state.loggedIn && state.role === 'professional'" class="nav-item">
          <router-link class="nav-link" to="/prof-reports">Reports</router-link>
        </li>
        <!-- Customer Links -->
        <li v-if="state.loggedIn && state.role === 'customer'" class="nav-item">
          <router-link class="nav-link" to="/dashboard-cust">Customer Dashboard</router-link>
        </li>
        <li v-if="state.loggedIn && state.role === 'customer'" class="nav-item">
          <router-link class="nav-link" to="/cust-search">Search Services</router-link>
        </li>
        <li v-if="state.loggedIn && state.role === 'customer'" class="nav-item">
          <router-link class="nav-link" to="/cust-profile">Profile</router-link>
        </li>
        <li v-if="state.loggedIn && state.role === 'customer'" class="nav-item">
          <router-link class="nav-link" to="/cust-reports">Reports</router-link>
        </li>
      </ul>
      <!-- Right-aligned links -->
      <ul class="navbar-nav ms-auto">
        <!-- Login and Signup -->
        <li v-if="!state.loggedIn" class="nav-item">
          <router-link class="nav-link" to="/login">Login</router-link>
        </li>
        <li v-if="!state.loggedIn" class="nav-item">
          <router-link class="nav-link" to="/signup">Sign Up</router-link>
        </li>

        <!-- Logout Button -->
        <li v-if="state.loggedIn" class="nav-item">
          <button class="btn btn-danger ms-2" @click="logout">
            <i class="bi bi-box-arrow-right me-2"></i>Logout
          </button>
        </li>
      </ul>
    </div>
  </div>
</nav>
  `,
  methods: {
    async logout() {
      const origin = window.location.origin;
      const url = `${origin}/user-logout`;
      try {
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": sessionStorage.getItem("token"),
          },
        });
        if (res.ok) {
          sessionStorage.clear();
          this.$store.commit("logout");
          this.$store.commit("setRole", null);
          this.$router.push("/login");
        } else {
          console.error("Logout failed.");
        }
      } catch (error) {
        console.error("Logout error:", error);
      }
    },
  },
  computed: {
    state() {
      return this.$store.state;
    },
  },
};

export default Navbar;
