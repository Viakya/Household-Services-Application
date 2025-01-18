import router from "../utils/router.js";

const CustReports = {
  template: `
    <div class="container py-5">
      <div class="text-center">
        <h2 class="display-5 fw-bold mb-4 text-primary">Monthly Reports </h1>
      </div>

      <div v-if="pdfs.length">
        <ul class="list-group">
          <li 
            v-for="pdf in pdfs" 
            :key="pdf" 
            class="list-group-item d-flex justify-content-between align-items-center"
          >
            <span>{{ pdf }}</span>
            <button 
              @click="downloadPDF(pdf)" 
              class="btn btn-primary btn-sm"
            >
              Download
            </button>
          </li>
        </ul>
      </div>
      <div v-else class="text-center mt-4">
        <p class="text-muted">No reports available for this user.</p>
      </div>
    </div>
  `,
  data() {
    return {
      pdfs: []
    };
  },
  mounted() {
    this.fetchUserReports();
  },
  methods: {
    fetchUserReports() {
      const userId = sessionStorage.getItem("id"); // Replace with dynamic user ID if needed

      fetch(`/api/get-user-pdfs/${userId}`)
        .then(response => response.json())
        .then(data => {
          this.pdfs = data.pdfs;
        })
        .catch(error => {
          console.error("Error fetching PDFs:", error);
        });
    },
    downloadPDF(pdfFilename) {
      const encodedFilename = encodeURIComponent(pdfFilename);
      const url = `/api/download-user-pdf/${encodedFilename}`;

      // Use fetch to trigger the download in the background
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error("File download failed");
          }
          // Create a Blob from the response
          return response.blob();
        })
        .then(blob => {
          // Create a temporary link element to trigger the download
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = pdfFilename;
          link.click();

          // Clean up the temporary object URL
          URL.revokeObjectURL(link.href);
        })
        .catch(error => {
          console.error("Error downloading file:", error);
        });
    }
  }
};

export default CustReports;
