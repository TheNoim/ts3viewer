<template>
    <v-app light>
        <v-toolbar>
            <v-toolbar-title>Teamspeak Viewer</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items class="hidden-sm-and-down">
                <v-btn flat color="accent" v-bind:disabled="loading" @click="loadData()">Reload</v-btn>
            </v-toolbar-items>
        </v-toolbar>
        <!--<v-content>-->
            <!--<v-container fluid>-->
                <transition name="fade">
                    <!--<div class="elevation-1" v-if="!loading">-->
                        <!--<v-container column align-content-center justify-center fill-height>-->
                            <tree v-bind:channels="channelTree"></tree>
                        <!--</v-container>-->
                    <!--</div>-->
                </transition>
                <transition name="fade">
                    <v-container column align-content-center justify-center fill-height v-if="loading">
                        <v-progress-circular indeterminate></v-progress-circular>
                    </v-container>
                </transition>
            <!--</v-container>-->
        <!--</v-content>-->
    </v-app>
</template>

<script>
    import tree from './Tree';
    import axios from 'axios';

	export default {
		components: {tree},
		name: "index",
        data() {
			return {
				loading: true,
                channelTree: []
            };
        },
        mounted() {
            this.loadData();
        },
        methods: {
			async loadData() {
				this.$set(this.$data, 'channelTree', []);
				this.$set(this.$data, 'loading', true);
				const {data: tree} = await axios.get('/channelTree');
				this.$set(this.$data, 'channelTree', tree);
				this.$set(this.$data, 'loading', false);
            }
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