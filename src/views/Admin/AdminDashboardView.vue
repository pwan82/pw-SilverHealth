<template>
  <div class="container mt-5 mb-5">
    <h1 class="text-center">Admin Dashboard</h1>
    <p class="text-center">
      Manage all registered users.
    </p>

    <table class="table table-striped table-bordered mt-4">
      <thead>
        <tr>
          <th>User ID</th>
          <th>Username</th>
          <th>Email</th>
          <th>Password</th>
          <th>Gender</th>
          <th>Birthday</th>
          <th>Role</th>
          <th>Address</th>
          <th>Registration Time</th>
          <th>Last Login Time</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in allUsers" :key="user.userId">
          <td>{{ user.userId }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.password }}</td>
          <td>{{ user.gender }}</td>
          <td>{{ user.birthday }}</td>
          <td>{{ user.role }}</td>
          <td>
            {{ user.address.streetAddress }},
            {{ user.address.building ? user.address.building + ',' : '' }}
            {{ user.address.suburb }},
            {{ user.address.state }},
            {{ user.address.postcode }}
          </td>
          <td>{{ new Date(user.registrationTime).toLocaleString() }}</td>
          <td>{{ user.lastLoginTime ? new Date(user.lastLoginTime).toLocaleString() : 'Never' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore();
const allUsers = computed(() => userStore.allMockUsers);
</script>

<style scoped>
/* .container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 90vw;
  margin: 0 auto;
  padding: 20px;
  border-radius: 10px;
}

.table {
  width: 100%;
} */
</style>
