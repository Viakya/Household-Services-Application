import router from "../utils/router.js";

const DashboardCust = {
  template: `
    <div class="container mt-5">
    <div class="text-center">
        <h2 class="display-5 fw-bold mb-4 text-primary">Customer Dashboard </h1>
      </div>

      <div v-if="loading" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-if="!loading && serviceRequests.length === 0" class="text-center">
        <p>No service requests found.</p>
      </div>

      <div class="row g-4" v-if="!loading && serviceRequests.length > 0">
        <div v-for="request in serviceRequests" :key="request.id" class="col-md-6 mb-4">
          <div class="card shadow border-0">
            <div class="card-header bg-secondary text-white">
              <h5 class="mb-0">Service: {{ request.service_id }}</h5>
            </div>
            <div class="card-body">
              <p><strong>Professional:</strong> {{ request.professional_id }}</p>
              <p><strong>Cost:</strong> {{ request.cost }}</p>
              <p><strong>Status:</strong> {{ request.status }}</p>
              <p><strong>Date of Request:</strong> {{ request.date_requested }} </p>
              <p><strong>id:</strong> {{ request.id }} </p>
              <p v-if="request.remarks"><strong>Remarks:</strong> {{ request.remarks }}</p>

              <!-- Buttons for Cancel and Close -->
              <div class="mt-3">
                <!-- Cancel Button for "requested" or "accepted" -->
                <button 
                  v-if="request.status === 'requested' || request.status === 'accepted'"
                  @click="updateRequestStatus(request.id, 'cancelled')" 
                  :disabled="processing === request.id && newStatus === 'cancelled'" 
                  class="btn btn-danger me-2">
                  <span v-if="processing === request.id && newStatus === 'cancelled'">Processing...</span>
                  <span v-else>Cancel</span>
                </button>

                <!-- Close Button for "accepted" -->
                <button 
                  v-if="request.status === 'accepted'" 
                  @click="updateRequestStatus(request.id, 'closed')" 
                  :disabled="processing === request.id && newStatus === 'closed'" 
                  class="btn btn-success">
                  <span v-if="processing === request.id && newStatus === 'closed'">Processing...</span>
                  <span v-else>Close</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      serviceRequests: [],
      loading: true,
      processing: null, // Holds the request ID being processed
      newStatus: null,   // Holds the new status ("cancelled" or "closed")
    };
  },
  mounted() {
    this.fetchServiceRequests();
  },
  methods: {
    async fetchServiceRequests() {
      const origin = window.location.origin;
      const url = `${origin}/api/service-requests/${sessionStorage.getItem("id")}`;
      try {
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": sessionStorage.getItem("token"),
          },
        });
        if (res.ok) {
          this.serviceRequests = await res.json();
        } else {
          console.error("Failed to fetch service requests");
        }
      } catch (error) {
        console.error("Error fetching service requests:", error);
      } finally {
        this.loading = false;
      }
    },

    async updateRequestStatus(requestId, newStatus) {
      const origin = window.location.origin;
      const url =
        newStatus === "cancelled"
          ? `${origin}/api/cust-cancel/${requestId}`
          : `${origin}/api/cust-close/${requestId}`;

      // Set processing state
      this.processing = requestId;
      this.newStatus = newStatus;

      try {
        console.log(sessionStorage.getItem("token"))
        const res = await fetch(url, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": sessionStorage.getItem("token"),
          },
        });
        if (res.ok) {
          // Update the status locally
          const index = this.serviceRequests.findIndex((req) => req.id === requestId);
          if (index !== -1) {
            this.serviceRequests[index].status = newStatus;
          }
        } else {
          console.error("Failed to update service request status");
        }
      } catch (error) {
        console.error("Error updating service request status:", error);
      } finally {
        // Reset processing state
        this.processing = null;
        this.newStatus = null;
      }
    },
  },
};

export default DashboardCust;
