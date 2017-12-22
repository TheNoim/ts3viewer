<template>
    <v-app dark>
        <v-layout column>
            <div>
                <v-toolbar dense fixed>
                    <v-toolbar-title>Teamspeak Viewer</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-toolbar-items class="hidden-sm-and-down">
                        <v-btn flat color="accent" v-bind:disabled="loading" @click="loadData()">Reload</v-btn>
                    </v-toolbar-items>
                    <v-toolbar-items class="hidden-md-and-up">
                        <v-btn icon @click="loadData()">
                            <v-icon>refresh</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>
            </div>
            <div class="main">
                <transition name="fade">
                    <tree v-bind:channels="channelTree"></tree>
                </transition>
                <transition name="fade">
                    <v-container column align-content-center justify-center fill-height v-if="loading">
                        <div class="display-1">Load channel tree...</div>
                        <v-progress-circular indeterminate></v-progress-circular>
                    </v-container>
                </transition>
            </div>
            <!--<v-footer fixed></v-footer>-->
        </v-layout>
    </v-app>
</template>

<script>
	import tree from './Tree';
	import axios from 'axios';
	import io from 'socket.io-client';

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
			this.socket();
		},
		methods: {
			async loadData() {
				// this.$set(this.$data, 'channelTree', []);
				// this.$set(this.$data, 'loading', true);
				const {data: tree} = await axios.get('/channelTree');
				this.$set(this.$data, 'channelTree', tree);
				this.$set(this.$data, 'loading', false);
			},
            socket() {
	            const socket = io();
	            socket.on('update', () => {
	            	this.loadData();
                });
            }
		}
	}
</script>

<style scoped>
    .fade-enter-active, .fade-leave-active {
        transition: opacity .5s
    }

    .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */
    {
        opacity: 0
    }

    .main {
        padding-top: 48px;
        padding-bottom: 36px;
    }
</style>