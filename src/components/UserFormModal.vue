<template>
    <div v-if="show" class="modal-backdrop fade show"></div>

    <div class="modal fade" :class="{ 'show d-block': show }" tabindex="-1" role="dialog" aria-hidden="true" @click.self="handleClose">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ isEditMode ? 'Edit User' : 'Create New User' }}</h5>
                    <button type="button" class="close" @click="handleClose" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div v-if="formErrors.passwordMismatch" class="alert alert-danger" role="alert">
                        {{ formErrors.passwordMismatch }}
                    </div>
                    <form @submit.prevent="handleSubmit">
                        <div class="form-group mb-3">
                            <label for="username">Username</label>
                            <input type="text" class="form-control" id="username" v-model="userForm.username" required>
                        </div>
                        <div v-if="!isEditMode" class="form-group mb-3">
                            <label for="password">Password</label>
                            <input type="password" class="form-control" id="password" v-model="userForm.password" required>
                        </div>
                        <div v-if="!isEditMode" class="form-group mb-3">
                            <label for="confirmPassword">Repeat Password</label>
                            <input type="password" class="form-control" id="confirmPassword" v-model="userForm.confirmPassword" required>
                        </div>
                        <div class="form-group form-check mb-3">
                            <input type="checkbox" class="form-check-input" id="is_admin" v-model="userForm.is_admin">
                            <label class="form-check-label" for="is_admin">Administrator?</label>
                        </div>
                        
                        <button type="submit" class="btn btn-primary">
                            {{ isEditMode ? 'Update User' : 'Create User' }}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    userToEdit: {
        type: Object,
        default: null
    }
});

const emits = defineEmits(['close', 'userSaved']);

const userForm = ref({
    id: null,
    username: '',
    password: '',
    confirmPassword: '',
    is_admin: false
});

const isEditMode = computed(() => !!props.userToEdit);
const formErrors = ref({});

const resetForm = () => {
    userForm.value = {
        id: null,
        username: '',
        password: '',
        confirmPassword: '',
        is_admin: false
    };
    formErrors.value = {};
};

watch(() => props.userToEdit, (newUser) => {
    if (newUser) {
        userForm.value = {
            id: newUser.id,
            username: newUser.username,
            password: '',
            confirmPassword: '',
            is_admin: newUser.is_admin
        };
    } else {
        resetForm();
    }
});

const handleSubmit = () => {
    formErrors.value = {};

    if (!isEditMode.value && userForm.value.password !== userForm.value.confirmPassword) {
        formErrors.value.passwordMismatch = 'Passwords do not match.';
        return;
    }

    const payload = {
        username: userForm.value.username,
        is_admin: userForm.value.is_admin
    };
    if (userForm.value.password) {
        payload.password = userForm.value.password;
    }

    emits('userSaved', payload); // Emit the payload directly
};

const handleClose = () => {
    resetForm();
    emits('close');
};
</script>

<style scoped>
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1040;
}
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    outline: 0;
    z-index: 1050;
    display: none;
}
.modal.show.d-block {
    display: block !important;
}
.close {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1;
    color: #000;
    text-shadow: 0 1px 0 #fff;
    opacity: .5;
}
.close:hover {
    color: #000;
    text-decoration: none;
    opacity: .75;
}
</style>