<template>
  <div class="container mt-5 mb-5">
    <div class="row">
      <div class="col-md-10 offset-md-1">
        <h1 class="text-center">Articles</h1>
        <ul>
          <li v-for="article in articles" :key="article.articleId">
            <router-link :to="{ name: 'ArticleDetail', params: { articleId: article.articleId } }">
              <strong>{{ article.title }}</strong> by {{ article.author }} -
              {{ formatDate(article.publicationTime) }}
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchAllArticles } from '@/services/articleService'

const articles = ref([])

const fetchArticles = async () => {
  try {
    articles.value = await fetchAllArticles()
  } catch (error) {
    console.error('Error fetching articles:', error)
  }
}

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString()
}

onMounted(fetchArticles)
</script>
