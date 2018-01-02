<template>
    <v-app v-bind:dark="this.$root.$data.darkMode" fill-height v-scroll="onScroll">
        <v-layout column fill-height>
            <div :style="aStyle">
                <v-toolbar dense fixed extended>
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
            <div class="main" fill-height>
                <transition name="fade">
                    <user v-if="user && !loading" :user="user" :scroll="scroll"></user>
                </transition>
                <transition name="fade">
                    <v-container class="makeItBigger zUp2" column align-content-center justify-center fill-height
                                 v-if="loading">
                        <div class="display-1 zUp2">Load user data..</div>
                        <v-progress-circular class="zUp2" indeterminate></v-progress-circular>
                    </v-container>
                </transition>
            </div>
            <v-footer fixed class="footer">
                <div>Teamspeak 3 Viewer {{version}} by TheNoim</div>
                <v-spacer></v-spacer>
                <div v-html="customFooterText"></div>
            </v-footer>
        </v-layout>
    </v-app>
</template>

<script>
	import axios from 'axios';
	import user from './user';

	export default {
		components: {user},
		name: "index",
		data() {
			return {
				loading: true,
				user: null,
				darkMode: this.$root.$data.darkMode,
				title: this.$root.$data.title,
				version: this.$root.$data.version,
				customFooterText: this.$root.$data.customFooterText,
                scroll: 0,
				aStyle: ''
			};
		},
		mounted() {
			this.loadData();
			this.darkModeEvent();
		},
		methods: {
			async loadData() {
				// TODO ERROR HANDLING
				if (this.getParameterByName('dbid') || this.getParameterByName('uid')) {
					this.$set(this.$data, 'loading', true);
					const {data: user} = await axios.get(`/user/${this.getParameterByName('dbid') ? 'dbid' : 'uid'}/${this.getParameterByName('dbid') || this.getParameterByName('uid')}`);
					if (typeof user === 'object' && user['dbid']) {
						this.$set(this.$data, 'loading', false);
						this.$set(this.$data, 'user', user);
					}
				}
			},
			darkModeEvent() {
				this.$watch('darkMode', () => {
					this.$root.$set(this.$root.$data, 'darkMode', this.$data.darkMode);
				});
			},
			getParameterByName(name, url) {
				if (!url) url = window.location.href;
				name = name.replace(/[\[\]]/g, "\\$&");
				var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
					results = regex.exec(url);
				if (!results) return null;
				if (!results[2]) return '';
				return decodeURIComponent(results[2].replace(/\+/g, " "));
			},
            onScroll(e) {
	            const s = window.pageYOffset || document.documentElement.scrollTop;
	            this.$set(this.$data, 'scroll', s);
	            //this.$set(this.$data, 'customFooterText', s);
	            // y=mx+b
	            let w = -0.01428*s+2.86;
	            if (w <= 0) w = 0;
	            if (w > 1) w = 1;
	            this.$set(this.$data, 'aStyle', `opacity: ${w};`)
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
        z-index: 9999998;
        pointer-events: none;
    }

    .darkModeSwitch {
        max-width: 125px;
    }

    .zUp {
        z-index: 9999998;
    }

    .zUp2 {
        z-index: 9999999;
    }

    .makeItBigger {
        min-height: 80vh;
    }

    .footer {
        z-index: 99999989;
    }
</style>