<template>
    <v-app v-bind:dark="this.$root.$data.darkMode">
        <v-layout column>
            <div>
                <v-toolbar dense fixed>
                    <v-toolbar-title v-html="title"></v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-switch v-model="darkMode" label="Dark Mode" hide-details class="darkModeSwitch"></v-switch>
                    <v-toolbar-items class="hidden-sm-and-down">
                        <v-btn flat color="accent" v-bind:disabled="loading" @click="loadData()">Reload</v-btn>
                    </v-toolbar-items>
                    <v-btn icon @click="loadData()" class="hidden-md-and-up">
                        <v-icon>refresh</v-icon>
                    </v-btn>
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
            <v-footer fixed>
                <div>Teamspeak 3 Viewer {{version}} by TheNoim</div>
                <v-spacer></v-spacer>
                <div v-html="customFooterText"></div>
            </v-footer>
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
				channelTree: [],
                darkMode: this.$root.$data.darkMode,
                title: this.$root.$data.title,
                version: this.$root.$data.version,
				customFooterText: this.$root.$data.customFooterText
			};
		},
		mounted() {
			this.loadData();
			this.socket();
			this.darkModeEvent();
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
            },
            darkModeEvent() {
				this.$watch('darkMode', () => {
					this.$root.$set(this.$root.$data, 'darkMode', this.$data.darkMode);
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

    .darkModeSwitch {
        max-width: 125px;
    }
</style>