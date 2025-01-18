import router from "../utils/router.js";

const DashboardAdmin = {
  template: `
    <div class="container mt-5">
      <h3 class="text-center mb-5 text-primary fw-bold">Admin Dashboard</h3>
      <div v-if="loading" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div v-else>
        <div class="row g-4">
          <div class="col-md-4" v-for="(value, key) in dashboardData" :key="key">
            <div class="card shadow-sm border-0" style="border-radius: 15px;">
              <div class="card-body text-center py-4">
                <h5 class="card-title text-uppercase text-secondary fw-semibold mb-2">{{ formatKey(key) }}</h5>
                <h3 class="card-text fw-bold text-primary display-6">{{ value }}</h3>
              </div>
              <div class="card-footer bg-light text-center text-muted small py-2">
                {{ footerText(key) }}
              </div>
            </div>
          </div>
        </div>
        <div v-if="errorMessage" class="alert alert-danger mt-4" role="alert">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      dashboardData: {},
      loading: true,
      errorMessage: "",
    };
  },
  methods: {
    async fetchDashboardData() {
      try {
        const res = await fetch(`${window.location.origin}/api/admin-dashboard-data`, {
          headers: {
            "Authentication-Token": sessionStorage.getItem("token"),
          },
        });

        if (res.ok) {
          const data = await res.json();
          this.dashboardData = data;
        } else {
          const error = await res.json();
          this.errorMessage = error.message || "Failed to load dashboard data.";
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        this.errorMessage = "An error occurred while fetching dashboard data.";
      } finally {
        this.loading = false;
      }
    },
    formatKey(key) {
      return key
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
    },
    footerText(key) {
      // Add some context or description based on the data key
      const descriptions = {
        total_users: "Total registered users on the platform.",
        total_prof: "Number of verified professionals.",
        total_customer: "Number of customers using the services.",
        total_services_offered: "Services available for booking.",
        total_received_request: "Service requests received to date.",
        total_closed_service_request: "Service requests successfully completed.",
      };
      return descriptions[key] || "Dashboard metric.";
    },
  },
  mounted() {
    this.fetchDashboardData();
  },
};

export default DashboardAdmin;
