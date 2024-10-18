<template>
  <div class="admin-dashboard" role="main">
    <div class="container mt-5 mb-5">
      <div class="row">
        <div class="col-md-10 offset-md-1">
          <h1 class="text-center">SilverHealth Admin Dashboard</h1>
          <p class="text-center" role="doc-subtitle">
            Manage users, articles, events, and communications.
          </p>
        </div>

        <!-- Loading indicator -->
        <div v-if="loading" class="text-center my-4" aria-live="polite">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else-if="error" class="alert alert-danger" role="alert" aria-live="assertive">
          {{ error }}
        </div>

        <nav v-else class="card-grid" aria-label="Admin functions">
          <div v-for="card in cards" :key="card.title" class="card-wrapper">
            <router-link
              :to="card.link"
              class="card-link"
              :aria-label="`${card.title}: ${card.description}`"
            >
              <div
                class="card"
                :class="card.bgClass"
                role="region"
                :aria-labelledby="`card-title-${card.title.replace(/\s+/g, '-').toLowerCase()}`"
              >
                <div class="card-content">
                  <div class="card-icon" aria-hidden="true">
                    <i :class="card.icon"></i>
                  </div>
                  <h2 :id="`card-title-${card.title.replace(/\s+/g, '-').toLowerCase()}`">
                    {{ card.title }}
                  </h2>
                  <p>{{ card.description }}</p>
                  <div v-if="card.stats" class="stats" aria-live="polite">
                    <strong>{{ card.stats.main }}</strong>
                    <small>{{ card.stats.sub }}</small>
                  </div>
                </div>
              </div>
            </router-link>
          </div>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useToast } from 'primevue/usetoast'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase/init'

const statistics = ref(null)
const loading = ref(true)
const error = ref(null)
const toast = useToast()

const fetchStatistics = async (token) => {
  try {
    loading.value = true
    error.value = null
    const config = {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }
    const response = await axios.get('https://getwebsitestatistics-s3vwdaiioq-ts.a.run.app', config)
    statistics.value = response.data
  } catch (err) {
    console.error('Error fetching website statistics:', err)
    error.value = 'Failed to fetch website statistics. Please try again later.'
    toast.add({ severity: 'error', summary: 'Error', detail: error.value, life: 3000 })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const token = await user.getIdToken()
      fetchStatistics(token)
    } else {
      fetchStatistics(null)
    }
  })
})

const cards = computed(() => {
  if (!statistics.value) return []

  return [
    {
      title: 'User Analytics',
      description: 'Manage and analyze user data',
      link: '/admin/user-analytics',
      bgClass: 'bg-blue',
      icon: 'bi bi-people',
      stats: {
        main: `${statistics.value.totalUsers} Total Users`,
        sub: `${statistics.value.normalUsers} Normal Users, ${statistics.value.adminUsers} Admin`
      }
    },
    {
      title: 'Article Management',
      description: 'Manage articles and ratings',
      link: '/admin/article-management',
      bgClass: 'bg-green',
      icon: 'bi bi-file-text',
      stats: {
        main: `${statistics.value.totalArticles} Articles`,
        sub: `${statistics.value.totalRatings} Ratings`
      }
    },
    {
      title: 'Event Management',
      description: 'Manage events and bookings',
      link: '/admin/event-management',
      bgClass: 'bg-orange',
      icon: 'bi bi-calendar3',
      stats: {
        main: `${statistics.value.totalEvents} Events`,
        sub: `${statistics.value.totalEventBookings} Bookings`
      }
    },
    {
      title: 'Bulk Email Management',
      description: 'Manage and send bulk emails',
      link: '/admin/bulk-email-management',
      bgClass: 'bg-purple',
      icon: 'bi bi-envelope'
    }
  ]
})
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
  position: relative;
}

.card-link:focus,
.card-link:hover {
  text-decoration: none;
  color: inherit;
}

.card-link:focus {
  outline: 3px solid #6ac1ff;
  outline-offset: 3px;
}

.card-link:focus::after {
  content: '⌨';
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 1.5rem;
  color: #6ac1ff;
}

.card {
  height: 100%;
  padding: 1.5rem;
  border-radius: 8px;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease,
    background-color 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.card-link:focus .card {
  background-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.5);
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
