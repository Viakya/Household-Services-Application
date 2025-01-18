import router from "../utils/router.js";

const Signup = {
  template: `
  <div class="d-flex justify-content-center align-items-center vh-100">
    <div class="card shadow p-4">
      <h3 class="card-title text-center mb-4">Sign Up</h3>
      <div class="form-group mb-3">
        <input v-model="name" type="text" class="form-control" placeholder="Name" required />
      </div>
      <div class="form-group mb-3">
        <input v-model="email" type="email" class="form-control" placeholder="Email" required />
      </div>
      <div class="form-group mb-4">
        <input v-model="password" type="password" class="form-control" placeholder="Password" required />
      </div>
      <div class="form-group mb-4">
        <input v-model="pincode" type="text" class="form-control" placeholder="Pincode" required />
      </div>
      <div class="form-group mb-4">
        <select v-model="role" class="form-control">
          <option value="customer">Customer</option>
          <option value="professional">Professional</option>
        </select>
      </div>

      <!-- Conditional fields for "Professional" role -->
      <div v-if="role === 'professional'" class="form-group mb-4">
        <input v-model="experience" type="number" class="form-control" placeholder="Years of Experience" />
      </div>
      <div v-if="role === 'professional'" class="form-group mb-4">
          <select v-model="service" class="form-control">
          <option v-for="service in services" :key="service" :value="service">
            {{ service }}
          </option>
        </select>
      </div>

      <button class="btn btn-primary w-100" @click="submitInfo">Submit</button>
  `,
  data() {
    return {
      name: "",
      email: "",
      password: "",
      pincode: "",
      role: "",
      experience: "",
      service: "",
      services: [],
    };
  },
  mounted() {
    // Fetch services once when component mounts if role is already set to 'professional'
    if (this.role === 'professional') {
      this.fetchServices();
    }
  },
  watch: {
    // Watch for changes in the role and fetch services when role is 'professional'
    role(newRole) {
      if (newRole === 'professional') {
        this.fetchServices();
      }
    },
  },
  methods: {
    async fetchServices() {
      if (this.role === 'professional') {
        const origin = window.location.origin;
        const url = `${origin}/services`; // The endpoint to get the list of services
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (res.ok) {
          const data = await res.json();
          this.services = data; // Set the fetched services
        } else {
          console.error('Failed to fetch services');
        }
      }
    },
    async submitInfo() {
      const origin = window.location.origin;
      const url = `${origin}/register`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: this.name,
          email: this.email,
          password: this.password,
          pincode: this.pincode,
          role: this.role,
          experience: this.experience,
          service: this.service,
        }),
        credentials: "same-origin",
      });
      if (res.ok) {
        const data = await res.json();
        console.log(data);
        // Handle successful sign up, e.g., redirect or store token
        router.push("/login");
      } else {
        const errorData = await res.json();
        console.error("Sign up failed:", errorData);
        // Handle sign up error
      }
    },
  },
};

export default Signup;
