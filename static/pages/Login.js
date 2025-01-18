import router from "../utils/router.js";

const Login = {
  template: `
  <div class="d-flex justify-content-center align-items-center vh-100">
    <div class="card shadow p-4 border rounded-3">
      <h3 class="card-title text-center mb-4">Login</h3>
      
      <div class="form-group mb-3">
        <input v-model="email" type="email" class="form-control" placeholder="Email" required />
      </div>
      
      <div class="form-group mb-4">
        <input v-model="password" type="password" class="form-control" placeholder="Password" required />
      </div>

      <button class="btn btn-primary w-100 mb-3" @click="submitInfo">Submit</button>
      
      <div v-if="errorr" class="alert alert-danger text-center mt-2">
        {{ errorr }}
      </div>
    </div>
  </div>
  `,
  data() {
    return {
      email: "",
      password: "",
      errorr: "",
    };
  },
  methods: {
    async submitInfo() {
      const url = window.location.origin;
      const res = await fetch(url + "/user-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: this.email, password: this.password }),
      });

      if (res.ok) {
        const data = await res.json();

        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("role", data.role);
        sessionStorage.setItem("email", data.email);
        sessionStorage.setItem("id", data.id);

        console.log(sessionStorage.getItem("role"));

        // add data to vuex
        this.$store.commit("setRole", data.role);
        this.$store.commit("setLogin", true);

        switch (data.role) {
          case "admin":
            this.$router.push("/dashboard-admin");
            break;
          case "professional":
            this.$router.push("/dashboard-prof");
            break;
          case "customer":
            this.$router.push("/dashboard-cust");
        }
      } else {
        console.error("Login Failed");
        this.errorr = "wrong email or password"

        // Set a timeout to clear the error message after 3 seconds
        setTimeout(() => {
          this.errorr = "";
        }, 3000);
      }
    },
  },
};

export default Login;
