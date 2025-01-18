import router from "../utils/router.js";

const VerifyProf = {
  template: `
    <div class="container mt-4">
      <h3 class="text-center mb-4">Verify Professionals</h3>
      <div v-if="loading" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div v-if="!loading && unapprovedProfs.length === 0" class="text-center">
        <p>No unapproved professionals found.</p>
      </div>
      <div v-if="!loading && unapprovedProfs.length > 0" class="table-responsive">
        <table class="table table-bordered table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Experience</th>
              <th>Service</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="prof in unapprovedProfs" :key="prof.user_id">
              <td>{{ prof.user_id }}</td>
              <td>{{ prof.user.name }}</td>
              <td>{{ prof.user.email }}</td>
              <td>{{ prof.experience }} years</td>
              <td>{{ prof.service.name }}</td>
              <td>
                <button 
                  class="btn btn-success btn-sm" 
                  @click="approveProf(prof.user_id)"
                  :disabled="approving">
                  Approve
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  data() {
    return {
      unapprovedProfs: [], // Stores unapproved professionals
      loading: false, // Loading state for fetching professionals
      approving: false, // State for disabling buttons during approval
    };
  },
  methods: {
    async fetchUnapprovedProfs() {
      this.loading = true;
      try {
        const res = await fetch(`${window.location.origin}/api/admin-unapproved-prof`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": sessionStorage.getItem("token"),
          },
        });

        if (res.ok) {
          this.unapprovedProfs = await res.json();
        } else {
          console.error("Failed to fetch unapproved professionals.");
        }
      } catch (error) {
        console.error("Error fetching unapproved professionals:", error);
      } finally {
        this.loading = false;
      }
    },
    async approveProf(profId) {
      this.approving = true;
      try {
        const res = await fetch(`${window.location.origin}/api/admin-approve-prof/${profId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": sessionStorage.getItem("token"),
          },
        });

        if (res.ok) {
          this.unapprovedProfs = this.unapprovedProfs.filter(prof => prof.user_id !== profId);
        } else {
          console.error(`Failed to approve professional with ID: ${profId}`);
        }
      } catch (error) {
        console.error("Error approving professional:", error);
      } finally {
        this.approving = false;
      }
    },
  },
  mounted() {
    this.fetchUnapprovedProfs();
  },
};

export default VerifyProf;
