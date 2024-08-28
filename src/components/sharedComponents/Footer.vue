<template>
  <div class="footer-background">
    <div class="container py-4">
      <div class="row mb-3 align-items-center">
        <!-- Button section -->
        <div class="col-md-6 d-flex flex-column flex-md-row align-items-start mb-3 mb-md-0 gap-4">
          <FirstAidGuideButton class="w-100" style="max-width: 200px;" />
          <DonateButton class="w-100" style="max-width: 200px;" />
        </div>

        <!-- Subscribe section -->
        <div class="col-md-6 d-flex flex-column align-items-md-end align-items-start">
          <span class="mb-2">Subscribe our newsletter</span>
          <div class="d-flex w-100 justify-content-md-end gap-2">
            <input type="email" class="form-control flex-grow-1" placeholder="Email Address" style="max-width: 300px" />
            <button type="button" class="btn btn-dark">Subscribe</button>
          </div>
        </div>
      </div>

      <!-- Link and copyright section -->
      <div class="row align-items-end">
        <div class="col-md-8 d-flex align-items-end">
          <ul class="list-inline mb-0">
            <li class="list-inline-item">
              <router-link to="/get-involved/become-a-volunteer">Become a volunteer</router-link>
            </li>
            <li class="list-inline-item non-selectable">|</li>
            <li class="list-inline-item"><router-link to="/about/sitemap">Sitemap</router-link></li>
            <li class="list-inline-item non-selectable">|</li>
            <li class="list-inline-item">
              <router-link to="/about/contact-us">Contact us</router-link>
            </li>
            <li class="list-inline-item non-selectable">|</li>
            <li class="list-inline-item"><router-link to="/about/">About us</router-link></li>
            <li class="list-inline-item non-selectable">|</li>
            <li class="list-inline-item">
              <router-link to="/about/terms-and-policy">Terms and policy</router-link>
            </li>
          </ul>
        </div>
        <div class="col-md-4 d-flex align-items-end justify-content-end text-end">
          <p class="mb-0" style="font-size: small">
            SilverHealth Australia Limited.<br />ABN 10 000 000 000.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import FirstAidGuideButton from './buttons/FirstAidGuideButton.vue'
import DonateButton from './buttons/DonateButton.vue'
</script>

<style scoped>
.footer-background {
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
  width: 100%;
  padding-top: 10px;
}

.list-inline-item a {
  text-decoration: none;
}

.list-inline-item a:hover {
  text-decoration: underline;
}

.non-selectable {
  user-select: none;
}
</style>
