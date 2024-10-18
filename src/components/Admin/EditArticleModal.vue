<template>
  <div
    class="modal fade"
    id="editArticleModal"
    tabindex="-1"
    aria-labelledby="editArticleModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="editArticleModalLabel">
            {{ isNewArticle ? 'Add New Article' : 'Edit Article' }}
          </h5>
          <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitEditArticle">
            <div class="mb-3">
              <label for="editTitle" class="form-label fw-bold">Title</label>
              <input
                type="text"
                class="form-control"
                id="editTitle"
                v-model="editArticleData.title"
                required
              />
            </div>
            <div class="mb-3">
              <label for="editAuthor" class="form-label fw-bold">Author</label>
              <input
                type="text"
                class="form-control"
                id="editAuthor"
                v-model="editArticleData.author"
                required
              />
            </div>
            <div class="mb-3">
              <label for="editBody" class="form-label fw-bold">Body</label>
              <textarea
                class="form-control"
                id="editBody"
                v-model="editArticleData.body"
                rows="10"
                placeholder="in Markdown format, heading level up to 2 ##"
                required
              ></textarea>
            </div>
            <div class="mb-3">
              <label for="editCategory" class="form-label">
                <span class="fw-bold">Category</span> (separate by commas)
              </label>
              <input
                type="text"
                class="form-control"
                id="editCategory"
                v-model="editArticleData.categoryString"
                required
              />
            </div>
            <div class="mb-3">
              <label for="editPublicationTime" class="form-label fw-bold">Publication Time</label>
              <input
                type="datetime-local"
                class="form-control"
                id="editPublicationTime"
                v-model="editArticleData.publicationTime"
                required
              />
            </div>

            <div class="mb-3 form-check">
              <input
                type="checkbox"
                class="form-check-input"
                id="editIsVisible"
                v-model="editArticleData.isVisible"
              />
              <label class="form-check-label fw-bold" for="editIsVisible"
                >Is visible to users</label
              >
            </div>
            <div class="mb-3 form-check">
              <input
                type="checkbox"
                class="form-check-input"
                id="editShowInList"
                v-model="editArticleData.showInList"
              />
              <label class="form-check-label fw-bold" for="editShowInList"
                >Show in list for users</label
              >
            </div>

            <div class="mb-3 form-check">
              <input
                type="checkbox"
                class="form-check-input"
                id="editRequireAuth"
                v-model="editArticleData.requireAuth"
              />
              <label class="form-check-label fw-bold" for="editRequireAuth">Require auth</label>
            </div>

            <div class="mb-3 form-check">
              <input
                type="checkbox"
                class="form-check-input"
                id="editShowMetadata"
                v-model="editArticleData.showMetadata"
              />
              <label class="form-check-label fw-bold" for="editShowMetadata">Show metadata</label>
            </div>
            <div class="mb-3 form-check">
              <input
                type="checkbox"
                class="form-check-input"
                id="editShowCategory"
                v-model="editArticleData.showCategory"
              />
              <label class="form-check-label fw-bold" for="editShowCategory">Show category</label>
            </div>
            <div class="mb-3 form-check">
              <input
                type="checkbox"
                class="form-check-input"
                id="editIsRatable"
                v-model="editArticleData.isRatable"
              />
              <label class="form-check-label fw-bold" for="editIsRatable"
                >Allow for comments and ratings</label
              >
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button
            type="submit"
            class="btn"
            :class="{
              'btn-primary': isFormChanged,
              'btn-secondary': !isFormChanged
            }"
            :disabled="!isFormChanged"
            @click="submitEditArticle"
          >
            {{ isNewArticle ? 'Add New Article' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Modal } from 'bootstrap'
import axios from 'axios'
import { useToast } from 'primevue/usetoast'
import { auth } from '@/firebase/init'

const props = defineProps({
  article: {
    type: Object,
    required: true
  },
  show: {
    type: Boolean,
    default: false
  },
  isNewArticle: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show', 'article-updated'])

const toast = useToast()
const editArticleData = ref({
  title: '',
  author: '',
  body: '',
  categoryString: '',
  publicationTime: '',
  isRatable: true,
  isVisible: true,
  requireAuth: false,
  showCategory: true,
  showInList: true,
  showMetadata: true
})

const originalArticleData = ref({})

const isFormChanged = computed(() => {
  return JSON.stringify(editArticleData.value) !== JSON.stringify(originalArticleData.value)
})

let modalInstance = null

const initializeModal = () => {
  const modalElement = document.getElementById('editArticleModal')
  modalInstance = new Modal(modalElement)
  modalElement.addEventListener('hidden.bs.modal', () => {
    emit('update:show', false)
  })
}

const showModal = () => {
  if (modalInstance) {
    modalInstance.show()
  }
}

const closeModal = () => {
  if (modalInstance) {
    modalInstance.hide()
  }
}

watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      const articleData = {
        ...props.article,
        publicationTime: new Date(props.article.publicationTime).toISOString().slice(0, 16),
        categoryString: Array.isArray(props.article.category)
          ? props.article.category.join(', ')
          : props.article.category
      }
      editArticleData.value = { ...articleData }
      originalArticleData.value = { ...articleData }
      showModal()
    } else {
      closeModal()
    }
  }
)

const submitEditArticle = async () => {
  try {
    const updatedArticleData = {
      author: editArticleData.value.author,
      title: editArticleData.value.title,
      body: editArticleData.value.body,
      category: editArticleData.value.categoryString.split(',').map((cat) => cat.trim()),
      isRatable: editArticleData.value.isRatable,
      isVisible: editArticleData.value.isVisible,
      requireAuth: editArticleData.value.requireAuth,
      showCategory: editArticleData.value.showCategory,
      showInList: editArticleData.value.showInList,
      showMetadata: editArticleData.value.showMetadata,
      publicationTime: new Date(editArticleData.value.publicationTime).getTime(),
      modificationTime: Date.now(),
      averageRating: editArticleData.value.averageRating || 0
    }

    const requestData = props.isNewArticle
      ? { articleData: updatedArticleData }
      : { articleId: props.article.articleId, articleData: updatedArticleData }

    const response = await axios.post(
      'https://managearticle-s3vwdaiioq-ts.a.run.app',
      requestData,
      {
        headers: {
          Authorization: `Bearer ${await auth.currentUser.getIdToken()}`
        }
      }
    )

    if (response.status === 200) {
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: props.isNewArticle
          ? 'Article created successfully'
          : 'Article updated successfully',
        life: 3000
      })
      emit('article-updated')
      closeModal()
    }
  } catch (error) {
    console.error('Error updating/creating article:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data || 'Failed to update/create article',
      life: 3000
    })
  }
}

onMounted(() => {
  initializeModal()
})

onUnmounted(() => {
  if (modalInstance) {
    modalInstance.dispose()
  }
})
</script>
