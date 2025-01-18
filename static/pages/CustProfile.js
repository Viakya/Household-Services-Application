import router from "../utils/router.js";

const CustProfile = {
  template: `
    <div class="container mt-5">
    <div class="text-center">
        <h2 class="display-5 fw-bold mb-4 text-primary">Profile </h1>
      </div>

      
      <div v-if="loading" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      
      <div v-if="!loading && profile" class="card shadow border-0">
        <div class="card-header bg-primary text-white text-center">
          <h4 class="mb-0">Hello, {{ profile.name }}!</h4>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <p class="mb-2"><strong>ID:</strong> {{ profile.id }}</p>
              <p class="mb-2"><strong>Email:</strong> {{ profile.email }}</p>
            </div>
            <div class="col-md-6">
              <p class="mb-2"><strong>Joined On:</strong> {{ formatDate(profile.joined_on) }}</p>
              <p class="mb-2"><strong>Pincode:</strong> {{ profile.pincode }}</p>
            </div>
          </div>
        </div>
      </div>
      <div v-if="!loading && !profile" class="alert alert-danger text-center">
        Unable to fetch profile details. Please try again later.
      </div>
    </div>
  `,
  data() {
    return {
      profile: null,
      loading: true,
    };
  },
  mounted() {
    this.fetchCustomerProfile();
  },
  methods: {
    async fetchCustomerProfile() {
      const origin = window.location.origin;
      const url = `${origin}/api/cust-profile/${sessionStorage.getItem("id")}`;
      try {
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": sessionStorage.getItem("token"),
          },
        });
        if (res.ok) {
          this.profile = await res.json();
        } else {
          console.error("Failed to fetch customer profile");
        }
      } catch (error) {
        console.error("Error fetching profile details:", error);
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(dateString).toLocaleDateString(undefined, options);

    },
  },
};

export default CustProfile;
