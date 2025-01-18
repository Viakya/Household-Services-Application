import router from "../utils/router.js";

const ProfProfile = {
  template: `
    <div class="container mt-5">
      <div class="text-center mb-4">
        <h2 class="fw-bold">Professional Profile</h2>
        <p class="text-muted">View detailed information about your professional account</p>
      </div>
      
      <div v-if="loading" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      
      <div v-if="!loading && profile" class="card shadow border-0 p-3">
        <div class="row g-4">
          <!-- Profile Picture Section -->
          <div class="col-md-4 text-center">
            <img 
              src="https://via.placeholder.com/150" 
              alt="Profile Picture" 
              class="img-thumbnail rounded-circle" 
              style="width: 150px; height: 150px;"
            />
            <h5 class="mt-3">{{ profile.user.name }}</h5>
            <p class="text-muted">{{ profile.user.email }}</p>
          </div>
          
          <!-- Profile Details Section -->
          <div class="col-md-8">
            <div class="card-body">
              <div class="row mb-3">
                <div class="col">
                  <p><strong>Experience:</strong> {{ profile.experience }} years</p>
                </div>
                <div class="col">
                  <p>
                    <strong>Verified:</strong> 
                    <span v-if="profile.verified" class="badge bg-success">Yes</span>
                    <span v-else class="badge bg-danger">No</span>
                  </p>
                </div>
              </div>

              <div>
                <h5 class="fw-bold">Service Details</h5>
                <ul class="list-group">
                  <li class="list-group-item"><strong>Name:</strong> {{ profile.service.name }}</li>
                  <li class="list-group-item"><strong>Price:</strong> ₹{{ profile.service.price }}</li>
                  <li class="list-group-item"><strong>Time Required:</strong> {{ profile.service.time_required }} minutes</li>
                  <li class="list-group-item"><strong>Description:</strong> {{ profile.service.description }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!loading && !profile" class="text-center text-danger mt-4">
        <p>Unable to fetch profile details. Please try again later.</p>
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
    this.fetchProfessionalProfile();
  },
  methods: {
    async fetchProfessionalProfile() {
      const origin = window.location.origin;
      const url = `${origin}/api/prof-profile/${sessionStorage.getItem("id")}`;
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
          console.error("Failed to fetch professional profile");
        }
      } catch (error) {
        console.error("Error fetching profile details:", error);
      } finally {
        this.loading = false;
      }
    },
  },
};

export default ProfProfile;
