import router from "../utils/router.js";

const CustSearch = {
  template: `
    <div class="container mt-5">
      <div class="text-center">
        <h2 class="display-5 fw-bold mb-4 text-primary">Find Your Professional</h1>
        <p class="lead text-muted">Search by service or pincode to find verified professionals near you.</p>
      </div>

      <!-- Search Input -->
      <div class="bg-light p-4 rounded shadow-sm mb-5">
        <div class="input-group">
          <select v-model="searchType" class="form-select w-auto">
            <option value="service">Service Name</option>
            <option value="pincode">Pincode</option>
          </select>
          <input 
            type="text" 
            class="form-control" 
            v-model="searchQuery" 
            :placeholder="'Enter ' + (searchType === 'service' ? 'Service Name' : 'Pincode')" 
          />
          <button 
            class="btn btn-primary" 
            @click="search" 
            :disabled="!searchQuery">
            <i class="bi bi-search"></i> Search
          </button>
        </div>
      </div>

      <!-- Loading Spinner -->
      <div v-if="loading" class="text-center my-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- No Results Found -->
      <div v-if="!loading && professionals.length === 0" class="text-center text-muted">
        <i class="bi bi-person-x display-3"></i>
        <p class="mt-3">No professionals found for the given criteria.</p>
      </div>

      <!-- Professionals List -->
      <div class="row g-4" v-if="!loading && professionals.length > 0">
        <div v-for="professional in professionals" :key="professional.user_id" class="col-lg-4 col-md-6">
          <div class="card shadow border-0 hover-scale">
            <div class="card-header bg-primary text-white text-center py-3">
              <h5 class="mb-0">{{ professional.service.name }}</h5>
            </div>
            <div class="card-body">
              <p><i class="bi bi-cash"></i> <strong>Price:</strong> ₹{{ professional.service.price }}</p>
              <p><i class="bi bi-clock"></i> <strong>Time Required:</strong> {{ professional.service.time_required }} mins</p>
              <p><i class="bi bi-briefcase"></i> <strong>Experience:</strong> {{ professional.experience }} years</p>
              <p><i class="bi bi-geo-alt"></i> <strong>Pincode:</strong> {{ professional.user.pincode }}</p>
              
              <!-- View Details -->
              <button 
                class="btn btn-outline-primary w-100 mt-3" 
                type="button" 
                data-bs-toggle="collapse" 
                :data-bs-target="'#details' + professional.user_id" 
                aria-expanded="false" 
                :aria-controls="'details' + professional.user_id">
                <i class="bi bi-eye"></i> View Details
              </button>

              <div 
                :id="'details' + professional.user_id" 
                class="collapse mt-3">
                <ul class="list-unstyled">
                  <li><strong>Name:</strong> {{ professional.user.name }}</li>
                  <li><strong>Email:</strong> {{ professional.user.email }}</li>
                  <li><strong>ID:</strong> {{ professional.user_id }}</li>
                  <li><i class="bi bi-check-circle-fill text-success"></i> <strong>Verified:</strong> Yes</li>
                </ul>
              </div>

              <!-- Request Service -->
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
      searchType: "service",
      searchQuery: "",
      professionals: [],
      loading: false,
      processingRequest: {},
    };
  },
  methods: {
    async search() {
      this.loading = true;
      this.professionals = [];
      const origin = window.location.origin;
      const url =
        this.searchType === "service"
          ? `${origin}/api/cust-search-name/${this.searchQuery}`
          : `${origin}/api/cust-search-pincode/${this.searchQuery}`;
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
        console.error("Error fetching search results:", error);
      } finally {
        this.loading = false;
      }
    },
    async requestService(professionalId, serviceId) {
      const origin = window.location.origin;
      const url = `${origin}/api/request_service`;
      this.$set(this.processingRequest, professionalId, true);
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": sessionStorage.getItem("token"),
          },
          body: JSON.stringify({
            service_id: serviceId,
            customer_id: sessionStorage.getItem("id"),
            professional_id: professionalId,
          }),
        });
        if (res.ok) {
          alert("Service request placed successfully!");
        } else {
          console.error("Failed to request service");
        }
      } catch (error) {
        console.error("Error requesting service:", error);
      } finally {
        this.$set(this.processingRequest, professionalId, false);
      }
    },
  },
};

export default CustSearch;
