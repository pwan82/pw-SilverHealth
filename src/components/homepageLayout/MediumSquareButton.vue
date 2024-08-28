<template>
    <button :class="buttonClass" :style="buttonStyle" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave"
        aria-label="button">
        <slot name="icon" />
        <span class="ms-2">{{ text }}</span>
    </button>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface ButtonProps {
    text: string;
    color: string;
    width: string;
}

const props = defineProps<ButtonProps>();

// State to manage hover effect
const isHovered = ref(false);

// Compute button class and style based on props
const buttonClass = computed(() =>
    `btn border border-${props.color} d-flex align-items-center justify-content-center`
);

const buttonStyle = computed(() => ({
    color: isHovered.value ? `var(--bs-${props.color}-dark)` : `var(--bs-${props.color})`,
    borderColor: `var(--bs-${props.color})`,
    width: props.width,
    backgroundColor: isHovered.value ? `var(--bs-${props.color}-light)` : 'transparent',
    transition: 'background-color 0.3s ease, color 0.3s ease',
}));

const onMouseEnter = () => {
    isHovered.value = true;
};

const onMouseLeave = () => {
    isHovered.value = false;
};
</script>

<style scoped>
button {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    cursor: pointer;
    outline: none;
}

button:focus {
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.5);
    /* Bootstrap focus shadow */
}

@media (prefers-color-scheme: dark) {
    button {
        border-color: var(--bs-light);
        color: var(--bs-light);
    }

    button:hover {
        background-color: var(--bs-light);
        color: var(--bs-dark);
    }
}
</style>
