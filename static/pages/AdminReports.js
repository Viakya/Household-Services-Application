import router from "../utils/router.js";

const AdminReports = {
  template: `
    <div class="admin-reports container py-5">
      <h1 class="text-center mb-4">Admin Reports</h1>
      
      <div v-if="pdfs.length" class="row g-3">
        <div 
          v-for="pdf in pdfs" 
          :key="pdf" 
          class="col-12 col-md-6 col-lg-4"
        >
          <div class="card shadow-sm border-0 h-100">
            <div class="card-body d-flex flex-column justify-content-between">
              <h5 class="card-title text-truncate" title="Click to Download">{{ pdf }}</h5>
              <button 
                @click="downloadPDF(pdf)" 
                class="btn btn-primary w-100 mt-3"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center">
        <p class="text-muted">No reports available.</p>
      </div>
    </div>
  `,
  data() {
    return {
      pdfs: [],
    };
  },
  mounted() {
    this.fetchAdminReports();
  },
  methods: {
    fetchAdminReports() {
      // Fetch the list of PDFs available for the admin
      fetch("/api/get-admin-pdfs")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch reports");
          }
          return response.json();
        })
        .then((data) => {
          this.pdfs = data.pdfs;
        })
        .catch((error) => {
          console.error("Error fetching admin reports:", error);
        });
    },
    downloadPDF(pdfFilename) {
      const encodedFilename = encodeURIComponent(pdfFilename);
      const url = `/api/download-admin-pdf/${encodedFilename}`;

      // Use fetch to trigger the download in the background
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error("File download failed");
          }
          return response.blob();
        })
        .then((blob) => {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = pdfFilename;
          link.click();
          URL.revokeObjectURL(link.href); // Clean up
        })
        .catch((error) => {
          console.error("Error downloading file:", error);
        });
    },
  },
};

export default AdminReports;
