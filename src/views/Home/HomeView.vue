<template>
  <div class="home">
    <div class="container mt-5 mb-5">
      <div class="row">
        <div class="col-md-10 offset-md-1">
          <h1 class="text-center">Welcome to SilverHealth✨!</h1>
          <p class="text-center">Explore health information and services for the elderly.</p>
        </div>
        <div class="card-grid">
          <div v-for="card in cards" :key="card.title" class="card-wrapper">
            <router-link :to="card.link" class="card-link">
              <div class="card" :class="card.bgClass">
                <div class="card-content">
                  <div class="card-icon">
                    <i :class="card.icon"></i>
                  </div>
                  <h2>{{ card.title }}</h2>
                  <p>{{ card.description }}</p>
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const isLoggedIn = ref(authStore.isLoggedIn)

const cards = ref([
  {
    title: 'SilverHealth Articles & News',
    description: 'Stay informed with our latest health articles for seniors.',
    link: '/article',
    bgClass: 'bg-blue',
    icon: 'bi bi-newspaper'
  },
  {
    title: 'Community Events',
    description: 'Join local events and connect with your community.',
    link: '/event',
    bgClass: 'bg-green',
    icon: 'bi bi-broadcast'
  },
  {
    title: 'Find Services Near You',
    description: 'Discover health services and support in your area.',
    link: '/get-support/find-services',
    bgClass: 'bg-orange',
    icon: 'bi bi-geo-alt'
  },
  {
    title: 'Event Calendar',
    description:
      (isLoggedIn.value ? '' : 'Please login first. ') + 'View and manage your registered events.',
    link: '/event/registered',
    bgClass: 'bg-purple',
    icon: 'bi bi-calendar3'
  }
])
</script>

<style scoped>
.card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}

.card-wrapper {
  height: 100%;
}

.card-link {
  display: block;
  height: 100%;
  text-decoration: none;
  color: inherit;
  outline: none;
}

.card-link:focus,
.card-link:hover {
  text-decoration: none;
  color: inherit;
}

.card {
  height: 100%;
  padding: 1.5rem;
  border-radius: 8px;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.card h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.card p {
  font-size: 1rem;
  margin-bottom: 0;
}

.bg-blue {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

.bg-green {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
}

.bg-orange {
  background: linear-gradient(135deg, #e67e22, #d35400);
  color: white;
}

.bg-purple {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  color: white;
}
</style>
