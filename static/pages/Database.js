import router from "../utils/router.js";

const Database = {
  template: `
  <div class="container-fluid mt-4">
      <div class="row">
        <!-- Sidebar -->
        <div class="col-md-2 sidebar">
          <ul class="list-group">
            <li 
              class="list-group-item list-group-item-action text-truncate" 
              v-for="table in tables" 
              :key="table"
              @click="fetchTableData(table)"
              :class="{ active: selectedTable === table }">
              <i class="bi bi-table me-2"></i>{{ table }}
            </li>
          </ul>
        </div>

        <!-- Main Content -->
        <div class="col-md-10">
          <h3 v-if="selectedTable" class="text-center mb-3">Data for {{ selectedTable }}</h3>
          
          <div v-if="loading" class="text-center">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>

          <div v-if="!loading && tableData.length === 0 && selectedTable" class="text-center">
            <p>No data found for {{ selectedTable }}.</p>
          </div>

          <div v-if="!loading && tableData.length > 0" class="table-responsive">
            <table class="table table-bordered table-striped">
              <thead>
                <tr>
                  <th v-for="column in columns" :key="column">{{ column }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in tableData" :key="row.id">
                  <td v-for="value in row" :key="value">{{ value }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      tables: ["Users", "Roles", "UserRoles", "ProfessionalProfiles", "Services", "ServiceRequests"],
      selectedTable: null,
      tableData: [],
      columns: [],
      loading: false,
    };
  },
  methods: {
    async fetchTableData(table) {
      this.selectedTable = table;
      this.loading = true;
      this.tableData = [];
      this.columns = [];

      try {
        const origin = window.location.origin;
        const endpointMap = {
          Users: `${origin}/api/database-allusers`,
          Roles: `${origin}/api/database-allroles`,
          UserRoles: `${origin}/api/database-alluserroles`,
          ProfessionalProfiles: `${origin}/api/database-prof`,
          Services: `${origin}/api/database-ser`,
          ServiceRequests: `${origin}/api/database-req`,
        };

        const apiUrl = endpointMap[table];
        if (!apiUrl) {
          console.error("No API endpoint for the selected table.");
          return;
        }

        const res = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": sessionStorage.getItem("token"),
          },
        });

        if (res.ok) {
          const data = await res.json();
          this.tableData = data;
          this.columns = Object.keys(data[0] || {});
        } else {
          console.error(`Failed to fetch data for ${table}`);
        }
      } catch (error) {
        console.error("Error fetching table data:", error);
      } finally {
        this.loading = false;
      }
    },
  },
};

export default Database;
