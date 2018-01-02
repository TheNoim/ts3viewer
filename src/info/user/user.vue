<template>
    <div>
        <v-layout v-if="user.hasAvatar" align-center justify-center column fill-width wrap>
            <v-avatar :size="'256'" class="elevation-5 userStyle avatarStyle" :tile="true">
                <img :src="`/avatar/dbid/${user.dbid}`" class="clientAvatar" :alt="`${user.nickname} avatar`"/>
            </v-avatar>
            <h1>{{user.nickname}}</h1>
        </v-layout>
        <v-divider></v-divider>
    </div>
</template>

<script>
    export default {
        name: "user",
        props: ['user']
    }
</script>

<style scoped>
    .clientAvatar {
        object-fit: fill;
    }

    .userStyle {
        z-index: 9999999;
        background-color: white;
    }

    .avatarStyle {
        padding-top: -100px;
    }
</style>