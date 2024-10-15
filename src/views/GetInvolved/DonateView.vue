<template>
  <ArticleDetailView :articleId="articleId" />
</template>

<script setup>
import ArticleDetailView from '@/views/Article/ArticleDetailView.vue'

const articleId = 6
</script>
