import router from "../utils/router.js";

const AdminAddService = {
  template: `
    <div class="container my-5 d-flex justify-content-center">
      <div class="card shadow-lg border-0" style="max-width: 600px; width: 100%;">
        <div class="card-header bg-secondary text-white text-center">
          <h4 class="mb-0">Add New Service</h4>
        </div>
        <div class="card-body p-4">
          <form @submit.prevent="submitService">
            <!-- Service Name -->
            <div class="form-floating mb-4">
              <input 
                type="text" 
                id="serviceName" 
                class="form-control" 
                v-model="service.name" 
                required 
                placeholder="Service Name" />
              <label for="serviceName">Service Name</label>
            </div>
            
            <!-- Price -->
            <div class="form-floating mb-4">
              <input 
                type="number" 
                id="servicePrice" 
                class="form-control" 
                v-model="service.price" 
                required 
                placeholder="Price" />
              <label for="servicePrice">Price</label>
            </div>
            
            <!-- Time Required -->
            <div class="form-floating mb-4">
              <input 
                type="number" 
                id="serviceTime" 
                class="form-control" 
                v-model="service.time_required" 
                required 
                placeholder="Time Required (Minutes)" />
              <label for="serviceTime">Time Required (Minutes)</label>
            </div>
            
            <!-- Description -->
            <div class="form-floating mb-4">
              <textarea 
                id="serviceDescription" 
                class="form-control" 
                v-model="service.description" 
                required 
                placeholder="Service Description"
                style="height: 120px"></textarea>
              <label for="serviceDescription">Service Description</label>
            </div>
            
            <!-- Submit Button -->
            <div class="text-center">
              <button class="btn btn-secondary w-100 py-2" type="submit" :disabled="loading">
                <span v-if="loading">
                  <i class="spinner-border spinner-border-sm me-2"></i>Adding...
                </span>
                <span v-else>
                  <i class="bi bi-plus-circle me-2"></i>Add Service
                </span>
              </button>
            </div>
            
            <!-- Feedback Message -->
            <div v-if="message" class="mt-4 alert text-center" 
                 :class="{'alert-success': success, 'alert-danger': !success}">
              {{ message }}
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      service: {
        name: "",
        price: null,
        time_required: null,
        description: "",
      },
      loading: false,
      message: "",
      success: false,
    };
  },
  methods: {
    async submitService() {
      this.loading = true;
      this.message = "";

      try {
        const res = await fetch(`${window.location.origin}/api/admin-add-service`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": sessionStorage.getItem("token"),
          },
          body: JSON.stringify(this.service),
        });

        if (res.ok) {
          this.message = "Service added successfully!";
          this.success = true;
          this.service = { name: "", price: null, time_required: null, description: "" };
        } else {
          const error = await res.json();
          this.message = error.message || "Error adding service.";
          this.success = false;
        }
      } catch (error) {
        console.error("Error adding service:", error);
        this.message = "An error occurred while adding the service.";
        this.success = false;
      } finally {
        this.loading = false;
      }
    },
  },
};

export default AdminAddService;
