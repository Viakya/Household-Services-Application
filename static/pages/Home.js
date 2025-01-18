import router from "../utils/router.js";

const VerifiedProfessionals = {
  template: `
    <div class="container mt-5">
      <div class="text-center">
        <h2 class="display-5 fw-bold mb-4 text-primary">Household Services </h1>
        <p class="lead text-muted">All Professionals Are Verified  </p>
      </div>
      <div v-if="loading" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      
      <div v-if="!loading && professionals.length === 0" class="text-center">
        <p>No verified professionals found.</p>
      </div>
      
      <div class="row g-4" v-if="!loading && professionals.length > 0">
        <div v-for="professional in professionals" :key="professional.user_id" class="col-lg-4 col-md-6">
          <div class="card shadow border-0">
            <div class="card-header bg-primary text-white py-3">
              <h5 class="mb-0">{{ professional.service.name }}</h5>
            </div>
            <div class="card-body">
              <p><i class="bi bi-cash"></i> <strong>Price:</strong> ₹{{ professional.service.price }}</p>
              <p><i class="bi bi-clock"></i> <strong>Time Required:</strong> {{ professional.service.time_required }} mins</p>
              <p><i class="bi bi-briefcase"></i> <strong>Experience:</strong> {{ professional.experience }} years</p>
              <p><i class="bi bi-geo"></i> <strong>Pincode:</strong> {{ professional.user.pincode }} </p>
              <button 
                class="btn btn-outline-primary w-100 mt-3" 
                type="button" 
                data-bs-toggle="collapse" 
                :data-bs-target="'#details' + professional.user_id" 
                aria-expanded="false" 
                :aria-controls="'details' + professional.user_id">
                View Professional Details
              </button>

              <div 
                :id="'details' + professional.user_id" 
                class="collapse mt-3">
                <ul class="list-unstyled">
                  <li><strong>Name:</strong> {{ professional.user.name }}</li>
                  <li><strong>Email:</strong> {{ professional.user.email }}</li>
                  <li><strong>Id:</strong> {{ professional.user_id }} </li>
                  <li><i class="bi bi-check-circle-fill text-success"></i> <strong>Verified:</strong> Yes</li>
                </ul>
              </div>
              <!-- Request Button -->
              <button 
                class="btn btn-success w-100 mt-3" 
                :disabled="processingRequest[professional.user_id]" 
                @click="requestService(professional.user_id, professional.service.id)">
                {{ processingRequest[professional.user_id] ? 'Processing...' : 'Request' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      professionals: [],
      loading: true,
      processingRequest: {},// Track processing state for each professional
    };
  },
  mounted() {
    this.fetchProfessionals();
  },
  methods: {
    async fetchProfessionals() {
      const origin = window.location.origin;
      const url = `${origin}/api/verified_professionals`; // Adjust the endpoint if necessary
      try {
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": sessionStorage.getItem("token"),
          },
        });
        if (res.ok) {
          this.professionals = await res.json();
        } else {
          console.error("Failed to fetch professionals");
        }
      } catch (error) {
        console.error("Error fetching professionals:", error);
      } finally {
        this.loading = false;
      }
    },
    async requestService(professionalId, serviceId) {
      console.log("requetsing api for request ");
      console.log(professionalId,serviceId,sessionStorage.getItem("id"));
      const origin = window.location.origin;
      const url = `${origin}/api/request_service`;
      this.$set(this.processingRequest, professionalId, true); // Set processing state for the button
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": sessionStorage.getItem("token"),
          },
          body: JSON.stringify({
            service_id: serviceId,
            customer_id: sessionStorage.getItem("id"), // Assuming customer ID is stored in session
            professional_id: professionalId,
          }),
        });
        if (res.ok) {
          console.log("Service request successful");
          alert("Service request placed successfully!");
        } else {
          console.error("Failed to request service");
        }
      } catch (error) {
        console.error("Error requesting service:", error);
      } finally {
        this.$set(this.processingRequest, professionalId, false); // Reset processing state
      }
    },
  },
};

export default VerifiedProfessionals;
