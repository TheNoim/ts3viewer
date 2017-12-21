<template>
    <v-app light>
        <v-toolbar>
            <v-toolbar-title>Teamspeak Viewer</v-toolbar-title>
        </v-toolbar>
        <v-content>
            <v-container fluid>
                <transition name="fade">
                    <div class="elevation-1" v-if="!this.$data.loading">
                        <v-container column align-content-center justify-center fill-height>
                            <v-progress-circular indeterminate></v-progress-circular>
                        </v-container>
                    </div>
                    <v-container column align-content-center justify-center fill-height v-if="this.$data.loading">
                        <v-progress-circular indeterminate></v-progress-circular>
                    </v-container>
                </transition>
            </v-container>
        </v-content>
    </v-app>
</template>

<script>
    import tree from './Tree';

	export default {
		components: {tree},
		name: "index",
        data: {
			loading: true
        }
	}
</script>

<style scoped>
    .fade-enter-active, .fade-leave-active {
        transition: opacity .5s
    }
    .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
        opacity: 0
    }
</style>